const mongoose = require('mongoose')
const Schema = mongoose.Schema;// to avoid using mongoose.Schema repeatedly uk smartness

const campgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
})

module.exports = mongoose.model('Campground', campgroundSchema)
/**  
      mongoose.model():
This method creates a Mongoose model based on a schema. A model is a class that allows you to interact with a MongoDB collection and perform CRUD operations 

    'Campground':
This is the name of the model. Mongoose will automatically use this name to create a corresponding MongoDB collection named campgrounds (Mongoose pluralizes model names by default).
 
    campgroundSchema:
This is the schema you’ve defined for the Campground model. A schema in Mongoose defines the structure of documents within a collection, including field names, types, and validation rules.
 
    module.exports:
This is a Node.js feature that allows you to export an object, function, or variable from a module so it can be imported and used in other files.
 * */ 