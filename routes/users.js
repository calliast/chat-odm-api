var express = require("express");
var router = express.Router();
const User = require("../models/user");
const {
  Response,
  generateToken,
  isLoggedIn,
  logOut,
} = require("../helpers/util");

/* GET users listing. */
router
  .route("/")
  .get(isLoggedIn, async function (req, res) {
    try {
      const users = await User.find().populate("todos");
      res.status(201).json(new Response(users));
    } catch (error) {
      console.log(error, "error when accessing db");
      res.status(500).json(new Response(error, false));
    }
  })
  .post(isLoggedIn, async function (req, res) {
    try {
      const users = await User.create(req.body);
      res.status(201).json(new Response(users));
    } catch (error) {
      console.log(error, "error when adding new users");
      res.status(500).json(new Response(error, false));
    }
  });

router.route("/auth").post(async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // check if email exist and password is match
    if (!user || !(await user.validPassword(password)))
      throw { message: "email or password is wrong", code: 401 };
    // generate token
    user.token = generateToken({ userid: user._id, email: user.email });
    await user.save();
    res
      .status(201)
      .json(
        new Response({ email: user.email, name: user.name, token: user.token })
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

router.post("/logout", logOut);

router
  .route("/:id")
  .put(isLoggedIn, async function (req, res) {
    try {
      const users = await User.findOneAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(201).json(new Response(users));
    } catch (error) {
      console.log(error, "error when updating users");
      res.status(500).json(new Response(error, false));
    }
  })
  .delete(isLoggedIn, async function (req, res) {
    try {
      const users = await User.findOneAndDelete({ _id: req.params.id });
      res.status(200).json(new Response(users));
    } catch (error) {
      console.log(error, "error when deleting users");
      res.status(500).json(new Response(error, false));
    }
  });

module.exports = router;
