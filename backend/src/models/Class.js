const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required (e.g. Grade 10)'],
      trim: true,
    },
    gradeLevel: {
      type: Number,
      required: [true, 'Grade level is required (e.g. 10)'],
      min: 1,
      max: 12,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g. 2026-2027)'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index({ name: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
