const { AuditLog } = require('../models');

/**
 * Creates an Audit Log entry in MongoDB
 * @param {Object} params
 * @param {Object} [params.req] - Express request object (extracts user and ip)
 * @param {string} params.action - e.g. "STUDENT_CREATED", "ATTENDANCE_RECORDED"
 * @param {string} params.module - e.g. "STUDENT", "ATTENDANCE", "EXAMINATION", "FEES"
 * @param {string} [params.affectedRecordId] - ID of modified entity
 * @param {string} [params.affectedModel] - Model name e.g. "Student"
 * @param {Object} [params.details] - JSON diff or payload summary
 */
const recordAuditLog = async ({
  req = null,
  action,
  module,
  affectedRecordId = null,
  affectedModel = null,
  details = {},
}) => {
  try {
    let userId = null;
    let userName = 'System';
    let userRole = 'SYSTEM';
    let ipAddress = '127.0.0.1';

    if (req) {
      if (req.user) {
        userId = req.user._id;
        userName = req.user.name;
        userRole = req.user.role;
      }
      ipAddress = req.ip || (req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    }

    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      module,
      affectedRecordId: affectedRecordId ? String(affectedRecordId) : null,
      affectedModel,
      details,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (error) {
    // Non-blocking: fail-safe logging shouldn't crash request
    console.error('[AuditLog Error]', error.message);
  }
};

module.exports = {
  recordAuditLog,
};
