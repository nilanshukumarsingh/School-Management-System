const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, studentController.getStudents);
router.get('/:id', authenticate, studentController.getStudentById);
router.post('/', authenticate, authorize('ADMIN'), studentController.createStudent);
router.put('/:id', authenticate, authorize('ADMIN'), studentController.updateStudent);
router.delete('/:id', authenticate, authorize('ADMIN'), studentController.deleteStudent);

module.exports = router;
