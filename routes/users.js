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
      const users = await User.find();
      console.log(req.token, "saat akses user");
      // .populate("todos");
      res.status(201).json(new Response(users));
    } catch (error) {
      console.log(error, "error when accessing db");
      res.status(500).json(new Response(error, false));
    }
  })
  .post(async function (req, res) {
    try {
      const user = await User.create(req.body);
      res.status(201).json(new Response(user));
    } catch (error) {
      console.log(error, "error when adding a new user");
      res.status(500).json(new Response(error, false));
    }
  });

// SELECT DATA, UPDATE, AND DELETE
router
  .route("/:id")
  .post(async function (req, res) {
    try {
      const user = await User.findOne({ username: req.params.id}, req.body.query)
      res.status(201).json(new Response(user));
    } catch (error) {
      console.log(error, "error when updating a user");
      res.status(500).json(new Response(error, false));
    }
  })
  .put(async function (req, res) {
    try {
      const user = await User.findOneAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(201).json(new Response(user));
    } catch (error) {
      console.log(error, "error when updating a user");
      res.status(500).json(new Response(error, false));
    }
  })
  .delete(async function (req, res) {
    try {
      const user = await User.findOneAndDelete({ _id: req.params.id });
      res.status(200).json(new Response(user));
    } catch (error) {
      console.log(error, "error when deleting a user");
      res.status(500).json(new Response(error, false));
    }
  });

module.exports = router;
