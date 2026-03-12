const Campground = require("../models/campground");
const Review = require("../models/review");

// ─── POST /campgrounds/:id/reviews ────────────────────────────────────────────
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    return res.status(404).json({ message: "Campground not found" });
  }

  const review = new Review(req.body.review);
  review.author = req.user._id;

  campground.reviews.push(review);
  await review.save();
  await campground.save();

  // Populate author before returning so the UI can display username immediately
  await review.populate("author");

  res.status(201).json({ review });
};

// ─── DELETE /campgrounds/:id/reviews/:reviewId ────────────────────────────────
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  res.json({ message: "Review deleted successfully" });
};
