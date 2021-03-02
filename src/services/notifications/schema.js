const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const Notification = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    to: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    action: {
      type: String,
      enum: ["liked your post", "left a comment", "started following you", "asked to follow you", "accepted your follow request", "tagged you"],
    },
    post: { type: Schema.Types.ObjectId, ref: "Posts" },
    viewed: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);
