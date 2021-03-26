const express = require("express");
const router = express.Router();
const passport = require("passport")
const User = require("../models/user")

router.get("/login", (req, res) => {
    res.render("login")
})

router.get("/register", (req, res) => {
    res.render("register")
})

router.post("/register", async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password) // takes the new user we created and hash and store the password on it
        req.login(registeredUser, err => {
            if (err) {
                return next(err)
            }
            req.flash("success", `Welcome, ${req.user.username}`)
            res.redirect("/chat")
        })
    } catch (err) {
        req.flash("error", "Sorry, that username or email already exists")
        res.redirect("/register")
    }
})
// passport.authenticate() compares the hashed passwords
router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}`)
    res.redirect("/chat")
})

//passport has logout method added to the request object
router.get("/logout", (req, res) => {
    req.logOut()
    res.redirect("/")
})

//endpoint to fetch all users (flytta denna)
// router.get("/users", async (req, res) => {
//     const allUsers = await User.find({})
//     res.send(allUsers)
// })

module.exports = router;

