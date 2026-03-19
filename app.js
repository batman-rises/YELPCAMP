if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const User = require("./models/user");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const favoriteRoutes = require("./routes/favorites");
const aiRoutes = require("./routes/ai");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const ownerRoutes = require("./routes/owner");
// ─── Database ────────────────────────────────────────────────────────────────
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database connected"));

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();
app.set("trust proxy", 1);

// ─── CORS — must be first ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: function(origin, callback) {
      const allowed = [
        "http://localhost:5173",
        "http://localhost:4173",
        process.env.CLIENT_URL,
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json()); // for React API calls
app.use(express.urlencoded({ extended: true })); // keep for multipart fallback
app.use(express.static(path.join(__dirname, "public")));

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(mongoSanitize({ replaceWith: "_" }));

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: [
        "'self'",
        "https://api.mapbox.com/",
        "https://a.tiles.mapbox.com/",
        "https://b.tiles.mapbox.com/",
        "https://events.mapbox.com/",
        "http://localhost:5173", // Vite dev server
        "ws://localhost:5173", // Vite HMR websocket
      ],
      scriptSrc: [
        "'unsafe-inline'",
        "'self'",
        "https://api.tiles.mapbox.com/",
        "https://api.mapbox.com/",
        "https://cdnjs.cloudflare.com/",
        "https://cdn.jsdelivr.net",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://api.mapbox.com/",
        "https://api.tiles.mapbox.com/",
        "https://fonts.googleapis.com/",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com/", // Google Fonts (Fraunces, DM Sans)
      ],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/",
        "https://images.unsplash.com/",
      ],
    },
  }),
);

// ─── Session ──────────────────────────────────────────────────────────────────
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: { secret },
});

store.on("error", (e) => console.log("SESSION STORE ERROR", e));

app.use(
  session({
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: false, // changed: don't save empty sessions
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(flash());

// ─── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ─── Locals middleware (single block) ─────────────────────────────────────────
app.use(async (req, res, next) => {
  const p = req.path;
  if (p.startsWith("/api/") || p.startsWith("/health"))
    return next();
  try {
    if (req.user && req.user._id) {
      const freshUser = await User.findById(req.user._id).populate("favorites");
      res.locals.currentUser = freshUser;
    } else {
      res.locals.currentUser = null;
    }
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Health check (Render keeps service alive) ────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ─── Auth API routes (for React frontend) ─────────────────────────────────────
app.get("/api/auth/me", (req, res) => {
  if (req.user) return res.json({ user: req.user });
  res.status(401).json({ user: null });
});

app.post(
  "/api/auth/login",
  passport.authenticate("local", { failWithError: true }),
  (req, res) => res.json({ user: req.user }),
  (err, req, res, next) =>
    res.status(401).json({ message: "Invalid username or password" }),
);

app.post(
  "/api/auth/register",
  catchAsync(async (req, res) => {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registered = await User.register(user, password);
    req.login(registered, (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ user: registered });
    });
  }),
);

app.get("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("session");
    res.json({ message: "Logged out" });
  });
});

// ─── App routes ───────────────────────────────────────────────────────────────
app.use("/", userRoutes);
app.use("/api/campgrounds", campgroundRoutes);
app.use("/api/campgrounds/:id/reviews", reviewRoutes);
app.use(favoriteRoutes);
app.use(aiRoutes);
app.use(paymentRoutes);
app.use(adminRoutes);
app.use(ownerRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ error: message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serving on port ${port}`));
