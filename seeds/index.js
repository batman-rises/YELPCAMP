const mongoose = require("mongoose");
const Campground = require("../models/campground");
const indianCamps = require("./indiaCampData");

const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

mongoose.connect(DB_URL);

const SEED_AUTHOR_ID = "PUT_REAL_USER_OBJECTID_HERE";

const seedDB = async () => {
  await Campground.deleteMany({});
  console.log("🧹 Cleared campgrounds");

  for (let camp of indianCamps) {
    const campground = new Campground({
      title: camp.title,
      location: camp.location,
      description: camp.description,
      price: camp.price,
      geometry: {
        type: "Point",
        coordinates: camp.coordinates,
      },
      images: camp.images,
      author: SEED_AUTHOR_ID,
    });

    await campground.save();
  }

  console.log("🌱 Database seeded with Indian camps");
};

seedDB().then(() => {
  mongoose.connection.close();
});
