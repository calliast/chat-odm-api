const { Schema, model } = require("mongoose");
const Chat = require("./chat");
const messageSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sentID: { type: Schema.Types.ObjectId, ref: "User" },
    receiverID: { type: Schema.Types.ObjectId, ref: "User" },
    readStatus: {
      type: Boolean,
      default: false,
    },
    sentStatus: {
      type: Boolean,
      default: false,
    },
    deleteStatus: {
      type: Boolean,
      default: false,
    },
    receivedStatus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// messageSchema.pre("save", async function (next, reqId) {
//   const Message = this
//   this.reqId = reqId
//   console.log("🚀 ~ file: message.js:34 ~ req", req)
  
//   next();
// });

module.exports = model("Message", messageSchema);
