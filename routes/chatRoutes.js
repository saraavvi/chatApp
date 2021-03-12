const express = require("express");
const router = express.Router();
const Room = require("../models/room")

//protect chat route: need to be logged in to go here. Can check this with the passport-method isAuthenticated
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("You need to be logged in!")
        req.flash("error", "You need to be logged in")
        return res.redirect("/login")
    }
    next()
}

// show all rooms
router.get("/", isLoggedIn, async (req, res) => {
    console.log("current user:" + req.user)
    const rooms = await Room.find({})
    console.log(rooms)
    res.render("chat", { rooms })

})

//to a specific room
router.get("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const roomname = await Room.findById(id);
    const user = req.user;
    res.render("chatroom", { id, user, roomname })
})

//endpoint for adding a new room
router.post("/", isLoggedIn, async (req, res) => {
    const { name } = req.body;
    const newRoom = await new Room({ name: name })
    newRoom.save()
    res.end("room was added")
})



module.exports = router