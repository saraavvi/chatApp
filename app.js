const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRoutes = require("./routes/users");
const User = require("./models/user")

mongoose.connect('mongodb://localhost:27017/chatApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("mongo is connected")
    })
    .catch(err => {
        console.log("Error in mongo connection")
        console.log(err)
    })

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }))

const sessionConfig = { // hur fixar man expiration för kakan?
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}
app.use(session(sessionConfig))
app.use(passport.initialize()) // required to initialize passport 
app.use(passport.session()) // for user to stay logged in and not have to login on every request
passport.use(new LocalStrategy(User.authenticate())); // use the local strategy. the authenticate-method comes from passport-local-mongoose

//store and unstore the user in the session. theese also comes from passport-local-mongoose
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use("/", userRoutes) // all routes for register, login, logout ... 

app.get("/", (req, res) => { //landingpage
    res.render("landingpage")
})
//protect chat route: need to be logged in to go here. Can check this with the passport-method isAuthenticated
app.get("/chat", (req, res) => {
    if (!req.isAuthenticated()) {
        console.log("You need to be logged in!")
        return res.redirect("/login")
    } else {
        res.render("chat")
    }
})

app.listen(3000, () => {
    console.log("listening on 3000")
})