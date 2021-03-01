const express = require("express");
const mongoose = require("mongoose");
const Comment = require("./schema");
const route = express.Router();

route.post("/", async (req, res, next) => {
  try {
    const newComment = new Comment(req.body);
    await newComment.save();

    const { _id } = newComment;
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.get("/", async (req, res, next) => {
  try {
    const newComment = await Comment.find();

    res.status(201).send(newComment);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = route;
