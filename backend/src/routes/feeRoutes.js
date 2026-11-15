const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticate, authorize } = require('../middleware/auth');

// Structures
router.get('/structures', authenticate, feeController.getFeeStructures);
router.post('/structures', authenticate, authorize('ADMIN'), feeController.createFeeStructure);

// Invoices
router.post('/invoices/generate', authenticate, authorize('ADMIN'), feeController.generateInvoices);
router.get('/invoices', authenticate, feeController.getInvoices);

// Payments & Ledger
router.post('/pay', authenticate, feeController.recordPayment);
router.get('/ledger', authenticate, feeController.getPaymentLedger);

module.exports = router;
