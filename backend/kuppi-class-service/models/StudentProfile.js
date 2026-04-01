const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    recognitionStatus: {
      type: String,
      enum: ['normal', 'recognized'],
      default: 'normal',
    },
    completedSessionsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
