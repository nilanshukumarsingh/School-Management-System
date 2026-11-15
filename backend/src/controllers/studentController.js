const { Student, Guardian, Teacher, TeacherAssignment } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/auditLogger');

/**
 * List students with search, filters, pagination, and RBAC privacy enforcement
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      classId,
      sectionId,
      status,
      bloodGroup,
    } = req.query;

    const query = {};

    // 1. RBAC Data Isolation
    if (req.user.role === 'GUARDIAN') {
      const guardian = req.guardianProfile || (await Guardian.findOne({ userId: req.user._id }));
      if (!guardian || !guardian.linkedStudentIds || guardian.linkedStudentIds.length === 0) {
        return successResponse(res, {
          data: [],
          meta: { total: 0, page: 1, limit: Number(limit), totalPages: 0 },
        });
      }
      query._id = { $in: guardian.linkedStudentIds };
    } else if (req.user.role === 'TEACHER') {
      const teacher = req.teacherProfile || (await Teacher.findOne({ userId: req.user._id }));
      if (!teacher) {
        return successResponse(res, {
          data: [],
          meta: { total: 0, page: 1, limit: Number(limit), totalPages: 0 },
        });
      }
      // Get classes assigned to this teacher
      const assignments = await TeacherAssignment.find({ teacherId: teacher._id });
      const assignedClassIds = assignments.map((a) => a.classId);
      query.classId = { $in: assignedClassIds };
    }

    // 2. Filters
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    // 3. Search (firstName, lastName, admissionNumber)
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { admissionNumber: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('classId', 'name gradeLevel academicYear')
        .populate('sectionId', 'name roomNumber')
        .populate({
          path: 'guardianId',
          populate: { path: 'userId', select: 'name email phone' },
        })
        .sort({ admissionNumber: 1 })
        .skip(skip)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    return successResponse(res, {
      data: students,
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

/**
 * Get student by ID with privacy check
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id)
      .populate('classId', 'name gradeLevel academicYear')
      .populate('sectionId', 'name roomNumber')
      .populate({
        path: 'guardianId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!student) {
      return errorResponse(res, { statusCode: 404, message: 'Student not found' });
    }

    // GUARDIAN PRIVACY CHECK: Ensure guardian is linked to this student!
    if (req.user.role === 'GUARDIAN') {
      const guardian = req.guardianProfile || (await Guardian.findOne({ userId: req.user._id }));
      const isLinked = guardian && guardian.linkedStudentIds.some((sId) => sId.toString() === student._id.toString());
      if (!isLinked) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You are not authorized to view this student profile.',
        });
      }
    }

    // TEACHER CHECK: Ensure teacher has access to this student's class
    if (req.user.role === 'TEACHER') {
      const teacher = req.teacherProfile || (await Teacher.findOne({ userId: req.user._id }));
      const hasAssignment = await TeacherAssignment.exists({
        teacherId: teacher._id,
        classId: student.classId,
      });
      if (!hasAssignment) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You are not assigned to this student class.',
        });
      }
    }

    return successResponse(res, { data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new student (Admin only)
 */
const createStudent = async (req, res, next) => {
  try {
    const {
      admissionNumber,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      classId,
      sectionId,
      guardianId,
      rollNumber,
      address,
      emergencyContact,
      medicalNotes,
      status,
    } = req.body;

    // Check unique admissionNumber
    const existing = await Student.findOne({ admissionNumber: admissionNumber.toUpperCase() });
    if (existing) {
      return errorResponse(res, {
        statusCode: 409,
        message: `Student with admission number '${admissionNumber}' already exists.`,
      });
    }

    const student = await Student.create({
      admissionNumber: admissionNumber.toUpperCase(),
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      classId,
      sectionId,
      guardianId: guardianId || null,
      rollNumber: rollNumber || 0,
      address,
      emergencyContact,
      medicalNotes,
      status: status || 'ENROLLED',
    });

    // If guardian assigned, link student in guardian document
    if (guardianId) {
      await Guardian.findByIdAndUpdate(guardianId, {
        $addToSet: { linkedStudentIds: student._id },
      });
    }

    await recordAuditLog({
      req,
      action: 'STUDENT_CREATED',
      module: 'STUDENT',
      affectedRecordId: student._id,
      affectedModel: 'Student',
      details: { admissionNumber, name: `${firstName} ${lastName}`, classId, sectionId },
    });

    const populated = await Student.findById(student._id)
      .populate('classId', 'name gradeLevel')
      .populate('sectionId', 'name');

    return successResponse(res, {
      statusCode: 201,
      message: 'Student admitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update student record (Admin only)
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oldStudent = await Student.findById(id);
    if (!oldStudent) {
      return errorResponse(res, { statusCode: 404, message: 'Student not found' });
    }

    const updated = await Student.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('classId', 'name gradeLevel')
      .populate('sectionId', 'name');

    // Handle guardian change
    if (req.body.guardianId && String(req.body.guardianId) !== String(oldStudent.guardianId)) {
      if (oldStudent.guardianId) {
        await Guardian.findByIdAndUpdate(oldStudent.guardianId, {
          $pull: { linkedStudentIds: oldStudent._id },
        });
      }
      await Guardian.findByIdAndUpdate(req.body.guardianId, {
        $addToSet: { linkedStudentIds: oldStudent._id },
      });
    }

    await recordAuditLog({
      req,
      action: 'STUDENT_UPDATED',
      module: 'STUDENT',
      affectedRecordId: id,
      affectedModel: 'Student',
      details: req.body,
    });

    return successResponse(res, {
      message: 'Student record updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete student record (Admin only)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return errorResponse(res, { statusCode: 404, message: 'Student not found' });
    }

    if (student.guardianId) {
      await Guardian.findByIdAndUpdate(student.guardianId, {
        $pull: { linkedStudentIds: student._id },
      });
    }

    await recordAuditLog({
      req,
      action: 'STUDENT_DELETED',
      module: 'STUDENT',
      affectedRecordId: id,
      affectedModel: 'Student',
      details: { admissionNumber: student.admissionNumber, name: `${student.firstName} ${student.lastName}` },
    });

    return successResponse(res, { message: 'Student record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
