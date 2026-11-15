const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, teacherController.getTeachers);
router.get('/:id', authenticate, teacherController.getTeacherById);
router.post('/', authenticate, authorize('ADMIN'), teacherController.createTeacher);
router.put('/:id', authenticate, authorize('ADMIN'), teacherController.updateTeacher);
router.delete('/:id', authenticate, authorize('ADMIN'), teacherController.deleteTeacher);

module.exports = router;
