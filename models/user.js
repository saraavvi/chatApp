const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")

/*
I want users collection to look something like this:
{
    userID: “3943y7493.....”,
    email: “mailmailmail”,
    username: “Sara”,
    hash: “bqbfjkf8wfw9fw9fwnf9jvw9wvw9vj9w....”
}
*/

/* only need to add email in the schema*/
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
/* this will be added to the schema and: adds a username- and password-field*/
UserSchema.plugin(passportLocalMongoose);

/* this is the user model */
const User = mongoose.model("User", UserSchema)

module.exports = User