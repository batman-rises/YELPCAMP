const express = require('express');
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campgrounds')
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const { reviewSchema } = require('../schemas.js')


const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const mssg = error.details.map(el => el.message).join(',')
        throw new ExpressError(mssg, 400)
    } else {
        next()
    }
}


//REVIEWS:-
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new Review!');
    res.redirect(`/campgrounds/${campground._id}`)
}))
/**This code handles a POST request to create a new review for a specific campground. 
 * It first finds the campground by its ID (req.params.id). 
 * hen, it creates a new review using the data from the request body (req.body.review) and 
 * adds this review to the campground's reviews array. 
 * After saving both the review and the updated campground to the database, 
 * it redirects the user to the campground's page using the campground's ID.
 */
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //mongo operator $PULL
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted Review!');
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;



