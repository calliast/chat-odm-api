var express = require("express");
var router = express.Router();
const Chat = require("../models/chat");
const User = require("../models/user");
const Message = require("../models/message");
const { Response } = require("../helpers/util");
const { Types } = require("mongoose");

/* GET todo listing. */
router.route("/").get(async function (req, res) {
  try {
    const chat = await User.find();
    res.status(201).json(new Response(chat));
  } catch (error) {
    res.status(500).json(new Response(error, false));
  }
});

router.route("/sent").post(async function (req, res) {
  const { sentID, receiverID, chatID } = req.body;
  let chatId = chatID;
  try {
    // Correct sender and receiver ID
    const sent = await User.find({ username: sentID });
    const receiver = await User.find({ username: receiverID });
    const data = {
      ...req.body,
      sentID: sent[0]._id,
      receiverID: receiver[0]._id,
    };

    // Create a new message
    const newMessage = await Message.create(data);

    // Determine whether its an existing chat or create anew
    if (!chatID) {
      chatId = Types.ObjectId();
    }

    const chat = await Chat.findOne({ _id: chatId });

    // Separate the message into update object
    let updates = {
      //? $push: Then register the new chatID into the sender's chat
      $push: { conversations: newMessage._id },
    };

    if (!chat) {
      //. If it's a new chatID then assign a new contactName
      updates.$set = { contactName: `${receiverID}$_&_$${sentID}` };
    }

    // Register the new messageID into chat's message field
    // This way, it will only update necessary message data into a chat
    //. if it's new, then register a new contactName and messageID
    //. if it's updating an existing chat, then register only messageID

    const updatedChat = await Chat.findOneAndUpdate({ _id: chatId }, updates, {
      upsert: true,
      //? upsert: Check if chatID is already in database, if chatID is not exist, create a new chatID
      new: true,
      //? new: return the newly updated data
    });

    //. and if it's new, Register the new chatID into sender's chat field
    if (!chat) {
      await User.findOneAndUpdate(
        { _id: sent[0]._id },
        { $push: { chat: updatedChat._id } }
      );
      await User.findOneAndUpdate(
        { _id: receiver[0]._id },
        { $push: { chat: updatedChat._id } }
      );
    }

    res.status(201).json(new Response({ newMessage, updatedChat }));
  } catch (error) {
    console.log("error waktu sent", error);
    res.status(500).json(new Response(error, false));
  }
});

router.route("/data").post(async function (req, res) {
  try {
    const getChatID = await Chat.find(
      { contactName: req.body.contactName },
      "_id"
    );
    res.status(201).json(new Response(getChatID[0]));
  } catch (error) {
    console.log("error waktu receive", error);
    res.status(500).json(new Response(error, false));
  }
});

router
  .route("/:id")
  .get(async function (req, res) {
    console.log("data username", req.params.id);
    try {
      const getUserData = await User.findOne({ username: req.params.id }, [
        "chat",
        "contacts",
      ]);

      res.status(201).json(new Response(getUserData));
    } catch (error) {
      console.log("error saat get user data", error);
      res.status(500).json(new Response(error, false));
    }
  })
  .post(async function (req, res) {
    try {
      const findContact = await User.findOne({
        username: req.body.contactUsername,
      });
      if (!findContact) throw findContact;
      await User.updateOne(
        { username: req.params.id },
        { $addToSet: { contacts: findContact._id } },
        { new: true }
      );
      res.status(201).json(new Response(findContact));
    } catch (error) {
      console.log("error saat adding contact", error);
      res.status(500).json(new Response(error, false));
    }
  })
  .delete(async function (req, res) {
    try {
      const deleteFromChat = await Chat.findOneAndUpdate(
        { conversations: req.params.id },
        { $pull: { conversations: req.params.id } },
        { new: true }
      );

      await Message.findOneAndDelete({
        _id: req.params.id,
      });
      res.status(200).json(new Response(deleteFromChat));
    } catch (error) {
      res.status(500).json(new Response(error, false));
    }
  });

module.exports = router;
