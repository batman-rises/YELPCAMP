const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Campground = require("../models/campground");

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground),
  );

// router.get("/", async (req, res) => {
//   const { search, minPrice, maxPrice } = req.query;

//   let query = {};

//   // 🔍 SEARCH (title + location)
//   if (search) {
//     query.$or = [
//       { title: new RegExp(search, "i") },
//       { location: new RegExp(search, "i") },
//     ];
//   }

//   // 💰 PRICE FILTER
//   if (minPrice || maxPrice) {
//     query.price = {};
//     if (minPrice) query.price.$gte = Number(minPrice);
//     if (maxPrice) query.price.$lte = Number(maxPrice);
//   }

//   const campgrounds = await Campground.find(query);
//   res.render("campgrounds/index", { campgrounds, search, minPrice, maxPrice });
// });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground),
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm),
);

module.exports = router;
