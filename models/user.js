// gonna use Passport for authentication
//npm i passport passport-local passport-local-mongoose

const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);//imp~crucial~does all the basic works regarding auth like username,passport,salting etc etc

module.exports = mongoose.model('User', UserSchema);