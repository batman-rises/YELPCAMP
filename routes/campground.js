const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Campground = require('../models/campgrounds')
//KEY NOTE: MESSING UP WITH PATH IS A PROBLEM HERE WHILE RESTRUCTURING 
const { campgroundSchema } = require('../schemas.js')


const {isLoggedIn}=require('../middleware')

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const mssg = error.details.map(el => el.message).join(',')//ye bhi ratt lio server side(joi) validations
        throw new ExpressError(mssg, 400)
    } else {
        next()
    }
}
//The validateCampground middleware validates incoming request data (req.body) against a predefined schema (campgroundSchema). 
//It checks for any errors in the validation result, and if found, maps over the error details, extracts the messages, and combines them into a single string. 
//If validation fails, a custom error (ExpressError) is thrown with the error message and a status code of 400 (Bad Request). 
//If the data is valid, the middleware simply calls next() to continue with the next middleware or route handler.


//Campground is the name of the model
//campground INDEX:-
router.get('/', catchAsync(async (req, res) => {//-> '/campgrounds' ye waala jo hai wo url me hota hai
    const campgrounds = await Campground.find({});
    //res.render('campgrounds/index') here i just grabbed it
    res.render('campgrounds/index', { campgrounds })//grabbed + rendered
}))
//Campground New & Create   ~~~order does matter

/**The GET /campgrounds/new route shows a form to create a new campground.
The POST /campgrounds route handles form submissions, creates a new campground using the submitted data, 
saves it to the database, and then redirects the user to the details page of the newly created campground. */
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})
router.post('/', isLoggedIn,validateCampground, catchAsync(async (req, res) => {
    //if (!req.body.campground) throw new ExpressError('invalid campground data', 400)
    //this is not a mongoose schema but a schema meant for validation in the server side
    const campground = new Campground(req.body.campground)//kyunki agar html form ko dhyaan se dekhega to assume karega ki apan saara data campground[] me rakha hai
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)

}))
//Campground SHOW~details pg for each camp
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}))
//Campground Edit & Update
router.get('/:id/edit', isLoggedIn,catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) { //if campgroung not found flash this error mssg
        req.flash('error', 'cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn,validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });//spread operator
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))
//Campground Delete
router.delete('/:id', isLoggedIn,async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds')
})

module.exports = router;