const express = require("express");
const PostModel = require("./schema");
const postRouter = express.Router();
const cloudinary = require("../../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Instagram",
  },
});
const cloudinaryMulter = multer({ storage: storage });

postRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body);
    const { _id } = await newPost.save();
    res.status(201).send(_id);
  } catch (error) {
    res.send("Something is going wrong");
    next(error);
  }
});

postRouter.get("/", async (req, res, next) => {
  try {
    const allPosts = await PostModel.find()
      .populate({ path: "Comments", populate: { path: "user_id", model: "Users" } })
      .populate("user_id");
    res.send.status(201).send(allPosts);
  } catch (error) {
    next(error);
  }
});
postRouter.get("/:id", async (req, res, next) => {
  try {
    const allPosts = await PostModel.findById(req.params.id)
      .populate({ path: "Comments", populate: { path: "user_id", model: "Users" } })
      .populate("user_id");
    res.send.status(201).send(allPosts);
  } catch (error) {
    next(error);
  }
});

postRouter.delete("/:id", async function (req, res, next) {
  try {
    PostToDelete = await PostModel.findByIdAndDelete(req.params.id);
    res.send(deleted);
  } catch (error) {
    next(error);
  }
});
postRouter.put("/:id", async function (req, res, next) {
  try {
    PostToDelete = await PostModel.findByIdAndUpdate(req.params.id, req.body);
    res.send(updated);
  } catch (error) {
    next(error);
  }
});
postRouter.post("/:id/picture", cloudinaryMulter.single("postImage"), async (req, res, next) => {
  try {
    const updatedPost = await PostModel.findByIdAndUpdate(req.params.id, { image: req.file.path }, { runValidators: true, new: true });
    res.send(updatedPost);
  } catch (error) {
    next(error);
  }
});

postRouter.post("/:id/like/:userID", async (req, res, next) => {
  try {
    await PostModel.findOneAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.params.userID },
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
            $push: { likes: req.params.userID },
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
