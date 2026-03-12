const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Protect admin routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.get('/users-json', adminController.getUsersJSON);
router.get('/sessions', adminController.getAllSessions);
router.get('/attendance', adminController.getAllAttendance);

module.exports = router;
