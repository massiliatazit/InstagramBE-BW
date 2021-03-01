const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Posts", required: true }],
    saved: [{ type: Schema.Types.ObjectId, ref: "Posts", required: true }],
    followers: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    following: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    img: {
      type: String,
      required: true,
    },
    facebookId: {
      type: String,
    },
    private: {
      type: Boolean,
      default: false,
      required: true,
    },
    refreshTokens: [{ token: { type: String, required: true } }],
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};
UserSchema.pre("validate", async function (next) {
  const user = this;
  const plainPW = user.password;
  const facebook = user.facebookId;
  facebook || plainPW ? next() : next(new Error("No password provided"));
});
UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
