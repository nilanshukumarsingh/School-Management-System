const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section ID is required'],
      index: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for deterministic date-level matching & indexing
      required: [true, 'Date string (YYYY-MM-DD) is required'],
      index: true,
    },
    session: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'FULL_DAY'],
      default: 'FULL_DAY',
      required: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'],
      required: [true, 'Attendance status is required'],
      default: 'PRESENT',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL REQUIREMENT: Enforce uniqueness to prevent duplicate attendance entries
// Compound unique index on studentId + date + session
attendanceSchema.index({ studentId: 1, date: 1, session: 1 }, { unique: true });

// Query index for class, section and date
attendanceSchema.index({ classId: 1, sectionId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
