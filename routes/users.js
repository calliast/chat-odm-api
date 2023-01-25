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

// Login
router.route("/auth").post(async function (req, res) {
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
      exp: Math.floor(Date.now() / 1000) + (60 * 5),
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

router.post("/validate", isLoggedIn, async function (req, res) {
  try {
    console.log(req.user, 'data user');
    res.status(200).json(new Response(req.user));
  } catch (error) {
    res.status(500).json(new Response(error, false));
  }
});

router.post("/logout", logOut);

// UPDATE AND DELETE
router
  .route("/:id")
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

/*
yaqin: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2M2NkMTY0NTU2ODA1MTMxNTNjMTcwNTEiLCJuYW1lIjoiWWFxaW4iLCJpYXQiOjE2NzQzODYwMzR9.0qHvsV9soQaKVvWgEn8XrbpvqSGXSZ0eN6n69cclF6g
ikhsan: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2M2NkMTU1Yzc3ZmY3ZjMwZTVjZWUyOWEiLCJuYW1lIjoiSWtoc2FuIiwiaWF0IjoxNjc0Mzg2MTU1fQ.gFMy2i9xyl0aL5xQRbbSKUDJCF400F_L-81l_gBYm7E
tantowi: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2M2NkMTY1MTU2ODA1MTMxNTNjMTcwNTMiLCJuYW1lIjoiVGFudG93aSIsImlhdCI6MTY3NDM4NjEzN30.qvdx_epab2Q7j9jezIOyargqJGUGvnq-LBU9gb7aoWM
fajar: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2M2NkMTYzYjU2ODA1MTMxNTNjMTcwNGYiLCJuYW1lIjoiRmFqYXIiLCJpYXQiOjE2NzQzODYxNzB9.e6kVc6E7mqVsEoth1oiIRuCPSOpocxZLaPSaI7PcnmY
rahmat: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2M2NkMTY1YTU2ODA1MTMxNTNjMTcwNTUiLCJuYW1lIjoiUmFobWF0IiwiaWF0IjoxNjc0Mzg2MTgzfQ.jsl6AyvwV5XlS5TljEbLHZvigPPrD0_u_truR_DSwDw
abang: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2M2NkMjZhNGExMzc3ZWZjN2UwNmFiN2UiLCJuYW1lIjoiQWJhbmciLCJpYXQiOjE2NzQzODkyNTB9.G10kh9kWxQjwXtMcxFMqIh-H5jibt3qID3EzDnjFDTU
*/
