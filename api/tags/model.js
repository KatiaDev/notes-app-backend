const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    name: String,
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
  });

  const Tag = mongoose.model("Tag", tagSchema);

  module.exports = { Tag };