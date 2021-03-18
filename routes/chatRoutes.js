const express = require("express");
const router = express.Router();
const Room = require("../models/room");
const Message = require("../models/message");
const { isLoggedIn } = require("../middlewares/isloggedin")

// show all rooms
router.get("/", isLoggedIn, async (req, res) => {
    // console.log("current user:" + req.user)
    const rooms = await Room.find({})

    res.render("chat", { rooms })

})

//to a specific room
// also get all the previous messages in this room from the db and send to template
router.get("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const currentRoom = await Room.findById(id);
    const user = req.user;

    Room.findById(id).then(room => {
        const oldMessages = [];
        room.messages.forEach(messageId => {
            oldMessages.push(Message.findById(messageId).populate("sender"))
        });
        return Promise.all(oldMessages)
    })
        .then(messageList => {
            console.log(messageList)
            res.render("chatroom", { id, user, currentRoom, messageList })
        })
})

//endpoint for adding a new room
router.post("/", isLoggedIn, async (req, res) => {
    const { name } = req.body;
    const newRoom = await new Room({ name: name, creator: req.user._id })
    newRoom.save()
    res.end("room was added")
})

//endpoint for deleting a room 
//todo: id a room is deleted, all the messages in that room should also be deleted
router.delete("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log(id);
    await Room.findByIdAndDelete(id)
    res.end("room was deleted")
})



module.exports = router