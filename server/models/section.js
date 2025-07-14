const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  section: {
    type: String,
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSection",
    },
  ],
});

module.exports = mongoose.exports("Section", sectionSchema);
