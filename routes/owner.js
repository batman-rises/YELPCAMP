const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const Campground = require("../models/campground");
const Booking = require("../models/booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not logged in" });
  if (req.user.role !== "owner" && req.user.role !== "admin")
    return res.status(403).json({ message: "Owners only" });
  next();
};

router.get("/api/owner/dashboard", isOwnerOrAdmin, catchAsync(async (req, res) => {
  const owner = await User.findById(req.user._id);
  const campgrounds = await Campground.find({ author: req.user._id }).sort({ createdAt: -1 });
  const campgroundIds = campgrounds.map(c => c._id);
  const bookings = await Booking.find({ campground: { $in: campgroundIds } })
    .populate("campground", "title location price")
    .populate("tourist", "username email")
    .sort({ createdAt: -1 });
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  res.json({
    subscription: owner.subscription,
    campgrounds,
    bookings,
    stats: {
      totalCampgrounds: campgrounds.length,
      pendingCampgrounds: campgrounds.filter(c => c.status === "pending").length,
      approvedCampgrounds: campgrounds.filter(c => c.status === "approved").length,
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
    }
  });
}));

router.post("/api/owner/subscription/create-order", catchAsync(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not logged in" });
  const amount = 99900;
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `sub_${Date.now()}`,
    notes: { userId: req.user._id.toString(), type: "owner_subscription" },
  });
  res.json({ orderId: order.id, amount, currency: "INR" });
}));

router.post("/api/owner/subscription/verify", catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  if (expectedSig !== razorpay_signature)
    return res.status(400).json({ message: "Payment verification failed" });
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: "owner", subscription: { status: "active", razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, startDate, endDate } },
    { new: true }
  );
  res.json({ success: true, user });
}));

router.get("/api/owner/campgrounds/:id/availability", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) return res.status(404).json({ message: "Not found" });
  res.json({ bookedDates: campground.bookedDates });
}));

module.exports = router;
