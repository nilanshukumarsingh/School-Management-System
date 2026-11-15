const { Attendance, Student, TeacherAssignment, Teacher, Guardian } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/auditLogger');

/**
 * Record Daily Attendance (Batch for a Class/Section)
 * Acceptance Criteria #1: A teacher can access only assigned classes and record attendance.
 * Acceptance Criteria #2: Duplicate attendance for the same student/session is rejected or safely updated.
 */
const markAttendance = async (req, res, next) => {
  try {
    const {
      classId,
      sectionId,
      date,
      session = 'FULL_DAY',
      records,
      overwriteIfDuplicate = false,
    } = req.body;

    if (!classId || !sectionId || !date || !Array.isArray(records) || records.length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Missing required fields: classId, sectionId, date, and non-empty records array are required.',
      });
    }

    // 1. TEACHER AUTHORIZATION CHECK (Acceptance Test #1)
    if (req.user.role === 'TEACHER') {
      const teacher = req.teacherProfile || (await Teacher.findOne({ userId: req.user._id }));
      if (!teacher) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: Teacher profile not found.',
        });
      }

      const hasAssignment = await TeacherAssignment.exists({
        teacherId: teacher._id,
        classId,
        sectionId,
      });

      if (!hasAssignment) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You are not assigned to record attendance for this class and section.',
        });
      }
    }

    // Normalize date string (YYYY-MM-DD)
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    // 2. CHECK FOR DUPLICATES IF NOT OVERWRITING (Acceptance Test #2)
    const studentIds = records.map((r) => r.studentId);
    if (!overwriteIfDuplicate) {
      const existingRecords = await Attendance.find({
        studentId: { $in: studentIds },
        date: normalizedDate,
        session,
      });

      if (existingRecords.length > 0) {
        return errorResponse(res, {
          statusCode: 409,
          message: `Duplicate attendance rejected: Attendance has already been recorded for ${existingRecords.length} student(s) on ${normalizedDate} (${session} session). Set overwriteIfDuplicate=true to update existing records.`,
          errors: existingRecords.map((e) => ({
            studentId: e.studentId,
            date: e.date,
            session: e.session,
            status: e.status,
          })),
        });
      }
    }

    // 3. BULK UPSERT / INSERT WITH PROPER UNIQUE CONSTRAINT
    const operations = records.map((record) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          date: normalizedDate,
          session,
        },
        update: {
          $set: {
            classId,
            sectionId,
            status: record.status || 'PRESENT',
            remarks: record.remarks || '',
            recordedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    const bulkResult = await Attendance.bulkWrite(operations);

    // Fetch the updated records for response
    const savedRecords = await Attendance.find({
      studentId: { $in: studentIds },
      date: normalizedDate,
      session,
    }).populate('studentId', 'firstName lastName admissionNumber rollNumber');

    await recordAuditLog({
      req,
      action: 'ATTENDANCE_RECORDED',
      module: 'ATTENDANCE',
      details: {
        classId,
        sectionId,
        date: normalizedDate,
        session,
        totalSubmitted: records.length,
        upsertedCount: bulkResult.upsertedCount,
        modifiedCount: bulkResult.modifiedCount,
      },
    });

    return successResponse(res, {
      message: 'Attendance recorded successfully',
      data: {
        date: normalizedDate,
        session,
        summary: {
          total: savedRecords.length,
          present: savedRecords.filter((r) => r.status === 'PRESENT').length,
          absent: savedRecords.filter((r) => r.status === 'ABSENT').length,
          late: savedRecords.filter((r) => r.status === 'LATE').length,
          leave: savedRecords.filter((r) => r.status === 'LEAVE').length,
        },
        records: savedRecords,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'Duplicate attendance entry rejected by database unique constraint.',
        errors: error.keyValue,
      });
    }
    next(error);
  }
};

/**
 * Get Class Attendance for a specific Date & Section
 */
const getClassAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date, session = 'FULL_DAY' } = req.query;

    if (!classId || !date) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'classId and date query parameters are required.',
      });
    }

    // TEACHER PERMISSION CHECK
    if (req.user.role === 'TEACHER') {
      const teacher = req.teacherProfile || (await Teacher.findOne({ userId: req.user._id }));
      const hasAssignment = await TeacherAssignment.exists({
        teacherId: teacher._id,
        classId,
        ...(sectionId && { sectionId }),
      });
      if (!hasAssignment) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You are not assigned to view attendance for this class.',
        });
      }
    }

    const normalizedDate = new Date(date).toISOString().split('T')[0];
    const query = { classId, date: normalizedDate };
    if (sectionId) query.sectionId = sectionId;
    if (session) query.session = session;

    const records = await Attendance.find(query)
      .populate('studentId', 'firstName lastName admissionNumber rollNumber')
      .populate('recordedBy', 'name role')
      .sort({ 'studentId.rollNumber': 1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const leave = records.filter((r) => r.status === 'LEAVE').length;
    const percentage = total > 0 ? Number((((present + late) / total) * 100).toFixed(1)) : 0;

    return successResponse(res, {
      data: {
        date: normalizedDate,
        summary: { total, present, absent, late, leave, percentage },
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student Attendance History & Percentage Calculation
 */
const getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // GUARDIAN PRIVACY CHECK (Acceptance Test #4)
    if (req.user.role === 'GUARDIAN') {
      const guardian = req.guardianProfile || (await Guardian.findOne({ userId: req.user._id }));
      const isLinked = guardian && guardian.linkedStudentIds.some((sId) => sId.toString() === studentId);
      if (!isLinked) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You are not authorized to view attendance records for this student.',
        });
      }
    }

    const query = { studentId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split('T')[0],
        $lte: new Date(endDate).toISOString().split('T')[0],
      };
    }

    const records = await Attendance.find(query)
      .populate('classId', 'name gradeLevel')
      .populate('sectionId', 'name')
      .sort({ date: -1 });

    const totalSessions = records.length;
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const leaveCount = records.filter((r) => r.status === 'LEAVE').length;
    const attendancePercentage =
      totalSessions > 0
        ? Number((((presentCount + lateCount) / totalSessions) * 100).toFixed(1))
        : 0;

    return successResponse(res, {
      data: {
        studentId,
        statistics: {
          totalSessions,
          presentCount,
          absentCount,
          lateCount,
          leaveCount,
          attendancePercentage,
        },
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getClassAttendance,
  getStudentAttendanceHistory,
};
