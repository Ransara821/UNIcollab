const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  wrongCount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: { type: Array, required: true }, // Store user answers for review
  submittedAt: { type: Date, default: Date.now },
  duration: { type: Number }, // in seconds
  year: { type: String, required: true },
  semester: { type: String, required: true }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
