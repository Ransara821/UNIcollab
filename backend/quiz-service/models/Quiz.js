const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  description:     { type: String, required: true },
  subjectId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  year:            { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  semester:        { type: String, required: true, enum: ['Semester 1', 'Semester 2'] },
  difficulty:      { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  totalMarks:      { type: Number, default: 0 },
  passMark:        { type: Number, required: true, min: 0 },
  timeLimit:       { type: Number, required: true, min: 1 }, // in minutes
  attemptsAllowed: { type: Number, default: 1, min: 1 },
  status:          { type: String, enum: ['draft', 'published'], default: 'draft' },
  createdBy:       { type: String, required: true },
  importedFrom:    { type: String, default: 'manual' }, // 'manual' | 'quizapi'
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

quizSchema.virtual('questionCount', {
  ref:          'Question',
  localField:   '_id',
  foreignField: 'quizId',
  count:        true,
});

quizSchema.virtual('questions', {
  ref:          'Question',
  localField:   '_id',
  foreignField: 'quizId',
});

module.exports = mongoose.model('Quiz', quizSchema);
