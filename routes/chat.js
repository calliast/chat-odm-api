var express = require("express");
var router = express.Router();
// const Chat = require("../models/chat");
const User = require("../models/user");
const Message = require("../models/message");
const { Response, isLoggedIn } = require("../helpers/util");

/* GET todo listing. */
router.route("/").get(async function (req, res) {
  try {
    const chat = await User.find();
    res.status(201).json(new Response(chat));
  } catch (error) {
    res.status(500).json(new Response(error, false));
  }
});

//. Security Check
router.use(isLoggedIn);

router
  .route("/message/:_id")
  //. route to send message
  .post(async function (req, res) {
    /**
     * NOTE: ChatID sent as params._id *
     */
    try {
      // Create a new message
      const newMessage = await Message.create(req.body);

      // Register the new messageID into chat's message field
      // This way, it will only update necessary message data into a chat
      await User.updateOne(
        { _id: req.body.sentID },
        {
          $addToSet: { chats: newMessage._id },
        },
        {
          //? upsert: Check if chatID is already in database, if chatID is not exist, create a new chatID
          upsert: true,
          //? new: return the newly updated data
          new: true,
        }
      );

      await User.updateOne(
        { _id: req.body.receiverID },
        {
          $addToSet: { chats: newMessage._id },
        },
        {
          //? upsert: Check if chatID is already in database, if chatID is not exist, create a new chatID
          upsert: true,
          //? new: return the newly updated data
          new: true,
        }
      );

      res.status(201).json(new Response({ message: newMessage }));
    } catch (error) {
      console.log("error waktu sent", error);
      res.status(500).json(new Response(error, false));
    }
  })
  //. route to update read status
  .put(async function (req, res) {
    const { messageIDs } = req.body;
    console.log("🚀 ~ file: chat.js:75 ~ messageIDs", messageIDs);
    let updateMessageIDs;
    try {
      updateMessageIDs = messageIDs.map((item) => {
        return Message.findOneAndUpdate(
          { _id: item },
          {
            $set: { readStatus: true },
          },
          { new: true }
        );
      });

      updateMessageIDs = await Promise.all(updateMessageIDs);
      console.log("🚀 ~ file: chat.js:89 ~ updateMessageIDs", updateMessageIDs);

      res.status(200).json(new Response(updateMessageIDs));
    } catch (error) {
      console.log("Error waktu delete message", error);
      res.status(500).json(new Response(error, false));
    }
  })
  //. route to delete message
  .delete(async function (req, res) {
    try {
      await Message.findOneAndUpdate(
        { _id: req.params._id },
        {
          $set: { deleteStatus: true, message: "_This message was deleted._" },
        },
        { new: true }
      );

      console.log("🚀 ~ file: chat.js:102 ~ req.params._id", req.params);
      res.status(200).json(new Response({ _id: req.params._id }));
    } catch (error) {
      console.log("Error waktu delete message", error);
      res.status(500).json(new Response(error, false));
    }
  });

router
  .route("/:id")
  //. route to load user data
  .get(async function (req, res) {
    try {
      const getUserData = await User.findOne({ username: req.params.id }, [
        "chats",
        "contacts",
      ]).populate("chats");

      const getContactList = await User.find(
        {
          username: { $ne: req.params.id },
        },
        ["_id", "username", "name"]
      );

      res.status(201).json(
        new Response({
          _id: getUserData._id,
          contacts: getContactList,
          chats: getUserData.chats,
        })
      );
    } catch (error) {
      console.log("error saat get user data", error);
      res.status(500).json(new Response(error, false));
    }
  });

module.exports = router;
