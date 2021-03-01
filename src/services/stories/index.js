const express = require("express");
const mongoose = require("mongoose");
const { authorize } = require("../auth/middleware");

const Story = require("./schema");
const route = express.Router();

route.post("/", async (req, res, next) => {
  try {
    const newStory = new Story(req.body);
    await newStory.save();

    const { _id } = newStory;
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.get("/", authorize, async (req, res, next) => {
  try {
    const newStory = await Story.find({ $not: { exclude: [req.user._id] } });

    res.status(201).send(newStory);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
route.put("/", async (req, res, next) => {
  try {
    const newStory = await Story.find();

    res.status(201).send(newStory);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.get("/:id", async (req, res, next) => {
  try {
    const sigleStory = await Story.findById(req.params.id);

    res.status(200).send(sigleStory);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

route.put("/:id", async (req, res, next) => {
  try {
    const modifiedStory = await Story.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
      useFindAndModify: false,
    });

    res.status(200).send(modifiedStory);
  } catch (error) {
    console.log(error);
  }
});

route.delete("/:id", async (req, res, next) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.status(200).send("DELETED");
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = route;
