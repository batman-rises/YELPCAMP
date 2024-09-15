const mongoose = require('mongoose')
const dbUrl = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });

//const Campground = require('./models/campgrounds') since campgrounds.js is in models directory but we need its access in seeds directory 
// so gotta put double dots ..
const Campground = require('../models/campgrounds')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

//picking a random element from the array
const sample = array => array[Math.floor(Math.random() * array.length)];



const seedDB = async () => {
    await Campground.deleteMany({});
    //const c = new Campground({ title: 'purple field' });
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}

// THIS FILE'S ONLY PURPOSE IS TO FEED THE DB WITH CAMPGROUNDs TITLE AND LOCATION

//seedDB(); //executing seedDB function
seedDB().then(() => {
    mongoose.connection.close();
})
