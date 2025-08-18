const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

// Basic CRUD routes
router.post('/', auth, controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

// New routes for creating orders
router.post('/from-cart', auth, controller.createFromCart);
router.post('/single-item', auth, controller.createForSingleItem);
router.get('/user/orders', auth, controller.getUserOrders);

module.exports = router;
