const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.createWithUser);
router.get('/', controller.getAllWithItems);
// router.get('/:id', controller.getWithItems);
router.get('/user',auth ,controller.getByUserWithItems);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;