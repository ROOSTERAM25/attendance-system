const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/scan', studentController.getScanPage);
router.post('/attendance/mark', studentController.markAttendance);
router.get('/attendance/history', studentController.viewHistory);

module.exports = router;