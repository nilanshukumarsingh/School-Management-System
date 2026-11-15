const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated User ID is required'],
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required (e.g. Senior Teacher, Department Head)'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required (e.g. M.Sc. Mathematics, B.Ed)'],
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'ON_LEAVE', 'BUSY'],
      default: 'AVAILABLE',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Teacher', teacherSchema);
