require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const {
  User,
  Student,
  Guardian,
  Teacher,
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
  AuditLog,
} = require('../models');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scholaverse';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Guardian.deleteMany({}),
      Teacher.deleteMany({}),
      Class.deleteMany({}),
      Section.deleteMany({}),
      Subject.deleteMany({}),
      TeacherAssignment.deleteMany({}),
      Attendance.deleteMany({}),
      Examination.deleteMany({}),
      ExamResult.deleteMany({}),
      FeeStructure.deleteMany({}),
      FeeInvoice.deleteMany({}),
      Payment.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const adminPassword = await User.hashPassword('Admin@123');
    const teacherPassword = await User.hashPassword('Teacher@123');
    const guardianPassword = await User.hashPassword('Guardian@123');

    // 1. Admin
    const adminUser = await User.create({
      name: 'Dr. Arthur Pendelton',
      email: 'admin@scholaverse.edu',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'ACTIVE',
    });

    // 2. Teachers
    const teacherUser1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@scholaverse.edu',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      status: 'ACTIVE',
    });

    const teacherUser2 = await User.create({
      name: 'Robert Chen',
      email: 'robert.chen@scholaverse.edu',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'ACTIVE',
    });

    // 3. Guardians
    const guardianUser1 = await User.create({
      name: 'Michael Vance',
      email: 'michael.vance@parent.scholaverse.edu',
      passwordHash: guardianPassword,
      role: 'GUARDIAN',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'ACTIVE',
    });

    const guardianUser2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@parent.scholaverse.edu',
      passwordHash: guardianPassword,
      role: 'GUARDIAN',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      status: 'ACTIVE',
    });

    console.log('[Seed] Creating Teacher and Guardian profiles...');
    const teacher1 = await Teacher.create({
      userId: teacherUser1._id,
      employeeId: 'EMP-T-101',
      designation: 'Senior Faculty',
      qualification: 'M.Sc. Mathematics, B.Ed',
      specialization: 'Pure Mathematics & Calculus',
      availabilityStatus: 'AVAILABLE',
      contactPhone: teacherUser1.phone,
    });

    const teacher2 = await Teacher.create({
      userId: teacherUser2._id,
      employeeId: 'EMP-T-102',
      designation: 'Department Head',
      qualification: 'M.A. English Literature',
      specialization: 'Comparative Literature & Rhetoric',
      availabilityStatus: 'AVAILABLE',
      contactPhone: teacherUser2.phone,
    });

    const guardianProfile1 = await Guardian.create({
      userId: guardianUser1._id,
      relationship: 'FATHER',
      occupation: 'Software Engineering Director',
      alternatePhone: '+1 (555) 876-0000',
      address: '742 Evergreen Terrace, Springfield',
      linkedStudentIds: [],
    });

    const guardianProfile2 = await Guardian.create({
      userId: guardianUser2._id,
      relationship: 'MOTHER',
      occupation: 'Pediatric Surgeon',
      alternatePhone: '+1 (555) 987-0000',
      address: '10880 Wilshire Blvd, Los Angeles',
      linkedStudentIds: [],
    });

    console.log('[Seed] Creating Academic Classes, Sections, and Subjects...');
    const class9 = await Class.create({
      name: 'Grade 9',
      gradeLevel: 9,
      academicYear: '2026-2027',
      description: 'Freshman High School Academic Program',
    });

    const class10 = await Class.create({
      name: 'Grade 10',
      gradeLevel: 10,
      academicYear: '2026-2027',
      description: 'Sophomore High School Advanced Curriculum',
    });

    const section10A = await Section.create({
      name: 'A',
      classId: class10._id,
      roomNumber: 'Room 301 (East Wing)',
      capacity: 35,
    });

    const section10B = await Section.create({
      name: 'B',
      classId: class10._id,
      roomNumber: 'Room 302 (East Wing)',
      capacity: 35,
    });

    const section9A = await Section.create({
      name: 'A',
      classId: class9._id,
      roomNumber: 'Room 201 (North Wing)',
      capacity: 35,
    });

    const subjectMath = await Subject.create({
      name: 'Advanced Mathematics',
      code: 'MATH-10',
      classId: class10._id,
      credits: 4,
      description: 'Trigonometry, Coordinate Geometry and Algebra II',
    });

    const subjectEnglish = await Subject.create({
      name: 'English Literature',
      code: 'ENG-10',
      classId: class10._id,
      credits: 3,
      description: 'Classical & Contemporary World Literature',
    });

    const subjectScience = await Subject.create({
      name: 'Physical Sciences',
      code: 'SCI-10',
      classId: class10._id,
      credits: 4,
      description: 'Physics and Chemistry Foundations with Lab Work',
    });

    const subjectHistory = await Subject.create({
      name: 'World History',
      code: 'HIST-10',
      classId: class10._id,
      credits: 3,
      description: 'Modern Global History and Civilizations',
    });

    console.log('[Seed] Assigning Teachers to Classes...');
    // Sarah Jenkins assigned to Grade 10 Section A as Class Teacher & Math Teacher
    await TeacherAssignment.create({
      teacherId: teacher1._id,
      classId: class10._id,
      sectionId: section10A._id,
      subjectId: subjectMath._id,
      isClassTeacher: true,
      academicYear: '2026-2027',
    });

    // Robert Chen assigned to Grade 10 Section A for English
    await TeacherAssignment.create({
      teacherId: teacher2._id,
      classId: class10._id,
      sectionId: section10A._id,
      subjectId: subjectEnglish._id,
      isClassTeacher: false,
      academicYear: '2026-2027',
    });

    console.log('[Seed] Creating Students...');
    const student1 = await Student.create({
      admissionNumber: 'ADM-2026-001',
      firstName: 'Lucas',
      lastName: 'Vance',
      dateOfBirth: new Date('2010-04-12'),
      gender: 'MALE',
      bloodGroup: 'O+',
      classId: class10._id,
      sectionId: section10A._id,
      guardianId: guardianProfile1._id,
      rollNumber: 1,
      address: guardianProfile1.address,
      emergencyContact: { name: 'Michael Vance', phone: guardianUser1.phone, relation: 'Father' },
      medicalNotes: 'No known allergies',
      status: 'ENROLLED',
    });

    const student2 = await Student.create({
      admissionNumber: 'ADM-2026-002',
      firstName: 'Sophia',
      lastName: 'Vance',
      dateOfBirth: new Date('2011-09-21'),
      gender: 'FEMALE',
      bloodGroup: 'A+',
      classId: class9._id,
      sectionId: section9A._id,
      guardianId: guardianProfile1._id,
      rollNumber: 2,
      address: guardianProfile1.address,
      emergencyContact: { name: 'Michael Vance', phone: guardianUser1.phone, relation: 'Father' },
      medicalNotes: 'Mild asthma inhaler in medical room',
      status: 'ENROLLED',
    });

    const student3 = await Student.create({
      admissionNumber: 'ADM-2026-003',
      firstName: 'Alexander',
      lastName: 'Rostov',
      dateOfBirth: new Date('2010-02-18'),
      gender: 'MALE',
      bloodGroup: 'B+',
      classId: class10._id,
      sectionId: section10A._id,
      guardianId: guardianProfile2._id,
      rollNumber: 3,
      address: guardianProfile2.address,
      emergencyContact: { name: 'Elena Rostova', phone: guardianUser2.phone, relation: 'Mother' },
      status: 'ENROLLED',
    });

    const student4 = await Student.create({
      admissionNumber: 'ADM-2026-004',
      firstName: 'Maya',
      lastName: 'Patel',
      dateOfBirth: new Date('2010-06-30'),
      gender: 'FEMALE',
      bloodGroup: 'AB+',
      classId: class10._id,
      sectionId: section10A._id,
      rollNumber: 4,
      address: '42 Maple Avenue, Springfield',
      status: 'ENROLLED',
    });

    const student5 = await Student.create({
      admissionNumber: 'ADM-2026-005',
      firstName: 'Liam',
      lastName: "O'Connor",
      dateOfBirth: new Date('2010-11-14'),
      gender: 'MALE',
      bloodGroup: 'O-',
      classId: class10._id,
      sectionId: section10A._id,
      rollNumber: 5,
      status: 'ENROLLED',
    });

    // Update guardian linked students
    guardianProfile1.linkedStudentIds = [student1._id, student2._id];
    await guardianProfile1.save();

    guardianProfile2.linkedStudentIds = [student3._id];
    await guardianProfile2.save();

    console.log('[Seed] Creating Attendance Records with compound unique index...');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    await Attendance.create([
      {
        studentId: student1._id,
        classId: class10._id,
        sectionId: section10A._id,
        date: today,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedBy: teacherUser1._id,
      },
      {
        studentId: student3._id,
        classId: class10._id,
        sectionId: section10A._id,
        date: today,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedBy: teacherUser1._id,
      },
      {
        studentId: student4._id,
        classId: class10._id,
        sectionId: section10A._id,
        date: today,
        session: 'FULL_DAY',
        status: 'LATE',
        remarks: 'Bus delay 15 mins',
        recordedBy: teacherUser1._id,
      },
      {
        studentId: student5._id,
        classId: class10._id,
        sectionId: section10A._id,
        date: today,
        session: 'FULL_DAY',
        status: 'ABSENT',
        remarks: 'Sick leave reported by phone',
        recordedBy: teacherUser1._id,
      },
      // Yesterday records
      {
        studentId: student1._id,
        classId: class10._id,
        sectionId: section10A._id,
        date: yesterday,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedBy: teacherUser1._id,
      },
      {
        studentId: student3._id,
        classId: class10._id,
        sectionId: section10A._id,
        date: yesterday,
        session: 'FULL_DAY',
        status: 'PRESENT',
        recordedBy: teacherUser1._id,
      },
    ]);

    console.log('[Seed] Creating Examination and Results...');
    const midtermExam = await Examination.create({
      name: 'Midterm Examination 2026',
      examType: 'MIDTERM',
      academicYear: '2026-2027',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-15'),
      status: 'PUBLISHED',
      gradingRules: [
        { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0, description: 'Outstanding' },
        { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.7, description: 'Excellent' },
        { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gpa: 3.0, description: 'Good' },
        { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gpa: 2.0, description: 'Satisfactory' },
        { grade: 'D', minPercentage: 40, maxPercentage: 59.99, gpa: 1.0, description: 'Pass' },
        { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpa: 0.0, description: 'Fail' },
      ],
    });

    // Enter marks for Lucas Vance (Straight A / A+ student)
    await ExamResult.create({
      examinationId: midtermExam._id,
      studentId: student1._id,
      classId: class10._id,
      sectionId: section10A._id,
      marks: [
        { subjectId: subjectMath._id, marksObtained: 95, maxMarks: 100, passingMarks: 40, isPassed: true },
        { subjectId: subjectEnglish._id, marksObtained: 88, maxMarks: 100, passingMarks: 40, isPassed: true },
        { subjectId: subjectScience._id, marksObtained: 92, maxMarks: 100, passingMarks: 40, isPassed: true },
        { subjectId: subjectHistory._id, marksObtained: 86, maxMarks: 100, passingMarks: 40, isPassed: true },
      ],
      totalObtained: 361,
      totalMaxMarks: 400,
      percentage: 90.25,
      grade: 'A+',
      gpa: 4.0,
      status: 'PASS',
      enteredBy: teacherUser1._id,
    });

    // Enter marks for Alexander Rostov (Good student: B+)
    await ExamResult.create({
      examinationId: midtermExam._id,
      studentId: student3._id,
      classId: class10._id,
      sectionId: section10A._id,
      marks: [
        { subjectId: subjectMath._id, marksObtained: 76, maxMarks: 100, passingMarks: 40, isPassed: true },
        { subjectId: subjectEnglish._id, marksObtained: 82, maxMarks: 100, passingMarks: 40, isPassed: true },
        { subjectId: subjectScience._id, marksObtained: 74, maxMarks: 100, passingMarks: 40, isPassed: true },
        { subjectId: subjectHistory._id, marksObtained: 80, maxMarks: 100, passingMarks: 40, isPassed: true },
      ],
      totalObtained: 312,
      totalMaxMarks: 400,
      percentage: 78.0,
      grade: 'B',
      gpa: 3.0,
      status: 'PASS',
      enteredBy: teacherUser1._id,
    });

    console.log('[Seed] Creating Fee Structures, Invoices and Reconciled Ledger...');
    const feeStructure10 = await FeeStructure.create({
      name: 'Grade 10 Annual Comprehensive Tuition & Laboratory Fee',
      classId: class10._id,
      academicYear: '2026-2027',
      term: 'ANNUAL',
      components: [
        { title: 'Tuition Fee', amount: 3500, isOptional: false },
        { title: 'Science Laboratory Access', amount: 450, isOptional: false },
        { title: 'Digital Library & Materials', amount: 200, isOptional: false },
        { title: 'STEM & Software License', amount: 350, isOptional: false },
      ],
      totalAmount: 4500,
      dueDate: new Date('2026-12-15'),
    });

    // Invoice 1: Lucas Vance - Fully Paid
    const invLucas = await FeeInvoice.create({
      invoiceNumber: 'INV-2026-001-LUCAS',
      studentId: student1._id,
      classId: class10._id,
      feeStructureId: feeStructure10._id,
      title: feeStructure10.name,
      academicYear: '2026-2027',
      totalAmount: 4500,
      paidAmount: 4500,
      dueAmount: 0,
      status: 'PAID',
      dueDate: feeStructure10.dueDate,
    });

    await Payment.create({
      transactionId: 'TXN-2026-LUCAS-001',
      invoiceId: invLucas._id,
      studentId: student1._id,
      amountPaid: 4500,
      paymentMethod: 'SIMULATED_CARD',
      receiptNumber: 'REC-2026-4401',
      status: 'COMPLETED',
      recordedBy: adminUser._id,
      notes: 'Full annual tuition settled via simulated card checkout',
    });

    // Invoice 2: Alexander Rostov - Partially Paid ($2,000 paid, $2,500 due)
    const invAlex = await FeeInvoice.create({
      invoiceNumber: 'INV-2026-003-ALEX',
      studentId: student3._id,
      classId: class10._id,
      feeStructureId: feeStructure10._id,
      title: feeStructure10.name,
      academicYear: '2026-2027',
      totalAmount: 4500,
      paidAmount: 2000,
      dueAmount: 2500,
      status: 'PARTIALLY_PAID',
      dueDate: feeStructure10.dueDate,
    });

    await Payment.create({
      transactionId: 'TXN-2026-ALEX-001',
      invoiceId: invAlex._id,
      studentId: student3._id,
      amountPaid: 2000,
      paymentMethod: 'BANK_TRANSFER',
      receiptNumber: 'REC-2026-4402',
      status: 'COMPLETED',
      recordedBy: adminUser._id,
      notes: 'Initial term installment processed',
    });

    // Invoice 3: Maya Patel - Unpaid / Pending ($4,500 due)
    await FeeInvoice.create({
      invoiceNumber: 'INV-2026-004-MAYA',
      studentId: student4._id,
      classId: class10._id,
      feeStructureId: feeStructure10._id,
      title: feeStructure10.name,
      academicYear: '2026-2027',
      totalAmount: 4500,
      paidAmount: 0,
      dueAmount: 4500,
      status: 'PENDING',
      dueDate: feeStructure10.dueDate,
    });

    console.log('[Seed] Creating Audit Trail...');
    await AuditLog.create([
      {
        userId: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'SYSTEM_BOOTSTRAP',
        module: 'SYSTEM',
        details: { message: 'Initialized ScholaVerse academic master databases and configurations' },
      },
      {
        userId: teacherUser1._id,
        userName: teacherUser1.name,
        userRole: teacherUser1.role,
        action: 'ATTENDANCE_RECORDED',
        module: 'ATTENDANCE',
        details: { class: 'Grade 10', section: 'A', date: today, totalStudents: 4 },
      },
      {
        userId: teacherUser1._id,
        userName: teacherUser1.name,
        userRole: teacherUser1.role,
        action: 'EXAM_MARKS_RECORDED',
        module: 'EXAMINATION',
        details: { exam: 'Midterm Examination 2026', student: 'Lucas Vance', grade: 'A+' },
      },
      {
        userId: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'FEE_PAYMENT_PROCESSED',
        module: 'FEES',
        details: { invoice: 'INV-2026-001-LUCAS', amount: 4500, status: 'PAID' },
      },
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials for Evaluation:');
    console.log('👑 Admin:    admin@scholaverse.edu / Admin@123');
    console.log('👩‍🏫 Teacher:  sarah.jenkins@scholaverse.edu / Teacher@123');
    console.log('👨‍👩‍👦 Guardian: michael.vance@parent.scholaverse.edu / Guardian@123');
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
