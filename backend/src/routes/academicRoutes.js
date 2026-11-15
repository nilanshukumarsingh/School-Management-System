const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { authenticate, authorize } = require('../middleware/auth');

// Classes
router.get('/classes', authenticate, academicController.getAllClasses);
router.post('/classes', authenticate, authorize('ADMIN'), academicController.createClass);
router.put('/classes/:id', authenticate, authorize('ADMIN'), academicController.updateClass);
router.delete('/classes/:id', authenticate, authorize('ADMIN'), academicController.deleteClass);

// Sections
router.get('/sections', authenticate, academicController.getSections);
router.post('/sections', authenticate, authorize('ADMIN'), academicController.createSection);
router.delete('/sections/:id', authenticate, authorize('ADMIN'), academicController.deleteSection);

// Subjects
router.get('/subjects', authenticate, academicController.getSubjects);
router.post('/subjects', authenticate, authorize('ADMIN'), academicController.createSubject);
router.delete('/subjects/:id', authenticate, authorize('ADMIN'), academicController.deleteSubject);

// Teacher Assignments (Admin creates/removes, Teachers can view their assignments)
router.get('/assignments', authenticate, academicController.getTeacherAssignments);
router.post('/assignments', authenticate, authorize('ADMIN'), academicController.assignTeacher);
router.delete('/assignments/:id', authenticate, authorize('ADMIN'), academicController.removeTeacherAssignment);

module.exports = router;
