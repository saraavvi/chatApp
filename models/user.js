const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")

/* only need to add email in the schema*/
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePicUrl: String,
    profilePicName: String
})
/* this will be added to the schema and: adds a username- and password-field*/
UserSchema.plugin(passportLocalMongoose);

/* this is the user model */
const User = mongoose.model("User", UserSchema)

module.exports = User