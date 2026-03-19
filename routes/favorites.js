const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");
const catchAsync = require("../utils/catchAsync");

// ─── POST /campgrounds/:id/favorite — toggle favorite ────────────────────────
router.post(
  "/api/campgrounds/:id/favorite",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const isFavorite = user.favorites.some((fav) => fav.equals(id));

    if (isFavorite) {
      user.favorites.pull(id);
    } else {
      user.favorites.push(id);
    }

    await user.save();

    // Return the fresh user with favorites populated so React can update state
    const freshUser = await User.findById(req.user._id).populate("favorites");
    res.json({ user: freshUser });
  }),
);

// ─── GET /favorites — view all favorites ─────────────────────────────────────
router.get(
  "/api/favorites",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json({ favorites: user.favorites });
  }),
);

module.exports = router;
