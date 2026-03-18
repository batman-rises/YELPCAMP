const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

// ─── GET /campgrounds ─────────────────────────────────────────────────────────
module.exports.index = async (req, res) => {
  const { search, minPrice, maxPrice, sort, rating } = req.query;

  let match = {};

  // Search by title or location
  if (search) {
    match.$or = [
      { title: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
    ];
  }

  // Price filter
  if (minPrice || maxPrice) {
    match.price = {};
    if (minPrice) match.price.$gte = Number(minPrice);
    if (maxPrice) match.price.$lte = Number(maxPrice);
  }

  let pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "campground",
        as: "reviews",
      },
    },
    {
      $addFields: {
        reviewCount: { $size: "$reviews" },
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.rating" },
            null,
          ],
        },
      },
    },
  ];

  // Rating filter (applied after avgRating is computed)
  if (rating) {
    pipeline.push({ $match: { avgRating: { $gte: Number(rating) } } });
  }

  // Sort
  if (sort === "price_asc") pipeline.push({ $sort: { price: 1 } });
  if (sort === "price_desc") pipeline.push({ $sort: { price: -1 } });

  const campgrounds = await Campground.aggregate(pipeline);

  // Build GeoJSON for the cluster map
  const geoJSON = {
    type: "FeatureCollection",
    features: campgrounds.map((camp) => ({
      type: "Feature",
      geometry: camp.geometry,
      properties: {
        id: camp._id,
        title: camp.title,
        location: camp.location,
        popUpMarkup: `
          <strong><a href="/campgrounds/${camp._id}">${camp.title}</a></strong>
          <p>${camp.location}</p>
        `,
      },
    })),
  };

  res.json({ campgrounds, geoJSON });
};

// ─── POST /campgrounds ────────────────────────────────────────────────────────
module.exports.createCampground = async (req, res, next) => {
  // Geocode the location
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body["campground[location]"] || req.body.campground?.location,
      limit: 1,
    })
    .send();

  if (!geoData.body.features.length) {
    return res
      .status(400)
      .json({ message: "Location not found. Please enter a valid location." });
  }

  // Support both multipart field formats:
  // - req.body.campground (JSON) or req.body["campground[title]"] (FormData)
  const data = req.body.campground || {
    title: req.body["campground[title]"],
    location: req.body["campground[location]"],
    price: req.body["campground[price]"],
    description: req.body["campground[description]"],
  };

  const campground = new Campground(data);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = (req.files || []).map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;

  await campground.save();
  res.status(201).json({ campground });
};

// ─── GET /campgrounds/:id ─────────────────────────────────────────────────────
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author")
    .select("+bookedDates");

  if (!campground) {
    return res.status(404).json({ message: "Cannot find that campground!" });
  }

  res.json({ campground });
};

// ─── PUT /campgrounds/:id ─────────────────────────────────────────────────────
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;

  // Support both multipart formats
  const data = req.body.campground || {
    title: req.body["campground[title]"],
    location: req.body["campground[location]"],
    price: req.body["campground[price]"],
    description: req.body["campground[description]"],
  };

  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...data },
    { new: true },
  );

  // Add new images
  const newImgs = (req.files || []).map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...newImgs);
  await campground.save();

  // Delete marked images from Cloudinary + DB
  const toDelete = req.body["deleteImages[]"] || req.body.deleteImages;
  if (toDelete) {
    const filenames = Array.isArray(toDelete) ? toDelete : [toDelete];
    for (let filename of filenames) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: filenames } } },
    });
  }

  res.json({ campground });
};

// ─── DELETE /campgrounds/:id ──────────────────────────────────────────────────
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.json({ message: "Campground deleted successfully" });
};

// ─── These are no longer needed (React handles rendering) ─────────────────────
// renderNewForm  → /campgrounds/new  handled by React
// renderEditForm → /campgrounds/:id/edit  handled by React
module.exports.renderNewForm = (req, res) => res.json({ ok: true });
module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) return res.status(404).json({ message: "Not found" });
  res.json({ campground });
};
