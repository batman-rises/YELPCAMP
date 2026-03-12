const User = require("../models/user");

// ─── These render routes are no longer used by React ─────────────────────────
// Auth is handled via /api/auth/* in app.js directly
// Keeping stubs here so the routes file doesn't break

module.exports.renderRegister = (req, res) => res.json({ ok: true });
module.exports.renderLogin = (req, res) => res.json({ ok: true });

// ─── These are also handled via /api/auth/* now ───────────────────────────────
// Keeping stubs so routes/users.js doesn't throw on import

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.json({ user: registeredUser });
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

module.exports.login = (req, res) => {
  res.json({ user: req.user });
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Logged out" });
  });
};
