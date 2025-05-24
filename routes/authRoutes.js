const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const blackListTokensController = require('../controllers/blackListTokensController');
const multer = require('multer');
const upload = multer();
const auth = require('../middleware/authMiddleware');

router.post('/register', upload.none(), authController.register);
router.post('/login', upload.none(), authController.login);
router.get('/profile',auth ,authController.profile);
router.get('/logout',blackListTokensController.create);
router.get('/refresh',authController.refresh);

module.exports = router;