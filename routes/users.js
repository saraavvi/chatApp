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
// passport has middleware passport.authenticate() (it compares the hashed passwords for us)
router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/")
})

router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password) // takes the new user we created and hash and store the password on it
        res.redirect("/")
    } catch (err) {
        console.log(err.message) // fixa så att detta visas för användaren på nått sätt.
        res.redirect("/register")
    }
})
//witch passport there is a logout method added to the request object
router.get("/logout", (req, res) => {
    req.logOut()
    console.log("Logged out")
    res.redirect("/")
})

module.exports = router;

