const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, examController.getExaminations);
router.post('/', authenticate, authorize('ADMIN'), examController.createExamination);
router.put('/:id', authenticate, authorize('ADMIN'), examController.updateExamination);

// Results & Report Cards
router.post('/marks', authenticate, authorize('ADMIN', 'TEACHER'), examController.enterStudentMarks);
router.get('/class-results', authenticate, authorize('ADMIN', 'TEACHER'), examController.getClassExamResults);
router.get('/report-card/:studentId', authenticate, examController.getStudentReportCard);

module.exports = router;
