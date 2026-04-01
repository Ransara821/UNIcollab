const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  key:  { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  quizId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionText:  { type: String, required: true },
  options:       { type: [optionSchema], validate: v => v.length >= 2 && v.length <= 6 },
  correctAnswer: { type: String, required: true },
  explanation:   { type: String },
  marks:         { type: Number, default: 1, min: 1 },
  source:        { type: String, default: 'manual' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
