const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const CommentSchema = new Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
