const { Schema, model } = require("mongoose");
const Chat = require("./chat")
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
  },
  {
    timestamps: true,
  }
);

// messageSchema.pre("findOneAndDelete", function (next) {
//   Chat.deleteMany({ executor: this._conditions._id }).exec();
//   next();
// });

module.exports = model("Message", messageSchema);