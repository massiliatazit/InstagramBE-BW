const express = require("express");

const UserSchema = require("./schema");

const usersRouter = express.Router();

const { authorize } = require("../auth/middleware");

const { authenticate, refreshToken } = require("../auth/tools");

const passport = require("passport");

const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const multer = require("multer");

const q2m = require("query-to-mongo");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Instagram",
    format: async (req, file) => "png" || "jpg",
    public_id: (req, file) => req.username + "_profile",
    width: 300,
    height: 300,
    effect: "improve",
    gravity: "face",
    crop: "fit",
  },
});

const parser = multer({ storage: storage });
//FACEBOOK LOG IN
usersRouter.get("/facebookLogin", passport.authenticate("facebook", { scope: ["public_profile", "email"] }));

usersRouter.get("/facebookRedirect", passport.authenticate("facebook"), async (req, res, next) => {
  try {
    /*     res.cookie("token", req.user.tokens.token, {
      httpOnly: true,
    });
    res.cookie("refreshToken", req.user.tokens.refreshToken, {
      httpOnly: true,
      path: "/users/refreshToken",
    });
 */
    res.status(200).redirect(`${process.env.FE_URL}/home?token=${req.user.tokens.token}&refreshToken=${req.user.tokens.refreshToken}`);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserSchema({ img: "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg", ...req.body });
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.findByCredentials(email, password);
    if (user) {
      /*       const tokens = await authenticate(user);
      res.cookie("token", tokens.token, {
        httpOnly: true,
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        path: "/users/refreshToken",
      }); */
      res.status(201).send({ ok: true, tokens });
    } else {
      const err = new Error("User with email and password not found");
      err.status = 401;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/logOut", authorize, async (req, res, next) => {
  try {
    if (req.token) {
      req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== req.token);
      await req.user.save();
      /*res.cookie("token", "", {
        httpOnly: true,
      });
      res.cookie("refreshToken", "", {
        httpOnly: true,
        path: "/users/refreshToken",
      }); */
      res.status(201).redirect(`${process.env.FE_URL}/logIn`);
    } else {
      const err = new Error("Token not provided");
      err.status = 401;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/logOutAll", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = [];
    await req.user.save();
    res.status(201).redirect(`${process.env.FE_URL}/logIn`);
  } catch (error) {
    next(error);
  }
});
usersRouter.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const newTokens = await refreshToken(oldRefreshToken);
      if (newTokens) {
        /*      res.cookie("token", newTokens.token, {
          httpOnly: true,
        });
        res.cookie("refreshToken", newTokens.refreshToken, {
          httpOnly: true,
          path: "/users/refreshToken",
        }); */
        res.status(201).send({ ok: true, tokens: newTokens });
      } else {
        const err = new Error("Provided refresh tocken is incorrect");
        err.httpStatusCode = 403;
        next(err);
      }
    } catch (error) {
      next(error);
    }
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UserSchema.find(req.query.search && { $text: { $search: req.query.search } })
      .sort({ createdAt: -1 })
      .skip(req.query.page && (req.query.page - 1) * 10)
      .limit(10);
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", authorize, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserSchema.findById(req.user._id).populate("posts");
      user.followers = user.followers.length;
      user.following = user.following.length;
      user.numPosts = user.posts.length;
      res.send(user);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading users list a problem occurred!");
  }
});
usersRouter.post("/me/follow/:username", authorize, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserSchema.findOne({ username: req.params.username }).populate("posts");
      const indexLoggedIn = req.user.following.findindex((id) => id === user._id);
      const idexUser = user.followers.findindex((id) => id === user._id);
      if (indexLoggedIn !== -1) {
        req.user.following = [...req.user.following.splice(0, indexLoggedIn), ...req.user.following.splice(indexLoggedIn + 1)];
        user.followers.followers = [...user.followers.splice(0, idexUser), ...user.followers.splice(idexUser + 1)];
      } else {
        req.user.following.concat(user._id);
        user.followers.concat(req.user._id);
      }
      req.user.save();
      user.save();
      user.followers = user.followers.length;
      user.following = user.following.length;
      user.numPosts = user.posts.length;
      res.status(201).send(user);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading users list a problem occurred!");
  }
});

usersRouter.get("/:username", authorize, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserSchema.findOne({ username: req.params.username }).populate("posts");
      user.followers = user.followers.length;
      user.following = user.following.length;
      user.numPosts = user.posts.length;
      user.follow = req.user.following.includes(user._id);

      if (user.private) {
        if (user.follow) {
          res.send(user);
        } else {
          user.posts = [];
          res.send(user);
        }
      } else {
        res.send(user);
      }
    } else {
      const error = new Error();
      error.httpStatusCode = 401;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading users list a problem occurred!");
  }
});
usersRouter.get("/:username/followers", authorize, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserSchema.findOne({ username: req.params.username }).populate("followers");
      if (user.private) {
        if (req.user.following.includes(user._id)) {
          res.send(user.followers);
        } else {
          const error = new Error();
          error.httpStatusCode = 401;
          next(error);
        }
      } else {
        res.send(user.followers);
      }
    } else {
      const error = new Error();
      error.httpStatusCode = 401;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading users list a problem occurred!");
  }
});

usersRouter.get("/:username/following", authorize, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserSchema.findOne({ username: req.params.username }).populate("following");
      if (user.private) {
        if (req.user.following.includes(user._id)) {
          res.send(user.following);
        } else {
          const error = new Error();
          error.httpStatusCode = 401;
          next(error);
        }
      } else {
        res.send(user.following);
      }
    } else {
      const error = new Error();
      error.httpStatusCode = 401;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading users list a problem occurred!");
  }
});

usersRouter.put("/me", authorize, async (req, res, next) => {
  try {
    if (req.user) {
      const updates = Object.keys(req.body);
      updates.forEach((update) => (req.user[update] = req.body[update]));
      await req.user.save();
      res.send(req.user);
    } else {
      const error = new Error(`user with id ${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me/profileImage", authorize, parser.single("image"), async (req, res, next) => {
  try {
    if (req.user) {
      req.user.img = req.file.path;
      await req.user.save();
      res.send(req.user);
    } else {
      const error = new Error(`user with id ${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", authorize, async (req, res, next) => {
  try {
    if (req.user) {
      await req.user.deleteOne(res.send("Deleted"));
    } else {
      const error = new Error(`user with id ${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/saved/:id", authorize, async (req, res, next) => {
  try {
    await UserSchema.findOneAndUpdate(
      { _id: req.user._id },
      {
        $pull: { saved: req.params.id },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    const modifiedUser = req.query.add
      ? await UserSchema.findOneAndUpdate(
          { _id: req.user._id },
          {
            $push: { saved: req.params.id },
          },
          {
            new: true,
            useFindAndModify: false,
          }
        )
      : await UserSchema.findOne({ _id: req.user._id });
    res.status(201).send(modifiedUser);
  } catch (error) {
    next(error);
  }
});
module.exports = usersRouter;
