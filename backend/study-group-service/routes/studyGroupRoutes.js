const router = require('express').Router();
const { protect } = require('../middleware/auth');
const profile  = require('../controllers/profileController');
const group    = require('../controllers/groupController');
const request  = require('../controllers/requestController');
const match    = require('../controllers/matchController');
const pool     = require('../controllers/poolController');

// ── Fixed routes first (before /:id) ──
router.get('/profile/me',          protect, profile.getMyProfile);
router.post('/profile',            protect, profile.saveProfile);
router.get('/match/suggestions',   protect, match.getSuggestions);
router.get('/pool',                protect, pool.getPool);
router.get('/my',                  protect, group.getMyGroup);
router.get('/requests/my',         protect, request.getMyRequests);
router.patch('/requests/:requestId', protect, request.updateRequest);

// ── Group CRUD ──
router.get('/',   protect, group.getGroups);
router.post('/',  protect, group.createGroup);
router.get('/:id',               protect, group.getGroup);
router.patch('/:id/status',      protect, group.toggleStatus);
router.patch('/:id/skills-needed', protect, group.updateSkillsNeeded);

// ── Join requests ──
router.post('/:id/request',               protect, request.sendRequest);
router.post('/:id/invite/:studentId',     protect, request.sendInvite);
router.get('/:id/requests',               protect, request.getGroupRequests);

module.exports = router;
