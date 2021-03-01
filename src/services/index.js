const router = require("express").Router();
const users = require("./users/index");
const comments = require("./comments/index");
const stories = require("./stories/index");
const posts = require("./posts/index");

router.use("/users", users);
router.use("/stories", stories);
router.use("/comments", comments);
router.use("/posts", posts);

module.exports = router;
