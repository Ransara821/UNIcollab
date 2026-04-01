const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getQuestionsForQuiz, createQuestion } = require('../controllers/questionController');

router.route('/')
  .get(protect, getQuestionsForQuiz)
  .post(protect, adminOnly, createQuestion);

module.exports = router;
