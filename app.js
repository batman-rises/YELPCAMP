const express = require('express');
const app = express();
const path = require('path')

const methodOverride = require('method-override')

//requiring and connecting MONGOOSE
const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/yelp-camp';//yelp-camp is name of DB
mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });
/*mongoose.connect(dbUrl, {
    useNewUrlParser: true,      these all shits are now there by default
    useUnifiedTopology: true,
})*/
const Campground = require('./models/campgrounds')
const Review = require('./models/review');

//requiring EJS-MATE ~ for using that layouts thing
const ejsMate = require('ejs-mate');

const { campgroundSchema, reviewSchema } = require('./schemas.js')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
//const Joi = require('joi');

const campgrounds = require('./routes/campground')
const reviews = require('./routes/reviews')

const session = require('express-session')
const flash = require('connect-flash')

const sessionConfig = {
    secret: 'asecret',
    resave: false,
    saveUninitialized: true,
    //fancier options for cookies
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.engine('ejs', ejsMate);//imp
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//to execute EJS smoothly we need these two lines

app.use(express.urlencoded({ extended: true }));//parsing through url/ie templating

app.use(methodOverride('_method'));//are wo put,patch etc use karne

app.use(express.static(path.join(__dirname, 'public')))
//joi use

app.use('/campgrounds', campgrounds)//for ROUTES
app.use('/campgrounds/:id/reviews', reviews)




app.get('/', (req, res) => {
    res.render('Home')
})

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Pg not found', 404))
})
app.use((err, req, res, next) => {
    //const { statusCode = 500, message = 'Something went wrong' } = err;//also here default mssg and statutscode provided
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'oh no,something went wrong'
    res.status(statusCode).render('error', { err });//been passed to error.js for rendering
})




app.listen(3000, () => {
    console.log("listening on port 3000")
})