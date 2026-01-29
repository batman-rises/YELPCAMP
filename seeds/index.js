require("dotenv").config();

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const indianCamps = require("./indiaCampData");

const dbUrl = process.env.DB_URL;

console.log("SEED CONNECTING TO:", dbUrl);

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDB = async () => {
  await Campground.deleteMany({});
  console.log("Deleted old campgrounds");

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
          url: "https://res.cloudinary.com/demo/image/upload/v1699999999/placeholder.jpg",
          filename: "placeholder",
        },
      ],
      author: "696fcec729ddc973500e8f1c",
    });

    await campground.save();
    console.log("Saved:", campground.title);
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
