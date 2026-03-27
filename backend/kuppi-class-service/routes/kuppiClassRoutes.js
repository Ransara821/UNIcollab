const express = require('express');
const router = express.Router();
const {
  getFilterOptions,
  getAllKuppiClasses,
  getKuppiClassById,
  createKuppiClass,
  updateKuppiClass,
  deleteKuppiClass,
} = require('../controllers/kuppiClassController');

router.get('/filters', getFilterOptions);   // must be before /:id
router.get('/', getAllKuppiClasses);
router.get('/:id', getKuppiClassById);
router.post('/', createKuppiClass);
router.put('/:id', updateKuppiClass);
router.delete('/:id', deleteKuppiClass);

module.exports = router;
