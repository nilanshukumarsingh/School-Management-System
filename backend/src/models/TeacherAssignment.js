const mongoose = require('mongoose');

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
      index: true,
    },
    isClassTeacher: {
      type: Boolean,
      default: false,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness for teacher + class + section + subject + academicYear
teacherAssignmentSchema.index(
  { teacherId: 1, classId: 1, sectionId: 1, subjectId: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('TeacherAssignment', teacherAssignmentSchema);
