const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartItemController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.create);
router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.put('/:id', auth, controller.update);
router.delete('/', auth, controller.delete);

module.exports = router;