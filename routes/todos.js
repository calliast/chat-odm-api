var express = require("express");
var router = express.Router();
const Todo = require("../models/todo");
const User = require("../models/user");
const { Response } = require("../helpers/util");

/* GET todo listing. */
router
  .route("/")
  .get(async function (req, res) {
    try {
      const todo = await Todo.find().populate("executor");
      res.status(201).json(new Response(todo));
    } catch (error) {
      res.status(500).json(new Response(error, false));
    }
  })
  .post(async function (req, res) {
    try {
      const user = await User.findById(req.body.executor);
      const todo = await Todo.create(req.body);
      user.todos.push(todo._id);
      await user.save();
      res.status(201).json(new Response(todo));
    } catch (error) {
      res.status(500).json(new Response(error, false));
    }
  });

router
  .route("/:id")
  .put(async function (req, res) {
    try {
      const todo = await Todo.findOneAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(201).json(new Response(todo));
    } catch (error) {
      res.status(500).json(new Response(error, false));
    }
  })
  .delete(async function (req, res) {
    try {
      const todo = await Todo.findByIdAndRemove(req.params.id);
      const user = await User.findById(todo.executor);
      user.todos = user.todos.filter((item) => !item.equals(todo._id))
      await user.save();
      res.status(200).json(new Response(todo));
    } catch (error) {
      res.status(500).json(new Response(error, false));
    }
  });

module.exports = router;
