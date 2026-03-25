const router = require('express').Router();
const {
  register,
  login,
  getProfile,
  getAllUsers
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/profile',   protect, getProfile);
router.get('/users',     protect, adminOnly, getAllUsers);

module.exports = router;