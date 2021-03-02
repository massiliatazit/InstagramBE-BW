const express = require("express");
const PostModel = require("./schema");
const postRouter = express.Router();
const multer = require("multer");
const cloudinary = require("../../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Instagram",
    public_id: (req, res) => `${req.user.username}_${req.params.id}`,
  },
});
const cloudinaryMulter = multer({ storage: storage });
const { authorize } = require("../auth/middleware");

postRouter.post("/", authorize, async (req, res, next) => {
  try {
    const newPost = new PostModel({ ...req.body, user: req.user._id });
    const savedPost = await newPost.save();
    res.status(201).send({ post: savedPost.populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts"), ok: true });
  } catch (error) {
    res.send("Something is going wrong");
    next(error);
  }
});

postRouter.get("/home", authorize, async (req, res, next) => {
  try {
    const following = req.user.following;
    const query = following.map((followed_user) => {
      return { user: followed_user };
    });
    const allPosts = await PostModel.find({ $or: [...query, { user: req.user._id }] })
      .sort({ createdAt: -1 })
      .populate("comments.user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      .populate("tags", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      .populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");

    res.status(200).send(allPosts);
  } catch (error) {
    next(error);
  }
});
postRouter.get("/explore", authorize, async (req, res, next) => {
  try {
    const following = req.user.following;
    const query = following.map((followed_user) => {
      return { user: { $ne: followed_user } };
    });
    const allPosts = await PostModel.find({ $and: [...query, { user: { $ne: req.user._id } }] })
      .sort({ createdAt: -1 })
      .populate("comments.user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      .populate("tags", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      .populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");
    res.status(200).send(allPosts);
  } catch (error) {
    next(error);
  }
});
postRouter.get("/:id", authorize, async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id)
      .populate("comments.user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      .populate("tags", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      .populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts");
    if (post._id) {
      if (post.user.private) {
        if (req.user.following.includes(post.user._id)) res.status(200).send(post);
      } else {
        res.send.status(201).send(post);
      }
      res.status(401).send(`@${post.user.username}'s posts are private`);
    } else {
      const error = new Error("Post not found");
      error.status = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

postRouter.delete("/:id", authorize, async function (req, res, next) {
  try {
    await PostModel.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(201).send({ ok: true });
  } catch (error) {
    next(error);
  }
});
postRouter.put("/:id", authorize, async function (req, res, next) {
  try {
    const updated = await PostModel.findOneAndUpdate({ _id: req.params.id, user: req.user }, req.body);
    res.send(updated);
  } catch (error) {
    next(error);
  }
});
postRouter.put("/:id/picture", authorize, cloudinaryMulter.single("image"), async (req, res, next) => {
  try {
    const updatedPost = await PostModel.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { image: req.file.path }, { runValidators: true, new: true }).populate("user", "comments");
    res.send(updatedPost);
  } catch (error) {
    next(error);
  }
});

postRouter.post("/:id/like", authorize, async (req, res, next) => {
  try {
    const post = await PostModel.findOne({ _id: req.params.id, likes: req.user._id });
    const modifiedPost = post
      ? await PostModel.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { likes: req.user._id },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        )
      : await PostModel.findByIdAndUpdate(
          req.params.id,
          {
            $push: { likes: req.user._id },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        );
    res
      .status(201)
      .send(
        modifiedPost
          .populate("comments.user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
          .populate("tags", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
          .populate("user", "-password -refreshTokens -email -followers -following -saved -puts -tagged -posts")
      );
  } catch (error) {
    next(error);
  }
});
module.exports = postRouter;
