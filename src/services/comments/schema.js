const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const CommentSchema = new Schema(
  {
    userID: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: true,
    },
    like: {
      type: [],
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
