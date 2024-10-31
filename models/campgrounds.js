const mongoose = require('mongoose')
const Schema = mongoose.Schema;// to avoid using mongoose.Schema repeatedly uk smartness
const Review = require('./review');

const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {//one to many relationship ie a campground can have multiple reviews
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
/**The campgroundSchema.post('findOneAndDelete') middleware is triggered after a campground is deleted. 
 * It ensures that any reviews associated with the deleted campground are also removed. 
 * When a campground is deleted using findOneAndDelete, the middleware checks if the deleted document (campground) 
 * contains any reviews. If it does, it uses the Review.deleteMany method to delete all reviews 
 * whose IDs are stored in the reviews array of the campground. 
 * This approach automatically cleans up related reviews whenever a campground is removed from the database. */


module.exports = mongoose.model('Campground', campgroundSchema)
/**  
      mongoose.model():
This method creates a Mongoose model based on a schema. A model is a class that allows you to interact with a MongoDB collection and perform CRUD operations 

    'Campground':
Campground is the name of the model. Mongoose will automatically use this name to create a corresponding MongoDB collection named campgrounds (Mongoose pluralizes model names by default).
 
    campgroundSchema:
This is the schema you’ve defined for the Campground model. A schema in Mongoose defines the structure of documents within a collection, including field names, types, and validation rules.
 
    module.exports:
This is a Node.js feature that allows you to export an object, function, or variable from a module so it can be imported and used in other files.
 * */ 