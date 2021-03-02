const express = require("express");
const mongoose = require("mongoose");
const { authorize } = require("../auth/middleware");

const Comment = require("./schema");
const route = express.Router();

route.post("/:post", authorize, async (req, res, next) => {
  try {
    const newComment = new Comment({ ...req.body, post: req.params.post, user: req.user._id });
    const { _id } = await newComment.save();
    const comment = await Comment.findById(_id).populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");
    res.status(201).send(comment);
  } catch (error) {
    next(error);
  }
});

route.get("/:post", authorize, async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.post }).populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");
    res.status(201).send(comments);
  } catch (error) {
    next(error);
  }
});

route.put("/:id", authorize, async (req, res, next) => {
  try {
    const updatedComment = await Comment.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
      runValidators: true,
      new: true,
      useFindAndModify: false,
    }).populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");
    if (updatedComment) res.status(201).send(updatedComment);
    else res.status(401).send("User not Authorized");
  } catch (error) {
    next(error);
  }
});
route.post("/:id/like", authorize, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, likes: req.user._id });
    const modifiedComment = comment
      ? await Comment.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { likes: req.user._id },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        ).populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      : await Comment.findByIdAndUpdate(
          req.params.id,
          {
            $push: { likes: req.user._id },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        ).populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");
    res.status(201).send(modifiedComment);
  } catch (error) {
    next(error);
  }
});

/* route.get("/:id", async (req, res, next) => {
  try {
    const sigleComment = await Comment.findById(req.params.id);

    res.status(200).send(sigleComment);
  } catch (error) {
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
       next(error);
  }
});
 */
route.delete("/:id", authorize, async (req, res, next) => {
  try {
    await Comment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).send("DELETED");
  } catch (error) {
    next(error);
  }
});
module.exports = route;
