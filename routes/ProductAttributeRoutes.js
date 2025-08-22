const express = require('express');
const router = express.Router();
const controller = require('../controllers/variantAttributeController');
const auth = require('../middleware/authMiddleware');

// Basic CRUD routes

router.post('/',auth ,controller.create);
router.get('/', controller.getAll);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;