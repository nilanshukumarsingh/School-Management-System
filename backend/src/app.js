const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const feeRoutes = require('./routes/feeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

const app = express();

// Security and Logging Middlewares
app.use(helmet({ contentSecurityPolicy: false })); // allow swagger assets
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger OpenAPI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ScholaVerse School Management API',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to ScholaVerse API. Visit /api-docs for complete interactive API documentation.',
  });
});

// Mount Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
