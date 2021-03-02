const { Schema, model } = require("mongoose");

const PostSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
    tags: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    images: { type: String, default: "https://via.placeholder.com/500", required: true },
  },
  { timesstamps: true }
);
//push comments into posts

PostSchema.static("addCommentToPost", async (commentId, postId) => {
  await PostModel.findByIdAndUpdate(postId, { $push: { comments: commentId } }, { runValidators: true, new: true });
});
const PostModel = model("Posts", PostSchema);
module.exports = PostModel;
