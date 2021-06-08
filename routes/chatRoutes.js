const express = require("express");
const router = express.Router();
const Room = require("../models/room");
const Message = require("../models/message");
const { isLoggedIn } = require("../middlewares/isloggedin")
const AppError = require("../utils/AppError");
const wrapAsync = require("../utils/wrapAsync")

/**
 * display a list of all chat rooms
 */
router.get("/", isLoggedIn, async (req, res) => {
    const rooms = await Room.find({})
    res.render("chat", { rooms })

})

/**
 * a user can create a new chat room
 */
router.post("/", isLoggedIn, wrapAsync(async (req, res, next) => {
    const { name } = req.body;
    const newRoom = new Room({ name: name, creator: req.user._id })
    await newRoom.save();
    if (!newRoom) {
        throw new Error("there is already a channel with that name", 500);
    }
    req.flash("success", `created ${newRoom.name}`);
    res.end();
}));

/**
 * visit a chat room. 
 * All old messages will be displayd.
 */
router.get("/:id", isLoggedIn, async (req, res) => {
    const rooms = await Room.find({})
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
            res.render("chatroom", { id, user, currentRoom, messageList, rooms })
        })
})

/**
 * users can only delete chat rooms that thay have created themselves
 */
router.delete("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const room = await Room.findById(id).populate("creator")
    if (!(JSON.stringify(req.user._id) == JSON.stringify(room.creator._id))) {
        req.flash("error", "you do not have permission to delete this room")
        return res.end("no room was deleted")
    } else {
        await Room.findByIdAndDelete(id)
        req.flash("success", `${room.name} is now deleted`)
        res.end()
    }
})

module.exports = router