const {Schema, model} = require("mongoose")
const User = require("./user")

const chatSchema = new Schema({
    chatId : {
        type: String,
        unique: true,
        default: crypto.randomUUID()
    },
    users: [{type: Schema.Types.ObjectId, ref: "User"}],
    message: [{
        type: Schema.Types.ObjectId, ref: "Message"
    }]
})

module.exports = model("Chat", chatSchema)