<div align="center">

<img src="https://img.shields.io/badge/LetsCamp-Explore%20India's%20Wild-2d6a4f?style=for-the-badge&logo=tent&logoColor=white" alt="LetsCamp" />

# 🏕️ LetsCamp

### _Discover. Book. Camp._

**A full-stack campground booking platform built for India's outdoor explorers.**  
Find stunning campgrounds, book your spot, and manage everything — all in one place.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-letscamp--neon.vercel.app-2d6a4f?style=for-the-badge)](https://letscamp-neon.vercel.app)
[![Backend](https://img.shields.io/badge/⚙️_API-Render-46E3B7?style=for-the-badge)](https://letscamp-backend.onrender.com/health)

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat-square&logo=razorpay)
![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)

</div>

---

## ✨ Features at a Glance

| Feature                         | Description                                                    |
| ------------------------------- | -------------------------------------------------------------- |
| 🗺️ **Interactive Cluster Map**  | Explore campgrounds on a live Mapbox map with smart clustering |
| 🔍 **Search & Filter**          | Filter by name, location, price range, rating, and sort order  |
| 📅 **Real Bookings**            | Date picker with availability blocking — no double bookings    |
| 💳 **Razorpay Payments**        | ₹1 tourist booking fee + ₹999/year owner subscription          |
| 🤖 **CampBot AI**               | Floating chatbot powered by Groq LLaMA for camping Q&A         |
| ✍️ **AI Description Generator** | Auto-generate campground descriptions using Groq AI            |
| ❤️ **Favorites**                | Save and revisit your favourite campgrounds                    |
| ⭐ **Reviews & Ratings**        | Star ratings with text reviews on every campground             |
| 🛡️ **3-Role System**            | Tourist, Camp Owner, and Admin with separate dashboards        |
| 📱 **Fully Responsive**         | Beautiful on mobile, tablet, and desktop                       |

---

## 🖼️ Screenshots

<div align="center">

### Home Page

> _Stunning hero with animated entry and campground discovery_

### Campgrounds Index

> _Side-by-side list + sticky interactive map_

### Campground Detail

> _Image carousel, Mapbox location, booking card with date picker_

### CampBot

> _Floating AI assistant — always available on every page_

### Admin Dashboard

> _Full platform management — users, campgrounds, bookings, revenue_

### Owner Dashboard

> _Manage listings and view bookings for your campgrounds_

</div>

---

## 🏗️ Tech Stack

### Frontend

- **React 18** + React Router v6
- **Tailwind CSS** — custom design system with forest color palette
- **Mapbox GL JS** — interactive cluster maps + campground location maps
- **Lucide React** — consistent icon system (zero emojis in UI)
- **Axios** — API communication with credential support
- **Razorpay JS SDK** — seamless payment popup

### Backend

- **Node.js** + **Express** — RESTful API
- **MongoDB** + **Mongoose** — database with Atlas cloud hosting
- **Passport.js** — session-based authentication (local strategy)
- **Multer** + **Cloudinary** — image upload and storage
- **Razorpay Node SDK** — order creation and signature verification
- **Helmet** + **Mongo Sanitize** — security middleware

### AI & Maps

- **Groq** (`llama-3.3-70b-versatile`) — CampBot chatbot + AI description generator
- **Mapbox Geocoding API** — convert location strings to coordinates

### Deployment

- **Vercel** — frontend hosting with CI/CD
- **Render** — backend hosting with auto-deploy
- **MongoDB Atlas** — cloud database
- **Cloudinary** — image CDN

---

## 👥 Role System

```
Tourist  →  Browse, book, review, favorite campgrounds
Owner    →  Pay ₹999/year subscription → List campgrounds → View bookings
Admin    →  Approve/reject listings, manage users, view all bookings & revenue
```

### How to become an Admin

Set your user's `role` field to `"admin"` in MongoDB Atlas. The Admin link appears in the navbar automatically.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Mapbox account
- Razorpay test account
- Groq API key

### 1. Clone the repo

```bash
git clone https://github.com/batman-rises/YELPCAMP.git
cd YELPCAMP
```

### 2. Backend setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your keys (see Environment Variables section below)

# Start backend
node app.js
```

### 3. Frontend setup

```bash
cd frontend
npm install

# Create .env file — for local dev, DO NOT set VITE_API_URL
# Vite proxy handles routing automatically
echo "VITE_RAZORPAY_KEY_ID=rzp_test_your_key" > .env
echo "VITE_MAPBOX_TOKEN=your_mapbox_token" >> .env

# Start frontend
npm run dev
```

### 4. Seed the database

```bash
# From YELPCAMP root
cd seeds
node seedIndia.js
```

This seeds **20 Indian campgrounds** across Himachal, Uttarakhand, Kerala, Ladakh, and more.

---

## 🔑 Environment Variables

### Backend (`YELPCAMP/.env`)

```env
DB_URL=mongodb+srv://...
SECRET=your_session_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret

MAPBOX_TOKEN=pk.eyJ1...

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret

GROQ_API_KEY=gsk_...

CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### Frontend (`frontend/.env`) — Production only

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_MAPBOX_TOKEN=pk.eyJ1...
```

> **Note:** For local development, do not set `VITE_API_URL` — Vite's proxy handles `/api` routing automatically.

---

## 📡 API Overview

### Auth

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login             |
| GET    | `/api/auth/logout`   | Logout            |
| GET    | `/api/auth/me`       | Get current user  |

### Campgrounds

| Method | Endpoint               | Description                            |
| ------ | ---------------------- | -------------------------------------- |
| GET    | `/api/campgrounds`     | List all (supports search/filter/sort) |
| POST   | `/api/campgrounds`     | Create campground                      |
| GET    | `/api/campgrounds/:id` | Get single campground                  |
| PUT    | `/api/campgrounds/:id` | Update campground                      |
| DELETE | `/api/campgrounds/:id` | Delete campground                      |

### Bookings & Payments

| Method | Endpoint                    | Description                      |
| ------ | --------------------------- | -------------------------------- |
| POST   | `/api/payment/create-order` | Create Razorpay order (₹1)       |
| POST   | `/api/payment/verify`       | Verify payment + confirm booking |
| GET    | `/api/bookings/my`          | Get tourist's bookings           |

### Owner

| Method | Endpoint                               | Description                          |
| ------ | -------------------------------------- | ------------------------------------ |
| GET    | `/api/owner/dashboard`                 | Owner stats + campgrounds + bookings |
| POST   | `/api/owner/subscription/create-order` | Create ₹999 subscription order       |
| POST   | `/api/owner/subscription/verify`       | Verify + activate subscription       |

### Admin

| Method | Endpoint                             | Description      |
| ------ | ------------------------------------ | ---------------- |
| GET    | `/api/admin/stats`                   | Platform stats   |
| GET    | `/api/admin/users`                   | All users        |
| PATCH  | `/api/admin/users/:id/role`          | Change user role |
| GET    | `/api/admin/campgrounds`             | All campgrounds  |
| PATCH  | `/api/admin/campgrounds/:id/approve` | Approve listing  |
| PATCH  | `/api/admin/campgrounds/:id/reject`  | Reject listing   |
| GET    | `/api/admin/bookings`                | All bookings     |

### AI

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| POST   | `/api/ai/generate-description` | Generate campground description |
| POST   | `/api/chat`                    | CampBot conversation            |

---

## 💳 Payment Flow

```
Tourist selects dates
       ↓
POST /api/payment/create-order  →  Razorpay order created (₹1)
       ↓
Razorpay popup opens  →  Tourist pays
       ↓
POST /api/payment/verify  →  Signature verified  →  Booking confirmed
       ↓
Dates blocked on campground  →  Visible in My Bookings
```

---

## 🌏 Seeded Campgrounds

20 hand-picked Indian campgrounds including:

- Valley of Flowers Base Camp, Uttarakhand
- Spiti River Camp, Himachal Pradesh
- Rann of Kutch Desert Camp, Gujarat
- Nubra Valley Dune Camp, Ladakh
- Andaman Beach Camp, Havelock Island
- Pench Tiger Reserve Camp, Madhya Pradesh
- Munnar Tea Estate Camp, Kerala
- Darjeeling Tea Garden Camp, West Bengal
- Rishikesh White Water Camp, Uttarakhand
- Hampi Riverside Camp, Karnataka
- ...and 10 more across India

---

## 🔒 Security

- Helmet.js for HTTP headers
- Express Mongo Sanitize against NoSQL injection
- Session-based auth with MongoStore
- Razorpay HMAC signature verification
- CORS restricted to known origins
- Cloudinary for safe image hosting

---

## 📁 Project Structure

```
YELPCAMP/
├── app.js                  # Express app entry point
├── middleware.js           # Auth & role middleware
├── models/
│   ├── user.js             # User + subscription schema
│   ├── campground.js       # Campground + bookedDates schema
│   ├── booking.js          # Booking schema
│   └── review.js
├── routes/
│   ├── campgrounds.js
│   ├── payment.js          # Tourist booking + Razorpay
│   ├── owner.js            # Owner dashboard + subscription
│   ├── admin.js            # Admin management
│   ├── favorites.js
│   ├── reviews.js
│   └── ai.js               # Groq AI endpoints
├── controllers/
│   └── campgrounds.js
├── seeds/
│   └── seedIndia.js        # 20 Indian campgrounds
└── frontend/
    └── src/
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── CampgroundsIndex.jsx
        │   ├── CampgroundShow.jsx
        │   ├── MyBookingsPage.jsx
        │   ├── OwnerDashboard.jsx
        │   └── AdminDashboard.jsx
        ├── components/
        │   ├── layout/      # Navbar, Footer, Layout
        │   ├── maps/        # ClusterMap, ShowMap
        │   ├── ui/          # CampBot, Skeleton, StarRating
        │   └── campgrounds/ # CampgroundForm
        └── context/
            ├── AuthContext.jsx
            └── ToastContext.jsx
```

---

## 🛣️ Roadmap

- [ ] Email notifications on booking confirmation
- [ ] Campground availability calendar view
- [ ] Owner analytics dashboard with charts
- [ ] Social login (Google OAuth)
- [ ] Multiple campground image galleries
- [ ] Campground ratings on map popups
- [ ] PWA support for offline browsing

---

## 👨‍💻 Author

**Binayak Panda**

[![GitHub](https://img.shields.io/badge/GitHub-batman--rises-181717?style=flat-square&logo=github)](https://github.com/batman-rises)

---

## 📄 License

This project is for educational and portfolio purposes.

---

<div align="center">

**Built with passion for India's camping community**

_"Not all those who wander are lost — but they do need a good campground."_

⭐ Star this repo if you found it useful!

</div>
