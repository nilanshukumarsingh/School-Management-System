const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ScholaVerse - School Management System API',
    version: '1.0.0',
    description:
      'Complete RESTful API documentation for ScholaVerse School Management System. Includes Authentication, Academic Administration, Attendance with unique constraints, Examinations & Automated Grading, Fee Ledger & Simulated Transactions, Reports, and Audit Trails.',
    contact: {
      name: 'ScholaVerse Engineering Team',
      email: 'engineering@scholaverse.internal',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment / Relative API Root',
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'TEACHER', 'GUARDIAN'] },
          phone: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@scholaverse.edu' },
          password: { type: 'string', example: 'Admin@123' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user with email and password',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Successful login with JWT token and user profile' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current authenticated user profile and role details',
        tags: ['Authentication'],
        responses: {
          200: { description: 'Current user profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/students': {
      get: {
        summary: 'List students with search, filters and pagination (Admin/Teacher)',
        tags: ['Students'],
        responses: { 200: { description: 'List of student records' } },
      },
      post: {
        summary: 'Add a new student (Admin only)',
        tags: ['Students'],
        responses: { 201: { description: 'Student created successfully' } },
      },
    },
    '/api/teachers': {
      get: {
        summary: 'List teachers with profiles and subject assignments (Admin only)',
        tags: ['Teachers'],
        responses: { 200: { description: 'List of teacher records' } },
      },
    },
    '/api/attendance/mark': {
      post: {
        summary: 'Record daily attendance (Teacher/Admin)',
        description: 'Enforces unique compound index (studentId, date, session). Rejects or safely updates duplicates.',
        tags: ['Attendance'],
        responses: {
          200: { description: 'Attendance batch successfully recorded' },
          409: { description: 'Duplicate attendance conflict' },
        },
      },
    },
    '/api/exams': {
      get: {
        summary: 'List exams with grading rules',
        tags: ['Examinations'],
        responses: { 200: { description: 'Examinations list' } },
      },
    },
    '/api/fees/invoices': {
      get: {
        summary: 'List fee invoices and balances',
        tags: ['Fees'],
        responses: { 200: { description: 'Invoices list' } },
      },
    },
    '/api/fees/pay': {
      post: {
        summary: 'Record simulated payment transaction and reconcile invoice',
        tags: ['Fees'],
        responses: { 200: { description: 'Payment recorded and ledger reconciled' } },
      },
    },
    '/api/audit-logs': {
      get: {
        summary: 'Query system audit logs (Admin only)',
        tags: ['Audit Logs'],
        responses: { 200: { description: 'Audit trails' } },
      },
    },
  },
};

module.exports = swaggerDocument;
