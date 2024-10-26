const Joi = require('joi');
// Joi is a popular JavaScript library used for data validation, allowing developers to define schemas 
//for objects and ensure that the data adheres to specific rules.

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        image: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})

/**The code defines a campgroundSchema using Joi, a JavaScript validation library. 
 * This schema ensures that the campground object has the required fields: 
 * title (string), price (number, with a minimum value of 0), location (string), image (string), and description (string). 
 * Each of these fields is mandatory, as indicated by .required(). 
 * This schema is exported for use in validating campground data in incoming requests. */

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})