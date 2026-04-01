const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { createSubject, getSubjects, updateSubject, deleteSubject } = require('../controllers/subjectController');

router.route('/')
  .get(protect, getSubjects) 
  .post(protect, adminOnly, createSubject);

router.route('/:id')
  .put(protect, adminOnly, updateSubject)
  .delete(protect, adminOnly, deleteSubject);

module.exports = router;
