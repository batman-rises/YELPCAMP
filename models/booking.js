const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingSchema = new Schema(
  {
    campground: {
      type: Schema.Types.ObjectId,
      ref: "Campground",
      required: true,
    },
    tourist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    // ₹1 platform booking fee (in paise for Razorpay → 100 paise = ₹1)
    platformFee: {
      type: Number,
      default: 100, // 100 paise = ₹1
    },
    // Razorpay details
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    // Booking status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
