const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validators/authValidators');

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/register', authenticate, authorize('ADMIN'), validate(registerSchema), authController.register);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
