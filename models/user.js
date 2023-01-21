const { Schema, model } = require("mongoose");
const Todo = require("./todo");
var bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: null,
  },
  todos: [{ type: Schema.Types.ObjectId, ref: "Todo" }],
});

userSchema.pre("save", async function (next) {
  var user = this;
  try {
    // only hash the password if it has been modified
    if (!user.isModified("password")) return next();
    // generate a salt
    user.password = await bcrypt.hash(user.password, saltRounds);
    next();
  } catch (error) {
    console.log("save error", error);
  }
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

userSchema.methods.validPassword = async function (password) {
  try {
    const isValid = await bcrypt.compare(password, this.password);
    return isValid;
  } catch (error) {
    console.log(error, "validPassword error");
  }
};

userSchema.pre("findOneAndDelete", function (next) {
  Todo.deleteMany({ executor: this._conditions._id }).exec();
  next();
});

module.exports = model("User", userSchema);
