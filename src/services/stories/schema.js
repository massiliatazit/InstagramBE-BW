const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const StorySchema = new Schema(
  {
    userID: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    video: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      min: 10,
      max: 30,
    },
    exclued: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);
