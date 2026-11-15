const mongoose = require('mongoose');

const feeComponentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fee structure name is required'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    term: {
      type: String,
      enum: ['ANNUAL', 'TERM_1', 'TERM_2', 'TERM_3', 'MONTHLY'],
      default: 'ANNUAL',
    },
    components: [feeComponentSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

feeStructureSchema.index({ classId: 1, academicYear: 1, term: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
