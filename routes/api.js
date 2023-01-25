var express = require("express");
var router = express.Router();
const User = require("../models/user");
const {
  Response,
  generateToken,
  isLoggedIn,
  logOut,
} = require("../helpers/util");

// Login
router.route("/auth/signin").post(async function (req, res) {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    // check if username exist
    if (!user)
      //|| !(await user.validUser(username)))
      throw { message: "username doesn't exist", code: 401 };
    // generate token
    user.token = generateToken({
      userid: user._id,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
    });
    await user.save();
    res.status(201).json(
      new Response({
        username: user.username,
        name: user.name,
        token: user.token,
      })
    );
  } catch (error) {
    console.log(error, "unknown error when authenticating");
    res
      .status(error.code ? error.code : 500)
      .json(
        new Response(
          error.message ? error.message : "unknown error when authenticating",
          false
        )
      );
  }
});

router.post("/auth/signout", logOut);

router.post("/validate", isLoggedIn, async function (req, res) {
  try {
    console.log(req.user, "data user");
    res.status(200).json(new Response(req.user));
  } catch (error) {
    res.status(500).json(new Response(error, false));
  }
});

