const mongoose = require('mongoose');

const RecognitionApplicationSchema = new mongoose.Schema(
  {
    studentId:      { type: String, required: true, unique: true }, // one app per student
    name:           { type: String, required: true, trim: true },
    year:           { type: String, required: true },               // e.g. "Year 2"
    specialization: { type: String, required: true, trim: true },
    qualification:  { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecognitionApplication', RecognitionApplicationSchema);
