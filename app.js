const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat")
const User = require("./models/user")

const app = express();

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

mongoose.connect('mongodb://localhost:27017/chatApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("mongo is connected")
    })
    .catch(err => {
        console.log("Error in mongo connection")
        console.log(err)
    })

app.engine("ejs", ejsMate)
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

//to get access to the user we can use req.user: req.user property will be set to the authenticated user when login
//using this middleware because I want the user to be avaliable in my templates
app.use((req, res, next) => {
    res.locals.signedInUser = req.user;
    next();
})

app.use("/", userRoutes) // all routes for register, login, logout ... 
app.use("/chat", chatRoutes) // chat page and chat root routes.. 

app.get("/", (req, res) => { //landingpage
    res.render("landingpage")
})

app.listen(3000, () => {
    console.log("listening on 3000")
})
