const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    chatmessage: {
        type: String
    },
    sender: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    }
})

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;