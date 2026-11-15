const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard/admin', authenticate, authorize('ADMIN'), reportController.getAdminDashboard);
router.get('/dashboard/teacher', authenticate, authorize('TEACHER'), reportController.getTeacherDashboard);
router.get('/dashboard/guardian', authenticate, authorize('GUARDIAN'), reportController.getGuardianDashboard);
router.get('/academic', authenticate, authorize('ADMIN', 'TEACHER'), reportController.getAcademicReport);

module.exports = router;
