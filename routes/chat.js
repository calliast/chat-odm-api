var express = require("express");
var router = express.Router();
const Chat = require("../models/chat");
const User = require("../models/user");
const Message = require("../models/message");
const { Response } = require("../helpers/util");
const { Types } = require("mongoose");
const { findOne } = require("../models/chat");

/* GET todo listing. */
router.route("/").get(async function (req, res) {
  try {
    const chat = await User.find();
    res.status(201).json(new Response(chat));
  } catch (error) {
    res.status(500).json(new Response(error, false));
  }
});

router
  .route("/message/:_id")
  //. route to send message
  .post(async function (req, res) {
    /**
     * NOTE: ChatID sent as _id *
     */
    try {
      // Create a new message
      const newMessage = await Message.create(req.body);

      // Register the new messageID into chat's message field
      // This way, it will only update necessary message data into a chat
      await Chat.updateOne(
        { _id: req.params._id },
        {
          $addToSet: { conversation: newMessage._id },
        },
        {
          //? upsert: Check if chatID is already in database, if chatID is not exist, create a new chatID
          upsert: true,
          //? new: return the newly updated data
          new: true,
        }
      );

      const chat = await Chat.findOne({ _id: req.params._id }, [
        "_id",
        "contactName",
        "unreadCount",
      ]);

      res.status(201).json(new Response({ message: newMessage, chat }));
    } catch (error) {
      console.log("error waktu sent", error);
      res.status(500).json(new Response(error, false));
    }
  });

router
  .route("/message/status")
  .post(async function (req, res) {
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
  }) //. route to update read status
  .put(async function (req, res) {
    const { messageIDs } = req.body;
    console.log("🚀 ~ file: chat.js:75 ~ messageIDs", messageIDs)
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
      console.log("🚀 ~ file: chat.js:89 ~ updateMessageIDs", updateMessageIDs)

      res.status(200).json(new Response(updateMessageIDs));
    } catch (error) {
      console.log("Error waktu delete message", error);
      res.status(500).json(new Response(error, false));
    }
  })

  router
  .route("/message/:_id")
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
        
        console.log("🚀 ~ file: chat.js:102 ~ req.params._id", req.params)
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
      ])
        .populate({
          path: "chats",
          select: "_id contactName conversation",
          populate: {
            path: "conversation",
            model: "Message",
          },
        })
        .populate({
          path: "contacts",
          select: "_id username name",
        });

      res.status(201).json(new Response(getUserData));
    } catch (error) {
      console.log("error saat get user data", error);
      res.status(500).json(new Response(error, false));
    }
  })
  //. route to add contact
  .post(async function (req, res) {
    try {
      // getContact data
      const findContact = await User.findOne(
        {
          username: req.body.contactUsername,
        },
        { _id: 1, username: 1, name: 1 }
      );

      if (!findContact) throw findContact;

      const findUserContact = await User.findOne(
        {
          username: req.params.id,
        },
        { _id: 1, username: 1, name: 1 }
      );

      if (!findUserContact) throw findUserContact;

      // create new chatID
      let createChat = { _id: req.body.chatID };
      if (!req.body.chatID) {
        createChat = await Chat.create({
          contactName: `${req.params.id}$_&_$${req.body.contactUsername}`,
        });
      } else {
        createChat = await Chat.findById(req.body.chatID).populate(
          "conversation"
        );
      }

      // push the contact data and new chatID into user's data
      await User.updateOne(
        { username: req.params.id },
        { $addToSet: { contacts: findContact._id, chats: createChat._id } },
        { new: true }
      );

      // push the new chatID into contact's data
      await User.updateOne(
        { username: req.body.contactUsername },
        { $addToSet: { contacts: findUserContact._id, chats: createChat._id } },
        { new: true }
      );

      res
        .status(201)
        .json(new Response({ chat: createChat, contact: findContact }));
    } catch (error) {
      console.log("error saat adding contact", error);
      res.status(500).json(new Response(error, false));
    }
  });

module.exports = router;
