const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {
  User,
  Student,
  Guardian,
  Teacher,
  Class,
  Section,
  Subject,
  TeacherAssignment,
  Attendance,
  Examination,
  ExamResult,
  FeeStructure,
  FeeInvoice,
  Payment,
  AuditLog,
} = require('../models');

const TEST_DB_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/scholaverse_test';

const setupTestDB = () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });
};

const clearCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Guardian.deleteMany({}),
    Teacher.deleteMany({}),
    Class.deleteMany({}),
    Section.deleteMany({}),
    Subject.deleteMany({}),
    TeacherAssignment.deleteMany({}),
    Attendance.deleteMany({}),
    Examination.deleteMany({}),
    ExamResult.deleteMany({}),
    FeeStructure.deleteMany({}),
    FeeInvoice.deleteMany({}),
    Payment.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
};

const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'super_secret_jwt_key_scholaverse_production_grade_2026',
    { expiresIn: '1d' }
  );
};

module.exports = {
  setupTestDB,
  clearCollections,
  generateAuthToken,
};
