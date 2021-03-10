const express = require("express");
const router = express.Router();
const Room = require("../models/room")

//protect chat route: need to be logged in to go here. Can check this with the passport-method isAuthenticated
router.get("/", async (req, res) => {
    console.log("current user:" + req.user)
    const rooms = await Room.find({})
    console.log(rooms)

    if (!req.isAuthenticated()) {
        console.log("You need to be logged in!")
        return res.redirect("/login")
    } else {
        res.render("chat", { rooms })
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const roomname = await Room.findById(id);
    const user = req.user;
    if (!req.isAuthenticated()) {
        console.log("You need to be logged in!")
        return res.redirect("/login")
    } else {
        res.render("chatroom", { id, user, roomname })
    }
})



module.exports = router