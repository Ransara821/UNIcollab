const router = require('express').Router();
const {
  register,
  login,
  getProfile,
  getAllUsers,
  updateUserStatus,
  deleteUser
} = require('../controllers/authController');
const {
  submitFeedback,
  getPublicFeedbacks,
  getFeedbackReport
} = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// Feedback routes
router.post('/feedback', protect, submitFeedback);
router.get('/feedback/public', getPublicFeedbacks);
router.get('/feedback/report', protect, adminOnly, getFeedbackReport);

module.exports = router;