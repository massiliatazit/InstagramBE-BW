const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const CommentSchema = new Schema(
  {
    UserID: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: true,
    },
    like: {
      type: [],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
