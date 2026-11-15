const mongoose = require('mongoose');

const gradingRuleSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true }, // e.g. "A+", "A", "B", "C", "D", "F"
    minPercentage: { type: Number, required: true }, // e.g. 90
    maxPercentage: { type: Number, required: true }, // e.g. 100
    gpa: { type: Number, required: true }, // e.g. 4.0
    description: { type: String, default: '' }, // e.g. "Outstanding"
  },
  { _id: false }
);

const defaultGradingRules = [
  { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0, description: 'Outstanding' },
  { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.7, description: 'Excellent' },
  { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gpa: 3.0, description: 'Good' },
  { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gpa: 2.0, description: 'Satisfactory' },
  { grade: 'D', minPercentage: 40, maxPercentage: 59.99, gpa: 1.0, description: 'Pass' },
  { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpa: 0.0, description: 'Fail' },
];

const examinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam name is required (e.g. Midterm Exams 2026)'],
      trim: true,
    },
    examType: {
      type: String,
      enum: ['MIDTERM', 'FINAL', 'UNIT_TEST', 'QUARTERLY'],
      default: 'MIDTERM',
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    gradingRules: {
      type: [gradingRuleSchema],
      default: defaultGradingRules,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'PUBLISHED'],
      default: 'SCHEDULED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

examinationSchema.index({ name: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Examination', examinationSchema);
