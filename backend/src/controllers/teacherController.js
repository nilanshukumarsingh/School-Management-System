const { Teacher, User, TeacherAssignment } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/auditLogger');

/**
 * List all teachers with assignments and status
 */
const getTeachers = async (req, res, next) => {
  try {
    const { availabilityStatus, search } = req.query;
    const filter = {};
    if (availabilityStatus) filter.availabilityStatus = availabilityStatus;

    let teachers = await Teacher.find(filter)
      .populate('userId', 'name email phone avatar status lastLogin')
      .sort({ employeeId: 1 });

    if (search && search.trim()) {
      const s = search.toLowerCase();
      teachers = teachers.filter(
        (t) =>
          t.employeeId.toLowerCase().includes(s) ||
          (t.userId && t.userId.name.toLowerCase().includes(s)) ||
          (t.designation && t.designation.toLowerCase().includes(s)) ||
          (t.specialization && t.specialization.toLowerCase().includes(s))
      );
    }

    return successResponse(res, { data: teachers });
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher by ID with assigned classes and subjects
 */
const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id).populate('userId', 'name email phone avatar status');
    if (!teacher) {
      return errorResponse(res, { statusCode: 404, message: 'Teacher not found' });
    }

    const assignments = await TeacherAssignment.find({ teacherId: teacher._id })
      .populate('classId', 'name gradeLevel academicYear')
      .populate('sectionId', 'name roomNumber')
      .populate('subjectId', 'name code');

    return successResponse(res, {
      data: {
        teacher,
        assignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create teacher profile and user account (Admin only)
 */
const createTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      designation,
      qualification,
      specialization,
      availabilityStatus,
      joiningDate,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, { statusCode: 409, message: 'A user with this email address already exists.' });
    }

    const existingEmpId = await Teacher.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingEmpId) {
      return errorResponse(res, { statusCode: 409, message: `Teacher with Employee ID '${employeeId}' already exists.` });
    }

    // Create User with TEACHER role
    const passwordHash = await User.hashPassword(password || 'Teacher@123');
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'TEACHER',
      phone: phone || '',
    });

    // Create Teacher profile
    const teacher = await Teacher.create({
      userId: user._id,
      employeeId: employeeId.toUpperCase(),
      designation,
      qualification,
      specialization: specialization || '',
      availabilityStatus: availabilityStatus || 'AVAILABLE',
      joiningDate: joiningDate || new Date(),
      contactPhone: phone || '',
    });

    await recordAuditLog({
      req,
      action: 'TEACHER_CREATED',
      module: 'TEACHER',
      affectedRecordId: teacher._id,
      affectedModel: 'Teacher',
      details: { name, email, employeeId, designation },
    });

    const populated = await Teacher.findById(teacher._id).populate('userId', 'name email phone status');

    return successResponse(res, {
      statusCode: 201,
      message: 'Teacher profile created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update teacher details
 */
const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      designation,
      qualification,
      specialization,
      availabilityStatus,
    } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return errorResponse(res, { statusCode: 404, message: 'Teacher not found' });
    }

    // Update user details
    if (name || email || phone) {
      await User.findByIdAndUpdate(teacher.userId, {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      });
    }

    // Update teacher profile
    if (designation) teacher.designation = designation;
    if (qualification) teacher.qualification = qualification;
    if (specialization !== undefined) teacher.specialization = specialization;
    if (availabilityStatus) teacher.availabilityStatus = availabilityStatus;
    if (phone) teacher.contactPhone = phone;

    await teacher.save();

    await recordAuditLog({
      req,
      action: 'TEACHER_UPDATED',
      module: 'TEACHER',
      affectedRecordId: teacher._id,
      affectedModel: 'Teacher',
      details: req.body,
    });

    const updated = await Teacher.findById(id).populate('userId', 'name email phone status');
    return successResponse(res, { message: 'Teacher profile updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete teacher profile
 */
const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return errorResponse(res, { statusCode: 404, message: 'Teacher not found' });
    }

    await User.findByIdAndDelete(teacher.userId);
    await TeacherAssignment.deleteMany({ teacherId: teacher._id });
    await Teacher.findByIdAndDelete(id);

    await recordAuditLog({
      req,
      action: 'TEACHER_DELETED',
      module: 'TEACHER',
      affectedRecordId: id,
      affectedModel: 'Teacher',
      details: { employeeId: teacher.employeeId },
    });

    return successResponse(res, { message: 'Teacher removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
