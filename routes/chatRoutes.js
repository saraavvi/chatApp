const express = require("express");
const router = express.Router();
const Room = require("../models/room");
const Message = require("../models/message");
const { isLoggedIn } = require("../middlewares/isloggedin")

// show all rooms
router.get("/", isLoggedIn, async (req, res) => {
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
// want to make sure that the user is loggedin but also that the user is allowed to delete this chatroom (authorized)
router.delete("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const room = await Room.findById(id).populate("creator")
    if (!(JSON.stringify(req.user._id) == JSON.stringify(room.creator._id))) {
        req.flash("error", "you do not have permission to delete this room")
        return res.end("no room was deleted")
    } else {
        await Room.findByIdAndDelete(id)
        req.flash("success", `${room.name} is now deleted`)
        res.end("room deleted")
    }
})

module.exports = router