const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('teacher'));

router.get('/dashboard', teacherController.getDashboard);
router.post('/session/start', teacherController.startSession);
router.get('/session/active', teacherController.getActiveSession);
router.get('/session/:sessionId/refresh-qr', teacherController.refreshQR);
router.post('/session/:sessionId/end', teacherController.endSession);
router.get('/session/:sessionId/attendance', teacherController.viewAttendance);
router.get('/session/:sessionId/export', teacherController.exportToExcel);

module.exports = router;