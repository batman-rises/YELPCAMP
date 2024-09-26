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


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));//to execute EJS smoothly we need these two lines

app.use(express.urlencoded({ extended: true }));//parsing through url/ie templating

app.use(methodOverride('_method'));//are wo put,patch etc use karne

app.engine('ejs', ejsMate);//imp

//joi use
const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const mssg = error.details.map(el => el.message).join(',')
        throw new ExpressError(mssg, 400)
    } else {
        next()
    }
}
//The validateCampground middleware validates incoming request data (req.body) against a predefined schema (campgroundSchema). 
//It checks for any errors in the validation result, and if found, maps over the error details, extracts the messages, and combines them into a single string. 
//If validation fails, a custom error (ExpressError) is thrown with the error message and a status code of 400 (Bad Request). 
//If the data is valid, the middleware simply calls next() to continue with the next middleware or route handler.
const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const mssg = error.details.map(el => el.message).join(',')
        throw new ExpressError(mssg, 400)
    } else {
        next()
    }
}




//Campground is the name of the model
app.get('/', (req, res) => {
    //res.send('hello from yelp camp')
    res.render('home')
})
//campground INDEX:-
app.get('/campgrounds', catchAsync(async (req, res) => {//-> '/campgrounds' ye waala jo hai wo url me hota hai
    const campgrounds = await Campground.find({});
    //res.render('campgrounds/index') here i just grabbed it
    res.render('campgrounds/index', { campgrounds })//grabbed + rendered
}))
//Campground New & Create   ~~~order does matter

/**The GET /campgrounds/new route shows a form to create a new campground.
The POST /campgrounds route handles form submissions, creates a new campground using the submitted data, 
saves it to the database, and then redirects the user to the details page of the newly created campground. */
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    //if (!req.body.campground) throw new ExpressError('invalid campground data', 400)

    //this is not a mongoose schema but a schema meant for validation in the server side

    const campground = new Campground(req.body.campground)//kyunki agar html form ko dhyaan se dekhega to assume karega ki apan saara data campground[] me rakha hai
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}))
//Campground SHOW~details pg for each camp
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))
//Campground Edit & Update
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });//spread operator
    res.redirect(`/campgrounds/${campground._id}`)
}))
//Campground Delete
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})

//REVIEWS:-
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))
/**This code handles a POST request to create a new review for a specific campground. 
 * It first finds the campground by its ID (req.params.id). 
 * hen, it creates a new review using the data from the request body (req.body.review) and 
 * adds this review to the campground's reviews array. 
 * After saving both the review and the updated campground to the database, 
 * it redirects the user to the campground's page using the campground's ID.
 */
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //mongo operator $PULL
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))






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