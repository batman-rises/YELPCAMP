require("dotenv").config();

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const indianCamps = require("./indiaCampData");

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL);
console.log("SEED CONNECTED TO:", DB_URL);

const SEED_AUTHOR_ID = "697b0df339364d510873869c";

const seedDB = async () => {
  await Campground.deleteMany({});
  console.log("Cleared campgrounds");

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
      images: [
        {
          url: camp.image,
          filename: camp.title.toLowerCase().replace(/\s+/g, "-"),
        },
      ],

      author: SEED_AUTHOR_ID,
    });

    await campground.save();
  }

  console.log("Database seeded with Indian camps");
};

seedDB().then(() => {
  mongoose.connection.close();
});
