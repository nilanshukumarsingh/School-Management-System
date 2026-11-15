const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/mark', authenticate, authorize('ADMIN', 'TEACHER'), attendanceController.markAttendance);
router.get('/class', authenticate, authorize('ADMIN', 'TEACHER'), attendanceController.getClassAttendance);
router.get('/student/:studentId', authenticate, attendanceController.getStudentAttendanceHistory);

module.exports = router;
