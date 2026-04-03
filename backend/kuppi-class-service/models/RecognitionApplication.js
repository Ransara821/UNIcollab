const mongoose = require('mongoose');

const RecognitionApplicationSchema = new mongoose.Schema(
  {
    studentId:      { type: String, required: true, unique: true, sparse: true },
    name:           { type: String, required: true, trim: true },
    year:           { type: String, required: true },
    specialization: { type: String, required: true, trim: true },
    qualification:  { type: String, required: true, trim: true },
    status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecognitionApplication', RecognitionApplicationSchema);
