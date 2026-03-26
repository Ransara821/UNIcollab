const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const leaderboardController = require('../controllers/leaderboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// ── Static routes (must come BEFORE /:id param routes) ──────────────────

// GET /api/quizzes  - list quizzes (filter by year/semester)
router.get('/', quizController.getQuizzes);

// GET /api/quizzes/leaderboard?year=...&semester=...  - global leaderboard
router.get('/leaderboard', leaderboardController.getGlobalLeaderboard);

// GET /api/quizzes/result/:attemptId  - get individual attempt result
router.get('/result/:attemptId', quizController.getQuizResult);

// GET /api/quizzes/admin/:id/attempts  - admin: view attempts for a quiz (admin only)
router.get('/admin/:id/attempts', adminOnly, leaderboardController.getAdminAttempts);

// ── Admin CRUD (must come BEFORE /:id GET route) ─────────────────────────

// POST /api/quizzes  - create a new quiz (admin only)
router.post('/', adminOnly, quizController.createQuiz);

// ── Param routes ─────────────────────────────────────────────────────────

// GET  /api/quizzes/:id  - get single quiz details
router.get('/:id', quizController.getQuizDetails);

// GET  /api/quizzes/:id/questions  - fetch questions from QuizAPI (user)
router.get('/:id/questions', quizController.getQuizQuestions);

// POST /api/quizzes/:id/submit  - submit quiz answers (user)
router.post('/:id/submit', quizController.submitQuiz);

// GET  /api/quizzes/:id/leaderboard  - per-quiz leaderboard
router.get('/:id/leaderboard', leaderboardController.getQuizLeaderboard);

// PUT  /api/quizzes/:id  - update quiz (admin only)
router.put('/:id', adminOnly, quizController.updateQuiz);

// DELETE /api/quizzes/:id  - delete quiz (admin only)
router.delete('/:id', adminOnly, quizController.deleteQuiz);

module.exports = router;
