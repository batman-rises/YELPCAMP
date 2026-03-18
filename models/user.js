const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["tourist", "owner", "admin"],
    default: "tourist",
  },
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Campground",
    },
  ],
  subscription: {
    status: {
      type: String,
      enum: ["inactive", "active", "expired"],
      default: "inactive",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    startDate: Date,
    endDate: Date,
  },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
