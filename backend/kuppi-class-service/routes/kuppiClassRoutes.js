const express = require('express');
const router  = express.Router();

const { protect }        = require('../middleware/authMiddleware');
const { recognizedOnly } = require('../middleware/recognizedOnly');
const { ownerOrAdmin }   = require('../middleware/ownerOrAdmin');

const {
  getFilterOptions, getAllKuppiClasses, getMySessions,
  getKuppiClassById, createKuppiClass, updateKuppiClass, deleteKuppiClass,
} = require('../controllers/kuppiClassController');

const { getMyStatus, rateSession }                              = require('../controllers/recognitionController');
const { applyForRecognition, getAllApplications, getMyApplication } = require('../controllers/recognitionApplicationController');

// ── Static / named routes (must come before /:id) ────────────────────────────
router.get('/filters',              getFilterOptions);
router.get('/my-status',            protect, getMyStatus);
router.get('/my-sessions',          protect, getMySessions);

// Recognition application routes
router.post('/recognition/apply',   protect, applyForRecognition);   // submit form → instant recognition
router.get('/recognition/all',      getAllApplications);              // public: list all tutors
router.get('/recognition/mine',     protect, getMyApplication);      // own application status

// ── Kuppi class CRUD ─────────────────────────────────────────────────────────
router.get('/',    getAllKuppiClasses);
router.get('/:id', getKuppiClassById);
router.post('/',   protect, recognizedOnly, createKuppiClass);        // recognized or admin only
router.put('/:id',    protect, ownerOrAdmin, updateKuppiClass);       // owner or admin only
router.delete('/:id', protect, ownerOrAdmin, deleteKuppiClass);       // owner or admin only

// ── Rating ───────────────────────────────────────────────────────────────────
router.post('/:id/rate', protect, rateSession);

module.exports = router;
