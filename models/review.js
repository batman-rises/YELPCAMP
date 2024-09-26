const mongoose = require('mongoose')
const Schema = mongoose.Schema;// to avoid using mongoose.Schema repeatedly uk smartness

const reviewSchema = new Schema({
    body: String,
    rating: Number
});

module.exports = mongoose.model('Review', reviewSchema);