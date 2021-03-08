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

router.get("/room", (req, res) => {
    const { id } = req.params;
    if (!req.isAuthenticated()) {
        console.log("You need to be logged in!")
        return res.redirect("/login")
    } else {
        res.render("chatroom")
    }
})

router.post("/room", (req, res) => {
    console.log(req.body)
    const { room } = req.body;
    res.redirect(`/chat/room?room=${room}`)
})

module.exports = router