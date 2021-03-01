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
    const newPost = new PostModel({ ...req.body, user_id: req.user._id });
    const { _id } = await newPost.save();
    res.status(201).send({ _id, ok: true });
  } catch (error) {
    res.send("Something is going wrong");
    next(error);
  }
});

postRouter.get("/home", authorize, async (req, res, next) => {
  try {
    const following = ref.user.following;
    const query = following.map((followed_user) => {
      user_id: followed_user;
    });
    const allPosts = await PostModel.find({ $or: [...query] })
      .sort({ createdAt: -1 })
      .populate({ path: "comments", populate: { path: "user_id", model: "Users" } })
      .populate("user_id");
    res.send.status(201).send(allPosts);
  } catch (error) {
    next(error);
  }
});
postRouter.get("/explore", authorize, async (req, res, next) => {
  try {
    const following = ref.user.following;
    const query = following.map((followed_user) => {
      user_id: followed_user;
    });
    const allPosts = await PostModel.find({ $not: { $and: [...query] } })
      .sort({ createdAt: -1 })
      .populate({ path: "comments", populate: { path: "user_id", model: "Users" } })
      .populate("user_id");
    res.send.status(201).send(allPosts);
  } catch (error) {
    next(error);
  }
});
postRouter.get("/:id", authorize, async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id).populate({ path: "comments", populate: { path: "user_id", model: "Users" } });
    if (post._id) {
      if (post.user_id.private) {
        if (req.user.folowing.includes(post.user_id._id)) res.status(200).send(post);
      } else {
        res.send.status(201).send(post);
      }
      res.status(401).send();
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
    await PostModel.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    res.status(201).send({ ok: true });
  } catch (error) {
    next(error);
  }
});
postRouter.put("/:id", authorize, async function (req, res, next) {
  try {
    const updated = await PostModel.findOneAndUpdate({ _id: req.params.id, user_id: req.user_id }, req.body);
    res.send(updated);
  } catch (error) {
    next(error);
  }
});
postRouter.post("/:id/picture", authorize, cloudinaryMulter.single("postImage"), async (req, res, next) => {
  try {
    const updatedPost = await PostModel.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, { image: req.file.path }, { runValidators: true, new: true }).populate("user_id", "comments");
    res.send(updatedPost);
  } catch (error) {
    next(error);
  }
});

postRouter.post("/:id/like", authorize, async (req, res, next) => {
  try {
    await PostModel.findOneAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user._id },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    const modifiedPost = req.query.add
      ? await PostModel.findOneAndUpdate(
          req.params.id,
          {
            $push: { likes: req.user._id },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        )
      : await PostModel.findOne({ _id: req.post._id });
    res.status(201).send(modifiedPost);
  } catch (error) {
    next(error);
  }
});
module.exports = postRouter;
