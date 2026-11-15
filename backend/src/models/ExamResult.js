const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    isPassed: {
      type: Boolean,
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const examResultSchema = new mongoose.Schema(
  {
    examinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    marks: [subjectMarkSchema],
    totalObtained: {
      type: Number,
      required: true,
      default: 0,
    },
    totalMaxMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
    grade: {
      type: String,
      required: true,
      default: 'F',
    },
    gpa: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: true,
      default: 'FAIL',
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One result record per student per examination
examResultSchema.index({ examinationId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
