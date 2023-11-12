const express = require("express");
const { Tag } = require("./model");
const { restrict } = require("../auth/middleware");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
      const tags = await Tag.find()
        .populate("notes")
        .exec();

      res.status(200).json(tags);
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const newTag = await new Tag({ ...req.body }).save();
      res.status(201).json(newTag);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:tag_id", async (req, res, next) => {
    try {
      const tag = await Tag.findById({
        _id: req.params.tag_id,
      })
        .populate("notes")
        .exec();
      res.status(200).json(tag);
    } catch (err) {
      next(err);
    }
  });

  module.exports = router;
