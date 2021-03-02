const express = require("express");
const mongoose = require("mongoose");
const { authorize } = require("../auth/middleware");

const Notification = require("./schema");
const route = express.Router();

const q2m = require("query-to-mongo");

route.post("/approveFollow", authorize, async (req, res, next) => {
  try {
    //user that requested the follow and add to his following list and also add to current user followers listEndpoints
    //set notification to viewd true
    //create new notification for both users about the update
  } catch (error) {
    next(error);
  }
});
route.get("/", authorize, async (req, res, next) => {
  try {
    //get the notification for current user
  } catch (error) {
    next(error);
  }
});
route.post("/view", authorize, async (req, res, next) => {
  try {
    //set viewd true and return ok true
  } catch (error) {
    next(error);
  }
});
module.exports = route;
