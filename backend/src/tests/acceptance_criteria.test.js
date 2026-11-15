const request = require('supertest');
const app = require('../app');
const {
  User,
  Teacher,
  Guardian,
  Student,
  Class,
  Section,
  Subject,
  TeacherAssignment,
  Attendance,
  Examination,
  ExamResult,
  FeeStructure,
  FeeInvoice,
  Payment,
} = require('../models');
const { setupTestDB, clearCollections, generateAuthToken } = require('./testHelper');

setupTestDB();

describe('School Management System - Assessment Acceptance Tests', () => {
  let adminUser, adminToken;
  let teacherUser1, teacherProfile1, teacherToken1;
  let teacherUser2, teacherProfile2, teacherToken2;
  let guardianUser1, guardianProfile1, guardianToken1;
  let guardianUser2, guardianProfile2, guardianToken2;
  let class10, sectionA, sectionB;
  let student1, student2; // student1 linked to guardian1, student2 linked to guardian2
  let subjectMath;

  beforeEach(async () => {
    await clearCollections();

    // 1. Admin
    const pass = await User.hashPassword('Pass@123');
    adminUser = await User.create({ name: 'Admin', email: 'admin@schola.edu', passwordHash: pass, role: 'ADMIN' });
    adminToken = generateAuthToken(adminUser);

    // 2. Teachers
    teacherUser1 = await User.create({ name: 'Teacher One', email: 'teacher1@schola.edu', passwordHash: pass, role: 'TEACHER' });
    teacherToken1 = generateAuthToken(teacherUser1);
    teacherProfile1 = await Teacher.create({
      userId: teacherUser1._id,
      employeeId: 'EMP-001',
      designation: 'Senior Faculty',
      qualification: 'M.Sc',
    });

    teacherUser2 = await User.create({ name: 'Teacher Two', email: 'teacher2@schola.edu', passwordHash: pass, role: 'TEACHER' });
    teacherToken2 = generateAuthToken(teacherUser2);
    teacherProfile2 = await Teacher.create({
      userId: teacherUser2._id,
      employeeId: 'EMP-002',
      designation: 'Faculty',
      qualification: 'B.Sc',
    });

    // 3. Classes and Sections
    class10 = await Class.create({ name: 'Grade 10', gradeLevel: 10, academicYear: '2026-2027' });
    sectionA = await Section.create({ name: 'A', classId: class10._id });
    sectionB = await Section.create({ name: 'B', classId: class10._id });

    subjectMath = await Subject.create({ name: 'Mathematics', code: 'MATH101', classId: class10._id, credits: 4 });

    // 4. Guardians
    guardianUser1 = await User.create({ name: 'Guardian One', email: 'g1@parent.edu', passwordHash: pass, role: 'GUARDIAN' });
    guardianToken1 = generateAuthToken(guardianUser1);
    guardianProfile1 = await Guardian.create({ userId: guardianUser1._id, linkedStudentIds: [] });

    guardianUser2 = await User.create({ name: 'Guardian Two', email: 'g2@parent.edu', passwordHash: pass, role: 'GUARDIAN' });
    guardianToken2 = generateAuthToken(guardianUser2);
    guardianProfile2 = await Guardian.create({ userId: guardianUser2._id, linkedStudentIds: [] });

    // 5. Students
    student1 = await Student.create({
      admissionNumber: 'ADM-001',
      firstName: 'Alice',
      lastName: 'Vance',
      dateOfBirth: new Date('2010-01-01'),
      gender: 'FEMALE',
      classId: class10._id,
      sectionId: sectionA._id,
      guardianId: guardianProfile1._id,
      status: 'ENROLLED',
    });

    student2 = await Student.create({
      admissionNumber: 'ADM-002',
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: new Date('2010-02-02'),
      gender: 'MALE',
      classId: class10._id,
      sectionId: sectionB._id,
      guardianId: guardianProfile2._id,
      status: 'ENROLLED',
    });

    guardianProfile1.linkedStudentIds = [student1._id];
    await guardianProfile1.save();

    guardianProfile2.linkedStudentIds = [student2._id];
    await guardianProfile2.save();

    // Assign Teacher 1 ONLY to Section A
    await TeacherAssignment.create({
      teacherId: teacherProfile1._id,
      classId: class10._id,
      sectionId: sectionA._id,
      subjectId: subjectMath._id,
      academicYear: '2026-2027',
    });
  });

  // =========================================================================
  // ACCEPTANCE TEST #1: A teacher can access only assigned classes
  // =========================================================================
  describe('Acceptance Test 1: Teacher Class Authorization', () => {
    it('allows a teacher to record attendance for an ASSIGNED class/section', async () => {
      const res = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken1}`)
        .send({
          classId: class10._id,
          sectionId: sectionA._id,
          date: '2026-11-15',
          session: 'FULL_DAY',
          records: [{ studentId: student1._id, status: 'PRESENT' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.present).toBe(1);
    });

    it('rejects a teacher trying to record attendance for an UNASSIGNED section (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken1}`)
        .send({
          classId: class10._id,
          sectionId: sectionB._id, // Teacher 1 is NOT assigned to Section B!
          date: '2026-11-15',
          session: 'FULL_DAY',
          records: [{ studentId: student2._id, status: 'PRESENT' }],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access Denied');
    });
  });

  // =========================================================================
  // ACCEPTANCE TEST #2: Duplicate attendance is rejected or safely updated
  // =========================================================================
  describe('Acceptance Test 2: Duplicate Attendance Handling', () => {
    it('rejects duplicate attendance for the same student, date and session (409 Conflict)', async () => {
      // 1. Initial attendance record
      await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: class10._id,
          sectionId: sectionA._id,
          date: '2026-11-15',
          session: 'FULL_DAY',
          records: [{ studentId: student1._id, status: 'PRESENT' }],
        });

      // 2. Duplicate submission with overwriteIfDuplicate = false
      const duplicateRes = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: class10._id,
          sectionId: sectionA._id,
          date: '2026-11-15',
          session: 'FULL_DAY',
          overwriteIfDuplicate: false,
          records: [{ studentId: student1._id, status: 'ABSENT' }],
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain('Duplicate attendance rejected');
    });

    it('safely updates existing record when overwriteIfDuplicate is true', async () => {
      // 1. Initial record
      await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: class10._id,
          sectionId: sectionA._id,
          date: '2026-11-15',
          session: 'FULL_DAY',
          records: [{ studentId: student1._id, status: 'PRESENT' }],
        });

      // 2. Update with overwriteIfDuplicate = true
      const updateRes = await request(app)
        .post('/api/attendance/mark')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: class10._id,
          sectionId: sectionA._id,
          date: '2026-11-15',
          session: 'FULL_DAY',
          overwriteIfDuplicate: true,
          records: [{ studentId: student1._id, status: 'LATE', remarks: 'Medical appointment' }],
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.summary.late).toBe(1);

      // Verify in DB that only 1 record exists (no duplicate created)
      const count = await Attendance.countDocuments({
        studentId: student1._id,
        date: '2026-11-15',
        session: 'FULL_DAY',
      });
      expect(count).toBe(1);
    });
  });

  // =========================================================================
  // ACCEPTANCE TEST #3: Exam result calculated from configured marks and rules
  // =========================================================================
  describe('Acceptance Test 3: Examination Grade & Percentage Calculation', () => {
    let exam;

    beforeEach(async () => {
      exam = await Examination.create({
        name: 'Midterm Test 2026',
        academicYear: '2026-2027',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-10'),
        gradingRules: [
          { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
          { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.7 },
          { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gpa: 3.0 },
          { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gpa: 2.0 },
          { grade: 'D', minPercentage: 40, maxPercentage: 59.99, gpa: 1.0 },
          { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpa: 0.0 },
        ],
      });
    });

    it('correctly calculates total, percentage (92.5%), grade (A+), gpa (4.0) and PASS status', async () => {
      const res = await request(app)
        .post('/api/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examinationId: exam._id,
          studentId: student1._id,
          marks: [
            { subjectId: subjectMath._id, marksObtained: 95, maxMarks: 100, passingMarks: 40 },
            { subjectId: subjectMath._id, marksObtained: 90, maxMarks: 100, passingMarks: 40 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalObtained).toBe(185);
      expect(res.body.data.totalMaxMarks).toBe(200);
      expect(res.body.data.percentage).toBe(92.5);
      expect(res.body.data.grade).toBe('A+');
      expect(res.body.data.gpa).toBe(4.0);
      expect(res.body.data.status).toBe('PASS');
    });

    it('rejects invalid marks where marksObtained exceeds maxMarks (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examinationId: exam._id,
          studentId: student1._id,
          marks: [{ subjectId: subjectMath._id, marksObtained: 105, maxMarks: 100 }], // invalid!
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cannot exceed maximum marks');
    });
  });

  // =========================================================================
  // ACCEPTANCE TEST #4: Guardian sees only linked student’s allowed info
  // =========================================================================
  describe('Acceptance Test 4: Guardian Privacy & Data Isolation', () => {
    it('allows a guardian to view their own linked student profile', async () => {
      const res = await request(app)
        .get(`/api/students/${student1._id}`)
        .set('Authorization', `Bearer ${guardianToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.admissionNumber).toBe('ADM-001');
      expect(res.body.data.firstName).toBe('Alice');
    });

    it('forbids a guardian from accessing unlinked student profile (403 Forbidden)', async () => {
      // Guardian 1 attempts to access Student 2 (linked to Guardian 2)
      const res = await request(app)
        .get(`/api/students/${student2._id}`)
        .set('Authorization', `Bearer ${guardianToken1}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access Denied');
    });

    it('guardian student list returns ONLY linked children', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${guardianToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id.toString()).toBe(student1._id.toString());
    });
  });

  // =========================================================================
  // ACCEPTANCE TEST #5: Fee due and paid totals reconcile with the fee ledger
  // =========================================================================
  describe('Acceptance Test 5: Fee Reconciliation & Simulated Ledger', () => {
    let feeStructure, invoice;

    beforeEach(async () => {
      feeStructure = await FeeStructure.create({
        name: 'Grade 10 Annual Fee',
        classId: class10._id,
        academicYear: '2026-2027',
        components: [
          { title: 'Tuition', amount: 3000 },
          { title: 'Lab', amount: 1000 },
        ],
        totalAmount: 4000,
        dueDate: new Date('2026-12-31'),
      });

      invoice = await FeeInvoice.create({
        invoiceNumber: 'INV-TEST-001',
        studentId: student1._id,
        classId: class10._id,
        feeStructureId: feeStructure._id,
        title: feeStructure.name,
        academicYear: '2026-2027',
        totalAmount: 4000,
        paidAmount: 0,
        dueAmount: 4000,
        status: 'PENDING',
        dueDate: feeStructure.dueDate,
      });
    });

    it('processes partial payment and reconciles paidAmount and dueAmount exactly with ledger', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invoice._id,
          amount: 1500,
          paymentMethod: 'SIMULATED_CARD',
          idempotencyKey: 'idemp-key-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.invoice.paidAmount).toBe(1500);
      expect(res.body.data.invoice.dueAmount).toBe(2500);
      expect(res.body.data.invoice.status).toBe('PARTIALLY_PAID');

      // Verify in DB that payment ledger reconciles
      const payments = await Payment.find({ invoiceId: invoice._id, status: 'COMPLETED' });
      const ledgerSum = payments.reduce((sum, p) => sum + p.amountPaid, 0);
      expect(ledgerSum).toBe(1500);

      const refreshedInvoice = await FeeInvoice.findById(invoice._id);
      expect(refreshedInvoice.paidAmount).toBe(ledgerSum);
      expect(refreshedInvoice.dueAmount).toBe(refreshedInvoice.totalAmount - ledgerSum);
    });

    it('rejects duplicate payment with the same idempotency key (409 Conflict)', async () => {
      // First payment
      await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invoice._id,
          amount: 500,
          idempotencyKey: 'duplicate-key-abc',
        });

      // Duplicate payment submission
      const duplicateRes = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invoice._id,
          amount: 500,
          idempotencyKey: 'duplicate-key-abc',
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain('Duplicate payment request');
    });

    it('rejects payment amount exceeding the invoice due amount (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invoice._id,
          amount: 9999, // exceeds 4000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds the outstanding balance');
    });
  });
});
