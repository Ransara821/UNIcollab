const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createQuiz,
  getQuizzes,
  getQuizDetails,
  updateQuiz,
  deleteQuiz,
  importQuestions
} = require('../controllers/quizController');

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, adminOnly, createQuiz);

router.route('/:id')
  .get(protect, getQuizDetails)
  .put(protect, adminOnly, updateQuiz)
  .delete(protect, adminOnly, deleteQuiz);

router.post('/:id/import', protect, adminOnly, importQuestions);

module.exports = router;
