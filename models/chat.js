const { Schema, model } = require("mongoose");

const chatSchema = new Schema(
  {
    contactName: { type: String, required: true },
    conversation: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Chat", chatSchema);
