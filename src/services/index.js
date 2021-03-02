const router = require("express").Router();
const users = require("./users/index");
const comments = require("./comments/index");
const stories = require("./stories/index");
const posts = require("./posts/index");
const notification = require("./notifications/index");

router.use("/users", users);
router.use("/stories", stories);
router.use("/comments", comments);
router.use("/posts", posts);
router.use("/notification", notification);

module.exports = router;
