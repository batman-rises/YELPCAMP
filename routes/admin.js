const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const Campground = require("../models/campground");
const Booking = require("../models/booking");

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Admins only" });
  next();
};

// ── GET /admin/stats ─────────────────────────────────────────────────────────
router.get("/admin/stats", isAdmin, catchAsync(async (req, res) => {
  const [totalUsers, totalCampgrounds, totalBookings, pendingCampgrounds, pendingBookings] =
    await Promise.all([
      User.countDocuments(),
      Campground.countDocuments(),
      Booking.countDocuments(),
      Campground.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "pending" }),
    ]);

  const revenue = await Booking.aggregate([
    { $match: { status: "confirmed" } },
    { $group: { _id: null, total: { $sum: "$platformFee" } } },
  ]);

  res.json({
    totalUsers,
    totalCampgrounds,
    totalBookings,
    pendingCampgrounds,
    pendingBookings,
    totalRevenue: revenue[0]?.total || 0,
  });
}));

// ── GET /admin/users ──────────────────────────────────────────────────────────
router.get("/admin/users", isAdmin, catchAsync(async (req, res) => {
  const users = await User.find({}).select("-hash -salt").sort({ createdAt: -1 });
  res.json({ users });
}));

// ── PATCH /admin/users/:id/role ───────────────────────────────────────────────
router.patch("/admin/users/:id/role", isAdmin, catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!["tourist", "owner", "admin"].includes(role))
    return res.status(400).json({ message: "Invalid role" });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json({ user });
}));

// ── DELETE /admin/users/:id ───────────────────────────────────────────────────
router.delete("/admin/users/:id", isAdmin, catchAsync(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
}));

// ── GET /admin/campgrounds ────────────────────────────────────────────────────
router.get("/admin/campgrounds", isAdmin, catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({})
    .populate("author", "username email role")
    .sort({ createdAt: -1 });
  res.json({ campgrounds });
}));

// ── PATCH /admin/campgrounds/:id/approve ─────────────────────────────────────
router.patch("/admin/campgrounds/:id/approve", isAdmin, catchAsync(async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(
    req.params.id,
    { status: "approved", approved: true },
    { new: true }
  );
  res.json({ campground });
}));

// ── PATCH /admin/campgrounds/:id/reject ──────────────────────────────────────
router.patch("/admin/campgrounds/:id/reject", isAdmin, catchAsync(async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", approved: false },
    { new: true }
  );
  res.json({ campground });
}));

// ── DELETE /admin/campgrounds/:id ─────────────────────────────────────────────
router.delete("/admin/campgrounds/:id", isAdmin, catchAsync(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  res.json({ message: "Campground deleted" });
}));

// ── GET /admin/bookings ───────────────────────────────────────────────────────
router.get("/admin/bookings", isAdmin, catchAsync(async (req, res) => {
  const bookings = await Booking.find({})
    .populate("campground", "title location price")
    .populate("tourist", "username email")
    .sort({ createdAt: -1 });
  res.json({ bookings });
}));

module.exports = router;
