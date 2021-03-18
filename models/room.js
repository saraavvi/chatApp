const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    creator: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
})

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;

