const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Booking = require("../models/booking");
const Campground = require("../models/campground");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /api/payment/create-order ──────────────────────────────────────────
router.post(
  "/payment/create-order",
  catchAsync(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to book" });
    }

    const { campgroundId, checkIn, checkOut } = req.body;

    // Validate campground exists
    const campground = await Campground.findById(campgroundId);
    if (!campground) throw new ExpressError("Campground not found", 404);

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );
    if (nights < 1) throw new ExpressError("Invalid dates", 400);

    // ₹1 platform fee = 100 paise (Razorpay uses paise)
    const platformFee = 100;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: platformFee,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        campgroundId: campgroundId.toString(),
        touristId: req.user._id.toString(),
        checkIn,
        checkOut,
      },
    });

    // Save pending booking
    const booking = new Booking({
      campground: campgroundId,
      tourist: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      platformFee,
      razorpayOrderId: order.id,
      status: "pending",
    });
    await booking.save();

    res.json({
      orderId: order.id,
      amount: platformFee,
      currency: "INR",
      bookingId: booking._id,
      campgroundTitle: campground.title,
      nights,
    });
  }),
);

// ── POST /api/payment/verify ─────────────────────────────────────────────────
router.post(
  "/payment/verify",
  catchAsync(async (req, res) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Verify signature (security check)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update booking to confirmed
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "confirmed",
      },
      { new: true },
    ).populate("campground");

    res.json({
      success: true,
      message: "Booking confirmed!",
      booking,
    });
  }),
);

// ── GET /api/bookings/my ─────────────────────────────────────────────────────
// Tourist can see their own bookings
router.get(
  "/bookings/my",
  catchAsync(async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not logged in" });

    const bookings = await Booking.find({ tourist: req.user._id })
      .populate("campground", "title location price")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  }),
);

// ── GET /api/admin/bookings ──────────────────────────────────────────────────
// Admin can see ALL bookings
router.get(
  "/api/admin/bookings",
  catchAsync(async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const bookings = await Booking.find({})
      .populate("campground", "title location price")
      .populate("tourist", "username email")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  }),
);

module.exports = router;
