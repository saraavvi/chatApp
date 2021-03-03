const express = require("express");
const router = express.Router();
const User = require("../models/user")

router.get("/login", (req, res) => {
    res.render("login")
})

router.get("/register", (req, res) => {
    res.render("register")
})

router.post("/register", async (req, res) => {
    const { email, username, password } = req.body;
    const user = new User({ email, username })
    const registeredUser = await User.register(user, password) // takes the new user we created and hash and store the password on it
    console.log(registeredUser)
    res.redirect("/")
})

module.exports = router;