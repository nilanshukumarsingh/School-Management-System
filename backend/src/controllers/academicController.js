const { Class, Section, Subject, TeacherAssignment, Teacher } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/auditLogger');

// ----------------- CLASSES -----------------
const getAllClasses = async (req, res, next) => {
  try {
    const { academicYear, status } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    const classes = await Class.find(filter).sort({ gradeLevel: 1, name: 1 });
    return successResponse(res, { data: classes });
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, gradeLevel, academicYear, description } = req.body;
    const newClass = await Class.create({
      name,
      gradeLevel: Number(gradeLevel),
      academicYear,
      description,
    });

    await recordAuditLog({
      req,
      action: 'CLASS_CREATED',
      module: 'ACADEMICS',
      affectedRecordId: newClass._id,
      affectedModel: 'Class',
      details: { name, gradeLevel, academicYear },
    });

    return successResponse(res, { statusCode: 201, message: 'Class created successfully', data: newClass });
  } catch (error) {
    next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Class.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return errorResponse(res, { statusCode: 404, message: 'Class not found' });
    }

    await recordAuditLog({
      req,
      action: 'CLASS_UPDATED',
      module: 'ACADEMICS',
      affectedRecordId: updated._id,
      affectedModel: 'Class',
      details: req.body,
    });

    return successResponse(res, { message: 'Class updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Class.findByIdAndDelete(id);
    if (!deleted) {
      return errorResponse(res, { statusCode: 404, message: 'Class not found' });
    }

    // Clean up dependent sections and subjects
    await Section.deleteMany({ classId: id });
    await Subject.deleteMany({ classId: id });
    await TeacherAssignment.deleteMany({ classId: id });

    await recordAuditLog({
      req,
      action: 'CLASS_DELETED',
      module: 'ACADEMICS',
      affectedRecordId: id,
      affectedModel: 'Class',
      details: { name: deleted.name },
    });

    return successResponse(res, { message: 'Class and associated records removed successfully' });
  } catch (error) {
    next(error);
  }
};

// ----------------- SECTIONS -----------------
const getSections = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const filter = classId ? { classId } : {};
    const sections = await Section.find(filter).populate('classId', 'name gradeLevel academicYear').sort({ name: 1 });
    return successResponse(res, { data: sections });
  } catch (error) {
    next(error);
  }
};

const createSection = async (req, res, next) => {
  try {
    const { name, classId, roomNumber, capacity } = req.body;
    const section = await Section.create({
      name,
      classId,
      roomNumber,
      capacity: capacity ? Number(capacity) : 40,
    });

    await recordAuditLog({
      req,
      action: 'SECTION_CREATED',
      module: 'ACADEMICS',
      affectedRecordId: section._id,
      affectedModel: 'Section',
      details: { name, classId, roomNumber },
    });

    return successResponse(res, { statusCode: 201, message: 'Section created successfully', data: section });
  } catch (error) {
    next(error);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Section.findByIdAndDelete(id);
    if (!deleted) {
      return errorResponse(res, { statusCode: 404, message: 'Section not found' });
    }
    return successResponse(res, { message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ----------------- SUBJECTS -----------------
const getSubjects = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const filter = classId ? { classId } : {};
    const subjects = await Subject.find(filter).populate('classId', 'name gradeLevel').sort({ name: 1 });
    return successResponse(res, { data: subjects });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, classId, credits, description, isElective } = req.body;
    const subject = await Subject.create({
      name,
      code,
      classId,
      credits: credits ? Number(credits) : 3,
      description,
      isElective: Boolean(isElective),
    });

    await recordAuditLog({
      req,
      action: 'SUBJECT_CREATED',
      module: 'ACADEMICS',
      affectedRecordId: subject._id,
      affectedModel: 'Subject',
      details: { name, code, classId },
    });

    return successResponse(res, { statusCode: 201, message: 'Subject created successfully', data: subject });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return errorResponse(res, { statusCode: 404, message: 'Subject not found' });
    }
    return successResponse(res, { message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ----------------- TEACHER ASSIGNMENTS -----------------
const getTeacherAssignments = async (req, res, next) => {
  try {
    const { teacherId, classId, sectionId, academicYear } = req.query;
    const filter = {};
    if (teacherId) filter.teacherId = teacherId;
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (academicYear) filter.academicYear = academicYear;

    // If logged in as TEACHER, restrict to own assignments
    if (req.user && req.user.role === 'TEACHER') {
      const teacher = req.teacherProfile || (await Teacher.findOne({ userId: req.user._id }));
      if (!teacher) {
        return successResponse(res, { data: [] });
      }
      filter.teacherId = teacher._id;
    }

    const assignments = await TeacherAssignment.find(filter)
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate('classId', 'name gradeLevel academicYear')
      .populate('sectionId', 'name roomNumber')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    return successResponse(res, { data: assignments });
  } catch (error) {
    next(error);
  }
};

const assignTeacher = async (req, res, next) => {
  try {
    const { teacherId, classId, sectionId, subjectId, isClassTeacher, academicYear } = req.body;

    const assignment = await TeacherAssignment.create({
      teacherId,
      classId,
      sectionId,
      subjectId: subjectId || null,
      isClassTeacher: Boolean(isClassTeacher),
      academicYear: academicYear || '2026-2027',
    });

    await recordAuditLog({
      req,
      action: 'TEACHER_ASSIGNED',
      module: 'ACADEMICS',
      affectedRecordId: assignment._id,
      affectedModel: 'TeacherAssignment',
      details: { teacherId, classId, sectionId, subjectId },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Teacher assigned successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

const removeTeacherAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await TeacherAssignment.findByIdAndDelete(id);
    if (!deleted) {
      return errorResponse(res, { statusCode: 404, message: 'Assignment not found' });
    }
    return successResponse(res, { message: 'Teacher assignment removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getSections,
  createSection,
  deleteSection,
  getSubjects,
  createSubject,
  deleteSubject,
  getTeacherAssignments,
  assignTeacher,
  removeTeacherAssignment,
};
