const {Schema, model} = require("mongoose")

const messageSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    sentBy: {type: Schema.Types.ObjectId, ref: 'User'},
    readStatus: {
        type: Boolean,
        default: false
    },
    sentStatus: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
})

module.exports = model("Message", messageSchema)