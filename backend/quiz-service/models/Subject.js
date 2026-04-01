const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  code:        { type: String, required: true, trim: true, unique: true },
  year:        { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  semester:    { type: String, required: true, enum: ['Semester 1', 'Semester 2'] },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
