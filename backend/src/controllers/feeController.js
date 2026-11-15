const { FeeStructure, FeeInvoice, Payment, Student, Guardian } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/auditLogger');

// ----------------- FEE STRUCTURES -----------------
const getFeeStructures = async (req, res, next) => {
  try {
    const { classId, academicYear } = req.query;
    const filter = {};
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;

    const structures = await FeeStructure.find(filter)
      .populate('classId', 'name gradeLevel academicYear')
      .sort({ createdAt: -1 });

    return successResponse(res, { data: structures });
  } catch (error) {
    next(error);
  }
};

const createFeeStructure = async (req, res, next) => {
  try {
    const { name, classId, academicYear, term, components, dueDate } = req.body;

    if (!components || !Array.isArray(components) || components.length === 0) {
      return errorResponse(res, { statusCode: 400, message: 'Fee structure must have at least one component.' });
    }

    const totalAmount = components.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const structure = await FeeStructure.create({
      name,
      classId,
      academicYear,
      term: term || 'ANNUAL',
      components,
      totalAmount,
      dueDate: new Date(dueDate),
    });

    await recordAuditLog({
      req,
      action: 'FEE_STRUCTURE_CREATED',
      module: 'FEES',
      affectedRecordId: structure._id,
      affectedModel: 'FeeStructure',
      details: { name, classId, totalAmount, term },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Fee structure created successfully',
      data: structure,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------- FEE INVOICES -----------------

/**
 * Generate Fee Invoices for Students (single student or entire class)
 */
const generateInvoices = async (req, res, next) => {
  try {
    const { feeStructureId, classId, studentId } = req.body;

    const structure = await FeeStructure.findById(feeStructureId);
    if (!structure) {
      return errorResponse(res, { statusCode: 404, message: 'Fee structure not found' });
    }

    let targetStudents = [];
    if (studentId) {
      const student = await Student.findById(studentId);
      if (!student) return errorResponse(res, { statusCode: 404, message: 'Student not found' });
      targetStudents = [student];
    } else if (classId) {
      targetStudents = await Student.find({ classId, status: 'ENROLLED' });
    } else {
      targetStudents = await Student.find({ classId: structure.classId, status: 'ENROLLED' });
    }

    if (targetStudents.length === 0) {
      return errorResponse(res, { statusCode: 400, message: 'No eligible students found to generate invoices for.' });
    }

    const generatedInvoices = [];
    const skippedStudents = [];

    for (const student of targetStudents) {
      // Check if invoice already exists for this student and structure
      const existing = await FeeInvoice.findOne({ studentId: student._id, feeStructureId: structure._id });
      if (existing) {
        skippedStudents.push(student.admissionNumber);
        continue;
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${student.admissionNumber}-${randomSuffix}`;

      const invoice = await FeeInvoice.create({
        invoiceNumber,
        studentId: student._id,
        classId: student.classId,
        feeStructureId: structure._id,
        title: structure.name,
        academicYear: structure.academicYear,
        totalAmount: structure.totalAmount,
        paidAmount: 0,
        dueAmount: structure.totalAmount,
        status: 'PENDING',
        dueDate: structure.dueDate,
      });

      generatedInvoices.push(invoice);
    }

    await recordAuditLog({
      req,
      action: 'FEE_INVOICES_GENERATED',
      module: 'FEES',
      details: {
        feeStructureId,
        generatedCount: generatedInvoices.length,
        skippedCount: skippedStudents.length,
      },
    });

    return successResponse(res, {
      statusCode: 201,
      message: `Generated ${generatedInvoices.length} invoice(s). ${skippedStudents.length} student(s) already had existing invoices.`,
      data: {
        generatedCount: generatedInvoices.length,
        skippedCount: skippedStudents.length,
        invoices: generatedInvoices,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Fee Invoices with Filters and Guardian Isolation (Acceptance Criteria #4)
 */
const getInvoices = async (req, res, next) => {
  try {
    const { studentId, classId, status, search } = req.query;
    const filter = {};

    // GUARDIAN PRIVACY CHECK (Acceptance Test #4)
    if (req.user.role === 'GUARDIAN') {
      const guardian = req.guardianProfile || (await Guardian.findOne({ userId: req.user._id }));
      if (!guardian || !guardian.linkedStudentIds || guardian.linkedStudentIds.length === 0) {
        return successResponse(res, { data: [] });
      }
      filter.studentId = { $in: guardian.linkedStudentIds };
    }

    if (studentId) filter.studentId = studentId;
    if (classId) filter.classId = classId;
    if (status) filter.status = status;

    let invoices = await FeeInvoice.find(filter)
      .populate('studentId', 'firstName lastName admissionNumber rollNumber')
      .populate('classId', 'name gradeLevel academicYear')
      .populate('feeStructureId', 'name term components')
      .sort({ createdAt: -1 });

    if (search && search.trim()) {
      const s = search.toLowerCase();
      invoices = invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(s) ||
          inv.title.toLowerCase().includes(s) ||
          (inv.studentId &&
            (`${inv.studentId.firstName} ${inv.studentId.lastName}`.toLowerCase().includes(s) ||
              inv.studentId.admissionNumber.toLowerCase().includes(s)))
      );
    }

    return successResponse(res, { data: invoices });
  } catch (error) {
    next(error);
  }
};

// ----------------- PAYMENTS & RECONCILIATION -----------------

/**
 * Record a Simulated Payment & Reconcile Invoice Ledger
 * Acceptance Criteria #5: Fee due and paid totals reconcile with the fee ledger.
 * Prevents duplicate payments, enforces non-negative & non-overpayment rules.
 */
const recordPayment = async (req, res, next) => {
  try {
    const {
      invoiceId,
      amount,
      paymentMethod = 'SIMULATED_CARD',
      notes,
      idempotencyKey,
    } = req.body;

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Payment amount must be a positive number greater than zero.',
      });
    }

    // 1. Idempotency Check: Prevent duplicate payment processing
    if (idempotencyKey) {
      const duplicateTxn = await Payment.findOne({ idempotencyKey });
      if (duplicateTxn) {
        return errorResponse(res, {
          statusCode: 409,
          message: 'Duplicate payment request: A transaction with this idempotency key has already been processed.',
          data: duplicateTxn,
        });
      }
    }

    const invoice = await FeeInvoice.findById(invoiceId);
    if (!invoice) {
      return errorResponse(res, { statusCode: 404, message: 'Fee invoice not found' });
    }

    // GUARDIAN PRIVACY CHECK: Guardian can only pay for linked student
    if (req.user.role === 'GUARDIAN') {
      const guardian = req.guardianProfile || (await Guardian.findOne({ userId: req.user._id }));
      const isLinked = guardian && guardian.linkedStudentIds.some((sId) => sId.toString() === invoice.studentId.toString());
      if (!isLinked) {
        return errorResponse(res, {
          statusCode: 403,
          message: 'Access Denied: You cannot make payments for an unlinked student invoice.',
        });
      }
    }

    // 2. Validate against overpayment
    if (invoice.status === 'PAID' || invoice.dueAmount <= 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'This invoice has already been fully paid. No outstanding balance remaining.',
      });
    }

    if (paymentAmount > invoice.dueAmount) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Payment amount ($${paymentAmount}) exceeds the outstanding balance ($${invoice.dueAmount}).`,
      });
    }

    // 3. Create simulated transaction
    const timestamp = Date.now();
    const transactionId = `TXN-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const payment = await Payment.create({
      transactionId,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amountPaid: paymentAmount,
      paymentMethod,
      recordedBy: req.user._id,
      receiptNumber,
      status: 'COMPLETED',
      idempotencyKey: idempotencyKey || null,
      notes: notes || 'Simulated fee payment',
      paymentDate: new Date(),
    });

    // 4. LEDGER RECONCILIATION: Calculate exact total from payment ledger
    const allCompletedPayments = await Payment.find({
      invoiceId: invoice._id,
      status: 'COMPLETED',
    });

    const reconciledPaidTotal = allCompletedPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const reconciledDueAmount = Math.max(0, invoice.totalAmount - reconciledPaidTotal);

    // Update invoice status based on reconciled balances
    let newStatus = 'PARTIALLY_PAID';
    if (reconciledDueAmount === 0) {
      newStatus = 'PAID';
    } else if (reconciledPaidTotal === 0) {
      newStatus = 'PENDING';
    }

    invoice.paidAmount = reconciledPaidTotal;
    invoice.dueAmount = reconciledDueAmount;
    invoice.status = newStatus;
    await invoice.save();

    await recordAuditLog({
      req,
      action: 'FEE_PAYMENT_PROCESSED',
      module: 'FEES',
      affectedRecordId: payment._id,
      affectedModel: 'Payment',
      details: {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        amountPaid: paymentAmount,
        transactionId,
        reconciledPaidTotal,
        reconciledDueAmount,
        status: newStatus,
      },
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Simulated payment processed and ledger reconciled successfully',
      data: {
        payment,
        invoice: {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          paidAmount: invoice.paidAmount,
          dueAmount: invoice.dueAmount,
          status: invoice.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payment Transaction Ledger (Admin & Guardian for linked student)
 */
const getPaymentLedger = async (req, res, next) => {
  try {
    const { studentId, invoiceId } = req.query;
    const filter = { status: 'COMPLETED' };

    // GUARDIAN PRIVACY CHECK (Acceptance Test #4)
    if (req.user.role === 'GUARDIAN') {
      const guardian = req.guardianProfile || (await Guardian.findOne({ userId: req.user._id }));
      if (!guardian || !guardian.linkedStudentIds || guardian.linkedStudentIds.length === 0) {
        return successResponse(res, { data: [] });
      }
      filter.studentId = { $in: guardian.linkedStudentIds };
    }

    if (studentId) filter.studentId = studentId;
    if (invoiceId) filter.invoiceId = invoiceId;

    const payments = await Payment.find(filter)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('invoiceId', 'invoiceNumber title totalAmount dueAmount')
      .populate('recordedBy', 'name role')
      .sort({ paymentDate: -1 });

    return successResponse(res, { data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeeStructures,
  createFeeStructure,
  generateInvoices,
  getInvoices,
  recordPayment,
  getPaymentLedger,
};
