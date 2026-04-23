const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedAnswer: { type: String },
  correctAnswer:  { type: String, required: true },
  isCorrect:      { type: Boolean, required: true },
  marksAwarded:   { type: Number, default: 0 },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  studentId:     { type: String, required: true },
  userName:      { type: String, required: true },
  quizId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers:       [answerSchema],
  score:         { type: Number, default: 0 },
  totalQuestions:{ type: Number, default: 0 },
  correctCount:  { type: Number, default: 0 },
  wrongCount:    { type: Number, default: 0 },
  status:        { type: String, enum: ['in-progress', 'completed', 'timeout'], default: 'in-progress' },
  startedAt:     { type: Date, default: Date.now },
  submittedAt:   { type: Date },
  durationUsed:  { type: Number, default: 0 }, // in seconds
  year:          { type: String },
  semester:      { type: String },
  subjectId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
