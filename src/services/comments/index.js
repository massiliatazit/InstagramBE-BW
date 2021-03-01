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
route.put("/", async (req, res, next) => {
  try {
    const newComment = await Comment.find();

    res.status(201).send(newComment);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.get("/:id", async (req, res, next) => {
  try {
    const sigleComment = await Comment.findById(req.params.id);

    res.status(200).send(sigleComment);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.put("/:id", async (req, res, next) => {
  try {
    const modifiedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
        useFindAndModify: false,
      }
    );

    res.status(200).send(modifiedComment);
  } catch (error) {
    console.log(error);
  }
});

route.delete("/:id", async (req, res, next) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);

    res.status(200).send("DELETED");
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = route;
