const express = require("express");
const mongoose = require("mongoose");
const { Note } = require("./model");
const { Tag } = require("../tags/model");
const { validateNote, checkNoteExists } = require("./middleware");
const { restrict } = require("../auth/middleware");
const error = require("../middleware/error");

const router = express.Router();

router.get("/", restrict, async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.decoded.user_id })
      .populate("tags")
      .exec();

    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
});

router.get("/:note_id", restrict, checkNoteExists, async (req, res, next) => {
  try {
    const userNote = await Note.findOne({
      user: req.decoded.user_id,
      _id: req.params.note_id,
    })
      .populate("tags")
      .exec();
    res.status(200).json(userNote);
  } catch (err) {
    next(err);
  }
});

router.post("/", restrict, validateNote, async (req, res, next) => {
  console.log("req.body: ", req.body);
  var tags = [];
  var note = {};

  new Note({
    title: req.body.title,
    content: req.body.content,
    user: req.decoded.user_id,
  })
    .save()
    .then((newNote) => {
      note = newNote;
      req.body.tags.forEach((el) => {
        Tag.findOne({ name: el })
          .exec()
          .then((foundTag) => {
            if (!foundTag) {
              new Tag({
                name: el,
                notes: [mongoose.Types.ObjectId(newNote._id)],
              })
                .save()
                .then((newTag) => {
                  tags.push(mongoose.Types.ObjectId(newTag._id));

                  Note.findByIdAndUpdate(
                    { _id: note._id },
                    {
                      $push: { tags: newTag._id }
                    },
                  )
                    .exec()
                    .then((updNote) => {
                      note=updNote;
                    })
                });
            } else {
              Tag.findByIdAndUpdate(
                { _id: foundTag._id },
                {
                  notes: [
                    ...foundTag.notes,
                    mongoose.Types.ObjectId(newNote._id),
                  ],
                },
              )
                .exec()
                .then((tag) => {
                  tags.push(mongoose.Types.ObjectId(tag._id));
                  Note.findByIdAndUpdate(
                    { _id: note._id },
                    {
                      $push: { tags: tag._id }
                      //tags: [...note.tags, mongoose.Types.ObjectId(tag._id)],
                    },
                  )
                    .exec()
                    .then((updNote) => {
                      note=updNote;
                    })
                });
            }
          });
      });
      res.status(200).json(note);
    })
    .catch(next);
});

router.put(
  "/:note_id",
  restrict,
  validateNote,
  checkNoteExists,
  async (req, res, next) => {
    const bodyReducer = Object.keys(req.body).reduce((acc, curr) => {
      if (req.body[curr] && curr !== "user") {
        acc[curr] = req.body[curr];
      }
      return acc;
    }, {});

    try {
      const updatedNote = await Note.findOneAndUpdate(
        {
          _id: req.params.note_id,
          user: req.decoded.user_id,
        },
        bodyReducer,
      ).exec();
      res.status(200).json(updatedNote);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:note_id",
  restrict,
  checkNoteExists,
  async (req, res, next) => {
    try {
      const deletedNote = await Note.findOneAndDelete({
        _id: req.params.note_id,
        user: req.decoded.user_id,
      }).exec();
      res.status(200).json(deletedNote);
    } catch (err) {
      next(err);
    }
  },
);
module.exports = router;
