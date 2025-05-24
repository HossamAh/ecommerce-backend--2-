const express = require('express');
const router = express.Router();
const controller = require('../controllers/productImageController');

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/product/:id', controller.getByProduct);
router.get('/variant/:id', controller.getByVariant); // New route for variant images
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
