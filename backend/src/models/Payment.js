const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeInvoice',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [1, 'Payment amount must be greater than zero'],
    },
    paymentMethod: {
      type: String,
      enum: ['SIMULATED_CARD', 'CASH', 'BANK_TRANSFER', 'CHEQUE'],
      default: 'SIMULATED_CARD',
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'FAILED', 'REVERSED'],
      default: 'COMPLETED',
      index: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: 'Simulated payment transaction',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
