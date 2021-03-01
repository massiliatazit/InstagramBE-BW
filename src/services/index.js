const router = require("express").Router();
const users = require("./users/index");
const posts = require("./posts/index");
router.use("/users", users);
router.use("/posts", posts);

module.exports = router;
