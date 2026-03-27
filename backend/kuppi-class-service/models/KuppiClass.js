const mongoose = require("mongoose");
const { SUBJECTS, ACADEMIC_YEARS } = require('../constants/filterOptions');

const KuppiClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      enum: SUBJECTS,
    },
    academicYear: {
      type: String,
      required: true,
      enum: ACADEMIC_YEARS,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    postedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KuppiClass", KuppiClassSchema);
