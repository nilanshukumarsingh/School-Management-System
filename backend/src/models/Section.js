const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required (e.g. A, B, C)'],
      trim: true,
      uppercase: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Associated Class ID is required'],
      index: true,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    capacity: {
      type: Number,
      default: 40,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure section names are unique per class
sectionSchema.index({ classId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
