const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campgrounds')
//KEY NOTE: MESSING UP WITH PATH IS A PROBLEM HERE WHILE RESTRUCTURING 
const { campgroundSchema } = require('../schemas.js')
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware')
const campgrounds=require('../controllers/campgrounds')

/*Campground is the name of the model
//campground INDEX:-
router.get('/', catchAsync(campgrounds.index))

//Campground New & Create   ~~~order does matter
The GET /campgrounds/new route shows a form to create a new campground.
The POST /campgrounds route handles form submissions, creates a new campground using the submitted data, 
saves it to the database, and then redirects the user to the details page of the newly created campground. 
router.get('/new', isLoggedIn, campgrounds.renderNewForm )
router.post('/', isLoggedIn,validateCampground, catchAsync(campgrounds.createCampground))

//Campground SHOW~details pg for each camp
router.get('/:id', isLoggedIn, catchAsync(campgrounds.showCampground))
//Campground Edit & Update
router.get('/:id/edit', isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))
//update
router.put('/:id', isLoggedIn,isAuthor,validateCampground, catchAsync(campgrounds.updateCampground))
//Campground Delete
router.delete('/:id', isLoggedIn,isAuthor,campgrounds.deleteCampground)
**/


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,validateCampground, catchAsync(campgrounds.createCampground))

//order matters new should be before show pg route
router.get('/new', isLoggedIn, campgrounds.renderNewForm )

router.route('/:id')
    .get(isLoggedIn, catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor,validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor,campgrounds.deleteCampground)

router.get('/:id/edit', isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))






module.exports = router;