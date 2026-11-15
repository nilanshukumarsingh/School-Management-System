const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: 'System',
    },
    userRole: {
      type: String,
      default: 'SYSTEM',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: ['AUTH', 'STUDENT', 'TEACHER', 'ACADEMICS', 'ATTENDANCE', 'EXAMINATION', 'FEES', 'SYSTEM'],
      required: true,
      index: true,
    },
    affectedRecordId: {
      type: String,
      default: null,
    },
    affectedModel: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
