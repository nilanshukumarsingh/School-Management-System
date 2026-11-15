const { AuditLog } = require('../models');
const { successResponse } = require('../utils/apiResponse');

const getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (module) query.module = module;
    if (action) query.action = action;

    if (search && search.trim()) {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      query.$or = [{ userName: regex }, { action: regex }, { userRole: regex }, { affectedModel: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    return successResponse(res, {
      data: logs,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
