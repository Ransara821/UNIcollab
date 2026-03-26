const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: String, required: true }, // e.g., '1st Year', '2nd Year', etc.
  semester: { type: String, required: true }, // e.g., 'Semester 1', 'Semester 2'
  category: { type: String, required: true }, // QuizAPI category
  difficulty: { type: String, required: true }, // QuizAPI difficulty
  tags: { type: [String], default: [] }, // QuizAPI tags
  questionCount: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // Admin user ID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
