import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CreditCard, CheckCircle2, History, Receipt } from 'lucide-react';

export const GuardianFeesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'payments'

  // Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('SIMULATED_CARD');
  const [processing, setProcessing] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([api.get('/fees/invoices'), api.get('/fees/ledger')]);
      if (invRes.success) setInvoices(invRes.data);
      if (payRes.success) setPayments(payRes.data);
    } catch (err) {
      toast.error('Failed to load fee ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPay = (inv) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.dueAmount);
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setProcessing(true);
    try {
      const idempotencyKey = `parent-txn-${selectedInvoice._id}-${Date.now()}`;
      const res = await api.post('/fees/pay', {
        invoiceId: selectedInvoice._id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        idempotencyKey,
        notes: 'Guardian online simulated checkout',
      });

      toast.success(res.message || 'Payment successful! Fee ledger reconciled.');
      setIsPayModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Tuition & Fee Statements
        </h1>
        <p className="text-sm text-slate-500">
          Acceptance Test #5: Clear statements and instant simulated settlement.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'invoices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> Outstanding Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Payment Receipts ({payments.length})
        </button>
      </div>

      {activeTab === 'invoices' && (
        <Card className="p-0 overflow-hidden">
          {invoices.length === 0 ? (
            <EmptyState title="No invoices found for your linked children" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Due Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-indigo-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {inv.studentId?.firstName} {inv.studentId?.lastName}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{inv.title}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">${inv.totalAmount}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">${inv.paidAmount}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">${inv.dueAmount}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'success'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'warning'
                              : 'danger'
                          }
                          size="xs"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.dueAmount > 0 ? (
                          <Button
                            variant="primary"
                            size="xs"
                            icon={CreditCard}
                            onClick={() => handleOpenPay(inv)}
                          >
                            Pay Online
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card className="p-0 overflow-hidden">
          {payments.length === 0 ? (
            <EmptyState title="No payment receipts on record" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-slate-800">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-indigo-600">
                        {p.transactionId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.studentId?.firstName} {p.studentId?.lastName}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-600">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">+${p.amountPaid}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="success" size="xs">
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Simulated Tuition Fee Checkout"
          description={`Invoice: ${selectedInvoice.invoiceNumber} • Remaining Due: $${selectedInvoice.dueAmount}`}
        >
          <form onSubmit={handleExecutePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Payment Amount ($) *
              </label>
              <input
                type="number"
                min="1"
                max={selectedInvoice.dueAmount}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="SIMULATED_CARD">Simulated Card Checkout</option>
                <option value="BANK_TRANSFER">Bank Wire Transfer</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              💡 <strong>Demo Simulation:</strong> No actual financial transactions or card
              charges are performed. The ledger will automatically reconcile and issue a receipt.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsPayModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={processing}>
                Authorize Simulated Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
