const express = require("express");
const router = express.Router();

//protect chat route: need to be logged in to go here. Can check this with the passport-method isAuthenticated
router.get("/", (req, res) => {
    console.log("current user:" + req.user)
    if (!req.isAuthenticated()) {
        console.log("You need to be logged in!")
        return res.redirect("/login")
    } else {
        res.render("chat")
    }
})

module.exports = router