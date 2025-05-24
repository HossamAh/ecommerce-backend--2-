const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdminMiddleware');

router.get('/dashboard', auth, isAdmin, adminController.dashboardStats);

module.exports = router;