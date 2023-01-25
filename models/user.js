const { Schema, model } = require("mongoose");
// const Todo = require("./todo");
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
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  chat: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
});

// userSchema.pre("save", async function (next) {
//   var user = this;
//   try {
//     // only hash the username if it has been modified
//     if (!user.isModified("username")) return next();
//     // generate a salt
//     user.username = await bcrypt.hash(user.username, saltRounds);
//     next();
//   } catch (error) {
//     console.log("Error occured when saving the username", error);
//   }
// });

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

// userSchema.pre("findOneAndDelete", function (next) {
//   Todo.deleteMany({ executor: this._conditions._id }).exec();
//   next();
// });

module.exports = model("User", userSchema);
