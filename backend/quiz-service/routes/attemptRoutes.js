const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { startAttempt, submitAttempt, getMyAttempts, getAllAttempts } = require('../controllers/attemptController');

router.get('/my', protect, getMyAttempts);
router.get('/all', protect, adminOnly, getAllAttempts);
router.post('/start', protect, startAttempt);
router.post('/:id/submit', protect, submitAttempt);

module.exports = router;
