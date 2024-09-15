const express = require('express');
const app = express();
const path = require('path')

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

const Campground = require('./models/campgrounds')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    //res.send('hello from yelp camp')
    res.render('home')
})
app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: 'backyard', description: 'cheap very cheap' })
    await camp.save();
    res.send(camp);
})




app.listen(3000, () => {
    console.log("listening on port 3000")
})