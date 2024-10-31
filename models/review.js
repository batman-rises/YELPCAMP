const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'  // Make sure this is correctly referencing your User model
    }
});

module.exports = mongoose.model('Review', reviewSchema);