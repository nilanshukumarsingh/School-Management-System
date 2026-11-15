const { Examination, ExamResult, Student, Subject, Guardian, Teacher, TeacherAssignment } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/auditLogger');

/**
 * Helper to compute grade and GPA from configured examination grading rules
 */
const calculateGradeFromRules = (percentage, gradingRules) => {
  if (!gradingRules || gradingRules.length === 0) {
    if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
    if (percentage >= 80) return { grade: 'A', gpa: 3.7 };
    if (percentage >= 70) return { grade: 'B', gpa: 3.0 };
    if (percentage >= 60) return { grade: 'C', gpa: 2.0 };
    if (percentage >= 40) return { grade: 'D', gpa: 1.0 };
    return { grade: 'F', gpa: 0.0 };
  }

  // Find matching rule based on minPercentage and maxPercentage
  const matchedRule = gradingRules.find(
    (rule) => percentage >= rule.minPercentage && percentage <= rule.maxPercentage
  );

  if (matchedRule) {
    return { grade: matchedRule.grade, gpa: matchedRule.gpa };
  }

  return { grade: 'F', gpa: 0.0 };
};

// ----------------- EXAMINATIONS -----------------
const getExaminations = async (req, res, next) => {
  try {
    const { academicYear, status } = req.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    const exams = await Examination.find(filter).sort({ startDate: -1 });
    return successResponse(res, { data: exams });
  } catch (error) {
    next(error);
  }
};

const createExamination = async (req, res, next) => {
  try {
    const { name, examType, academicYear, startDate, endDate, gradingRules, status } = req.body;

    const examination = await Examination.create({
      name,
      examType: examType || 'MIDTERM',
      academicYear,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ...(gradingRules && { gradingRules }),
      status: status || 'SCHEDULED',
    });

    await recordAuditLog({
      req,
      action: 'EXAM_CREATED',
      module: 'EXAMINATION',
      affectedRecordId: examination._id,
      affectedModel: 'Examination',
      details: { name, academicYear, examType },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Examination created successfully',
      data: examination,
    });
  } catch (error) {
    next(error);
  }
};

const updateExamination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await Examination.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!exam) {
      return errorResponse(res, { statusCode: 404, message: 'Examination not found' });
    }
    return successResponse(res, { message: 'Examination updated successfully', data: exam });
  } catch (error) {
    next(error);
  }
};

// ----------------- RESULTS & REPORT CARDS -----------------

/**
 * Enter or Update Marks for a Student in an Examination
 * Acceptance Criteria #3: Correct calculation from configured marks & grading rules.
 * Edge cases: Reject marks > maxMarks, negative marks, validate pass/fail.
 */
const enterStudentMarks = async (req, res, next) => {
  try {
    const { examinationId, studentId, marks } = req.body;

    if (!examinationId || !studentId || !Array.isArray(marks) || marks.length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'examinationId, studentId, and marks array are required.',
      });
    }

    const [examination, student] = await Promise.all([
      Examination.findById(examinationId),
      Student.findById(studentId),
    ]);

    if (!examination) {
      return errorResponse(res, { statusCode: 404, message: 'Examination not found' });
    }
    if (!student) {
      return errorResponse(res, { statusCode: 404, message: 'Student not found' });
    }

    // TEACHER AUTHORIZATION CHECK: Teacher can only enter marks for authorized classes
    if (req.user.role === 'TEACHER') {
      const teacher = req.teacherProfile || (await Teacher.findOne({ userId: req.user._id }));
      const hasAssignment = await TeacherAssignment.exists({
        teacherId: teacher._id,
        classId: student.classId,
      });
      if (!hasAssignment) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You are not authorized to enter marks for this student class.',
        });
      }
    }

    // VALIDATION: Validate each subject mark
    let totalObtained = 0;
    let totalMaxMarks = 0;
    let allSubjectsPassed = true;
    const validatedMarks = [];

    for (const item of marks) {
      const marksObtained = Number(item.marksObtained);
      const maxMarks = Number(item.maxMarks);
      const passingMarks = Number(item.passingMarks || maxMarks * 0.4);

      // Edge case validation
      if (isNaN(marksObtained) || marksObtained < 0) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Invalid marks: Marks obtained must be a non-negative number for subject ${item.subjectId}.`,
        });
      }
      if (isNaN(maxMarks) || maxMarks <= 0) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Invalid max marks: Maximum marks must be greater than zero for subject ${item.subjectId}.`,
        });
      }
      if (marksObtained > maxMarks) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Validation Error: Marks obtained (${marksObtained}) cannot exceed maximum marks (${maxMarks}).`,
        });
      }

      const isPassed = marksObtained >= passingMarks;
      if (!isPassed) {
        allSubjectsPassed = false;
      }

      totalObtained += marksObtained;
      totalMaxMarks += maxMarks;

      validatedMarks.push({
        subjectId: item.subjectId,
        marksObtained,
        maxMarks,
        passingMarks,
        isPassed,
        remarks: item.remarks || '',
      });
    }

    // Compute percentage, grade and GPA
    const percentage =
      totalMaxMarks > 0 ? Number(((totalObtained / totalMaxMarks) * 100).toFixed(2)) : 0;

    const { grade, gpa } = calculateGradeFromRules(percentage, examination.gradingRules);
    const finalStatus = allSubjectsPassed && percentage >= 40 ? 'PASS' : 'FAIL';

    // Upsert ExamResult record
    const result = await ExamResult.findOneAndUpdate(
      { examinationId, studentId },
      {
        classId: student.classId,
        sectionId: student.sectionId,
        marks: validatedMarks,
        totalObtained,
        totalMaxMarks,
        percentage,
        grade,
        gpa,
        status: finalStatus,
        enteredBy: req.user._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate('examinationId', 'name examType academicYear gradingRules')
      .populate('studentId', 'firstName lastName admissionNumber rollNumber')
      .populate('marks.subjectId', 'name code credits');

    await recordAuditLog({
      req,
      action: 'EXAM_MARKS_RECORDED',
      module: 'EXAMINATION',
      affectedRecordId: result._id,
      affectedModel: 'ExamResult',
      details: {
        examinationId,
        studentId,
        totalObtained,
        totalMaxMarks,
        percentage,
        grade,
        status: finalStatus,
      },
    });

    return successResponse(res, {
      message: 'Examination marks saved and results calculated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Report Card for a Student (or all results of a student)
 * Acceptance Criteria #4: Guardian sees only linked student results.
 */
const getStudentReportCard = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { examinationId } = req.query;

    // GUARDIAN PRIVACY CHECK (Acceptance Test #4)
    if (req.user.role === 'GUARDIAN') {
      const guardian = req.guardianProfile || (await Guardian.findOne({ userId: req.user._id }));
      const isLinked = guardian && guardian.linkedStudentIds.some((sId) => sId.toString() === studentId);
      if (!isLinked) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You are not authorized to view report cards for this student.',
        });
      }
    }

    const query = { studentId };
    if (examinationId) query.examinationId = examinationId;

    const results = await ExamResult.find(query)
      .populate('examinationId', 'name examType academicYear startDate endDate gradingRules')
      .populate('studentId', 'firstName lastName admissionNumber rollNumber dateOfBirth')
      .populate('classId', 'name gradeLevel academicYear')
      .populate('sectionId', 'name roomNumber')
      .populate('marks.subjectId', 'name code credits')
      .sort({ createdAt: -1 });

    return successResponse(res, { data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Class Results for an Examination (Admin & Teacher)
 */
const getClassExamResults = async (req, res, next) => {
  try {
    const { examinationId, classId, sectionId } = req.query;
    if (!examinationId) {
      return errorResponse(res, { statusCode: 400, message: 'examinationId query is required' });
    }

    const query = { examinationId };
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    // If teacher, check access
    if (req.user.role === 'TEACHER') {
      const teacher = req.teacherProfile || (await Teacher.findOne({ userId: req.user._id }));
      if (classId) {
        const hasAssignment = await TeacherAssignment.exists({ teacherId: teacher._id, classId });
        if (!hasAssignment) {
          return errorResponse(res, { statusCode: 403, message: 'Access Denied: You are not assigned to this class.' });
        }
      }
    }

    const results = await ExamResult.find(query)
      .populate('studentId', 'firstName lastName admissionNumber rollNumber')
      .populate('classId', 'name gradeLevel')
      .populate('sectionId', 'name')
      .populate('marks.subjectId', 'name code')
      .sort({ percentage: -1 });

    const totalStudents = results.length;
    const passedCount = results.filter((r) => r.status === 'PASS').length;
    const failedCount = totalStudents - passedCount;
    const classAvgPercentage =
      totalStudents > 0
        ? Number((results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents).toFixed(2))
        : 0;

    return successResponse(res, {
      data: {
        summary: { totalStudents, passedCount, failedCount, classAvgPercentage },
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExaminations,
  createExamination,
  updateExamination,
  enterStudentMarks,
  getStudentReportCard,
  getClassExamResults,
};
