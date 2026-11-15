const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required (e.g. MATH101)'],
      trim: true,
      uppercase: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Associated Class ID is required'],
      index: true,
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isElective: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Subject code unique per class
subjectSchema.index({ classId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
