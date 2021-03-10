const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,

    },
    messages: [
        {
            sender: String,
            message: String
        }
    ],
})

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;

