const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

// ADD / REMOVE FAVORITE (toggle)
router.post("/campgrounds/:id/favorite", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  const isFavorite = user.favorites.some((fav) => fav.equals(id));

  if (isFavorite) {
    user.favorites.pull(id);
  } else {
    user.favorites.push(id);
  }

  await user.save();
  res.redirect(`/campgrounds/${id}`);
});

// VIEW FAVORITES
router.get("/favorites", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.render("favorites/index", { favorites: user.favorites });
});

module.exports = router;
