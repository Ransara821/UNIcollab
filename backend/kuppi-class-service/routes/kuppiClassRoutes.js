const express = require('express');
const router = express.Router();
const {
    createKuppiClass,
    getAllKuppiClasses,
    getKuppiClassById,
    updateKuppiClass,
    deleteKuppiClass
} = require('../controllers/kuppiClassController');

router.post('/', createKuppiClass);
router.get('/', getAllKuppiClasses);
router.get('/:id', getKuppiClassById);
router.put('/:id', updateKuppiClass);
router.delete('/:id', deleteKuppiClass);

module.exports = router;
