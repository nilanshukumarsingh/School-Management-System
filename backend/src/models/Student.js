const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section is required'],
      index: true,
    },
    guardianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guardian',
      index: true,
      default: null,
    },
    rollNumber: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    medicalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ENROLLED', 'TRANSFERRED', 'GRADUATED'],
      default: 'ENROLLED',
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Compound index for class + section + rollNumber
studentSchema.index({ classId: 1, sectionId: 1, rollNumber: 1 });

module.exports = mongoose.model('Student', studentSchema);
