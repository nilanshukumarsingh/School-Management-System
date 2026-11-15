const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Valid email address is required').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Valid email address is required').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['ADMIN', 'TEACHER', 'GUARDIAN']),
  phone: z.string().optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
};
