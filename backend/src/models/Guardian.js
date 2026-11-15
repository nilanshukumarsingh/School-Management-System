const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated User ID is required'],
      unique: true,
      index: true,
    },
    relationship: {
      type: String,
      enum: ['FATHER', 'MOTHER', 'LEGAL_GUARDIAN', 'OTHER'],
      default: 'LEGAL_GUARDIAN',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    linkedStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Guardian', guardianSchema);
