const { Schema, model } = require("mongoose");
var bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: null,
  },
  chats: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

userSchema.methods.generateHash = async function (password) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.log(error, "generateHash error");
    return error;
  }
};

userSchema.methods.validUser = async function (username) {
  try {
    const isValid = await bcrypt.compare(username, this.username);
    console.log("🚀 ~ file: user.js:53 ~ username", username, this.username, isValid)
    return isValid;
  } catch (error) {
    console.log(error, "validUser error");
  }
};

module.exports = model("User", userSchema);