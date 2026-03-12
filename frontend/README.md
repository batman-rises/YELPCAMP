# LetsCamp — React Frontend

Modern React + Vite + Tailwind CSS frontend for LetsCamp, replacing the EJS template layer.

## Tech Stack

- **React 18** + **Vite** (SPA, separate from Express backend)
- **React Router v6** (client-side routing)
- **Tailwind CSS** (utility-first styling)
- **Lucide React** (icons — no emojis)
- **Axios** (API calls with credentials)
- **Mapbox GL JS v3** (cluster map + show page map)
- Custom **AuthContext** + **ToastContext**

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create .env file
```bash
cp .env.example .env
```
Add your Mapbox token:
```
VITE_MAPBOX_TOKEN=pk.eyJ1...
```

### 3. Run the dev server
```bash
npm run dev
```
Runs on http://localhost:5173 — proxies all /api, /campgrounds, /login etc. to Express on port 3000.

### 4. Build for production
```bash
npm run build
```

---

## Backend changes required

The Express backend needs a few API-friendly adjustments to work with this React frontend:

### Add /api/auth routes

Add these endpoints to your Express app (or adapt existing ones):

```
GET  /api/auth/me        → returns { user: req.user } or 401
POST /api/auth/login     → accepts { username, password }, returns { user }
POST /api/auth/register  → accepts { username, email, password }, returns { user }
GET  /api/auth/logout    → logs out, returns 200
```

### Update campground routes to return JSON

Change all `res.render(...)` calls in controllers to `res.json(...)`:

```js
// campgrounds.index
res.json({ campgrounds, geoJSON })

// campgrounds.showCampground
res.json({ campground })

// campgrounds.createCampground
res.json({ campground })

// campgrounds.updateCampground
res.json({ campground })

// campgrounds.deleteCampground
res.json({ message: 'Deleted' })
```

### Update reviews controller to return JSON

```js
// createReview — res.json({ review })
// deleteReview — res.json({ message: 'Deleted' })
```

### Update favorites route to return JSON

```js
router.post('/campgrounds/:id/favorite', isLoggedIn, async (req, res) => {
  // ... toggle logic ...
  const freshUser = await User.findById(req.user._id).populate('favorites')
  res.json({ user: freshUser })
})

router.get('/favorites', isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites')
  res.json({ favorites: user.favorites })
})
```

### Add CORS for local development

```js
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
```

---

## Project Structure

```
src/
├── components/
│   ├── campgrounds/   CampgroundForm.jsx
│   ├── layout/        Layout, Navbar, Footer, ProtectedRoute
│   ├── maps/          ClusterMap, ShowMap
│   ├── reviews/       ReviewSection
│   └── ui/            StarRating, Skeleton, ImageCarousel
├── context/           AuthContext, ToastContext
├── lib/               api.js (axios), utils.js (cn)
├── pages/             All page components
├── App.jsx            Router
└── main.jsx           Entry point
```
