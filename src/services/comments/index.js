const express = require("express");
const mongoose = require("mongoose");
const { authorize } = require("../auth/middleware");

const Comment = require("./schema");
const route = express.Router();

route.post("/", authorize, async (req, res, next) => {
  try {
    const newComment = new Comment({ ...req.body, userID: req.user._id });
    await newComment.save();
    const { _id } = newComment;
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.get("/:post", async (req, res, next) => {
  try {
    const newComment = await Comment.find({ post: req.params.post });
    res.status(201).send(newComment);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.put("/:id", authorize, async (req, res, next) => {
  try {
    const updatedComment = await Comment.findOneAndUpdate({ _id: req.params._id, userID: req.user._id }, req.body, {
      runValidators: true,
      new: true,
      useFindAndModify: false,
    });
    if (updatedComment) res.status(201).send(updatedComment);
    else res.status(401).send("User not Authorized");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/* route.get("/:id", async (req, res, next) => {
  try {
    const sigleComment = await Comment.findById(req.params.id);

    res.status(200).send(sigleComment);
  } catch (error) {
    console.log(error);
    next(error);
  }
}); */

/* route.put("/:id", async (req, res, next) => {
  try {
    const modifiedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
      useFindAndModify: false,
    });

    res.status(200).send(modifiedComment);
  } catch (error) {
    console.log(error);
  }
});
 */
route.delete("/:id", authorize, async (req, res, next) => {
  try {
    await Comment.findOneAndDelete({ _id: req.params.id, userID: req.user._id });
    res.status(200).send("DELETED");
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = route;
