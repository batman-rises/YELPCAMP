const mongoose = require('mongoose')
const dbUrl = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
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


const seedDB = async () => {
    await Campground.deleteMany({});
    //const c = new Campground({ title: 'purple field' });
    for (let i of 50) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city},${cities[random1000].state}`
        })
    }
    await camp.save();
}

seedDB(); //executing seedDB function