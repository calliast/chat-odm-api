var express = require("express");
const user = require("../models/user");
var router = express.Router();
const User = require("../models/user")
const { Response } = require("../helpers/util");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  try {
    const users = await User.find();
    res.json(new Response(users));
  } catch (error) {
    res.status(500).json(new Response(error, false));
  }
});

module.exports = router;
