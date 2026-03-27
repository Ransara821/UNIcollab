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
    postedById: {
      type: String,   // userId from JWT — used for recognition tracking
    },
    capacity: {
      type: Number,
      min: 1,
      max: 200,
      default: 20,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KuppiClass", KuppiClassSchema);
