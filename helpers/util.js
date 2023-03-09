const Jwt = require("jsonwebtoken");
const User = require("../models/user");

class Response {
  constructor(data, success = true) {
    this.data = data;
    this.success = success;
  }
}

const tokenKey = "RUBICAMP";

const generateToken = (data) => Jwt.sign(data, tokenKey);
const decodeToken = (token) => Jwt.verify(token, tokenKey);
const isLoggedIn = async (req, res, next) => {
  try {
    const bearerToken = req.get("Authorization");
    console.log("🚀 ~ file: util.js:18 ~ isLoggedIn ~ bearerToken", bearerToken)
    const token = bearerToken?.split(" ")[1];
    // Check for token availability
    if (!token) throw { message: "Token is not found", code: 401 };
    const data = decodeToken(token);
    // Check for userid
    if (!data.userid) throw { message: "User is not authorized!", code: 401 };
    const user = await User.findById(data.userid);
    // Check if user token matched the db's token
    if (user.token !== token)
      throw { message: "User is not authorized!", code: 401 };
    req.user = data;
    next();
  } catch (error) {
    console.log("User is not authorized - isLoggedIn", error);
    res
      .status(error.code ? error.code : 401)
      .json(
        new Response(
          error.message ? error.message : "Unknown error when logging in",
          false
        )
      );
  }
};

const logOut = async (req, res, next) => {
  try {
    const bearerToken = req.get("Authorization");
    console.log("🚀 ~ token when logging out", bearerToken);
    const token = bearerToken?.split(" ")[1];
    if (!token) throw { message: "Token is not found", code: 401 };
    const data = decodeToken(token);
    if (!data.userid) throw { message: "User is not authorized", code: 401 };
    const user = await User.findById(data.userid);
    user.token = null;
    await user.save();
    res.status(200).json(new Response("you have logged out successfully."));
  } catch (error) {
    console.log(error, "error occured when logging out");
    res
      .status(error.code ? error.code : 401)
      .json(
        new Response(
          error.message ? error.message : "Unknown error when logging out",
          false
        )
      );
  }
};

module.exports = {
  Response,
  generateToken,
  decodeToken,
  isLoggedIn,
  logOut,
};
