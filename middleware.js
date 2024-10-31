const { campgroundSchema,reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campgrounds')
const Review = require('./models/review')


const isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalURL;
        req.flash('error','you must be signed in before accessing anything');
        return res.redirect('/login');
    }
    next();
}

module.exports = {
    isLoggedIn,
};

/**due to some recent security improvements in the Passport.js version updates
 * the session now gets cleared after a successful login. 
 * This causes a problem with our returnTo redirect logic because we store the returnTo route path 
 * (i.e., the path where the user should be redirected back after login) in the session (req.session.returnTo), which gets cleared after a successful login.

To resolve this issue, we will use a middleware function to transfer the returnTo value from the session (req.session.returnTo)
 to the Express.js app res.locals object before the passport.authenticate() function is executed in the /login POST route. */

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {

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



module.exports.isAuthor=async(req,res,next)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){ //AUTHORIZATION
        req.flash('error','You do not have permission to do that')
        res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params; // Ensure you are getting both id and reviewId
    const review = await Review.findById(reviewId); // Use reviewId to find the review

    if (!review) {
        req.flash('error', 'Review not found'); // Handle the case where the review does not exist
        return res.redirect(`/campgrounds/${id}`); // Redirect if the review is not found
    }

    // Check if the logged-in user is the author of the review
    if (!review.author.equals(req.user._id)) { // Ensure the author field is valid
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`); // Redirect if the user is not the author
    }
    
    next(); // Proceed if the author check passes
};


module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const mssg = error.details.map(el => el.message).join(',')
        throw new ExpressError(mssg, 400)
    } else {
        next()
    }
}
