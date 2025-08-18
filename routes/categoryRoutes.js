const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer();

router.use(authMiddleware);
router.post('/', upload.none(), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', upload.none(), controller.update);
router.delete('/:id', controller.delete);

module.exports = router;