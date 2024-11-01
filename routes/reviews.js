const express = require('express');
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campgrounds')
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const { reviewSchema } = require('../schemas.js')

const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware.js')

const reviews=require('../controllers/reviews')


//REVIEWS:-
router.post('/', isLoggedIn,validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router;



