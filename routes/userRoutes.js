const express = require("express");
const router = express.Router();
const passport = require("passport")
const User = require("../models/user")
const AppError = require("../utils/AppError");
const wrapAsync = require("../utils/wrapAsync")

/**
 * routes that handle user login and register 
 */

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
        const registeredUser = await User.register(user, password)
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

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}`)
    res.redirect("/chat")
})

router.get("/logout", (req, res) => {
    req.logOut()
    res.redirect("/")
})

module.exports = router;

