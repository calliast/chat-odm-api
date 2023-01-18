const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: String,
});

module.exports = model("User", userSchema);
