import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { CustomSelect } from '../../components/common/CustomSelect';
import { CreditCard, Plus, DollarSign, Receipt, Search, CheckCircle2, History } from 'lucide-react';

export const FeesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [paymentsLedger, setPaymentsLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewTab, setViewTab] = useState('invoices'); // 'invoices' | 'ledger' | 'structures'

  // Modals
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Forms
  const [structureForm, setStructureForm] = useState({
    name: 'Annual Academic & Lab Fee',
    classId: '',
    academicYear: '2026-2027',
    term: 'ANNUAL',
    components: [
      { title: 'Tuition Fee', amount: 3000 },
      { title: 'Laboratory Fee', amount: 500 },
      { title: 'Library & Tech Access', amount: 500 },
    ],
    dueDate: '2026-12-31',
  });

  const [generateForm, setGenerateForm] = useState({
    feeStructureId: '',
    classId: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'SIMULATED_CARD',
    notes: 'Simulated tuition settlement',
  });

  const toast = useToast();

  const loadAll = async () => {
    setLoading(true);
    try {
      const [invRes, strRes, clsRes, ledRes] = await Promise.all([
        api.get(`/fees/invoices?search=${encodeURIComponent(search)}`),
        api.get('/fees/structures'),
        api.get('/academics/classes'),
        api.get('/fees/ledger'),
      ]);
      if (invRes.success) setInvoices(invRes.data);
      if (strRes.success) setStructures(strRes.data);
      if (clsRes.success) setClasses(clsRes.data);
      if (ledRes.success) setPaymentsLedger(ledRes.data);
    } catch (err) {
      toast.error('Failed to load fee data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [search]);

  const handleOpenPayModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      amount: inv.dueAmount,
      paymentMethod: 'SIMULATED_CARD',
      notes: `Settlement for invoice ${inv.invoiceNumber}`,
    });
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      // Generate clean idempotency key
      const idempotencyKey = `idemp-${selectedInvoice._id}-${Date.now()}`;

      const res = await api.post('/fees/pay', {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes,
        idempotencyKey,
      });

      toast.success(res.message || 'Payment successfully processed & reconciled!');
      setIsPayModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Payment processing failed');
    }
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/structures', structureForm);
      toast.success('Fee structure created');
      setIsStructureModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGenerateInvoices = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/invoices/generate', generateForm);
      toast.success(res.message || 'Invoices generated');
      setIsGenerateModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Management & Ledger</h1>
          <p className="text-sm text-slate-500">
            Structure fees, generate invoices, and reconcile simulated payment ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => {
              if (structures.length > 0) setGenerateForm({ feeStructureId: structures[0]._id, classId: '' });
              setIsGenerateModalOpen(true);
            }}
          >
            Generate Invoices
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              if (classes.length > 0) setStructureForm({ ...structureForm, classId: classes[0]._id });
              setIsStructureModalOpen(true);
            }}
          >
            New Fee Structure
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setViewTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            viewTab === 'invoices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setViewTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            viewTab === 'ledger'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Payment Ledger ({paymentsLedger.length})
        </button>
        <button
          onClick={() => setViewTab('structures')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            viewTab === 'structures'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Fee Structures ({structures.length})
        </button>
      </div>

      {/* Invoices View */}
      {viewTab === 'invoices' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-40">Invoice #</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Fee Title</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Due Balance</th>
                  <th className="py-3.5 px-4 text-center w-28">Status</th>
                  <th className="py-3.5 px-4 text-right w-36">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {inv.studentId?.firstName} {inv.studentId?.lastName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {inv.studentId?.admissionNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{inv.title}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">${inv.totalAmount}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">${inv.paidAmount}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">${inv.dueAmount}</td>
                    <td className="py-3.5 px-4 text-center">
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
                    <td className="py-3.5 px-4 text-right">
                      {inv.dueAmount > 0 ? (
                        <Button
                          variant="primary"
                          size="xs"
                          icon={CreditCard}
                          onClick={() => handleOpenPayModal(inv)}
                        >
                          Record Payment
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ledger View (Acceptance Criteria #5) */}
      {viewTab === 'ledger' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentsLedger.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">
                      {p.transactionId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.studentId?.firstName} {p.studentId?.lastName}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">+${p.amountPaid}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(p.paymentDate).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="xs">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Structures View */}
      {viewTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {structures.map((s) => (
            <Card key={s._id} hover className="flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                <span className="text-xs text-slate-400">
                  {s.classId?.name} • Term: {s.term}
                </span>

                <div className="mt-4 space-y-1.5 text-xs border-t border-slate-100 pt-3">
                  {s.components?.map((c, i) => (
                    <div key={i} className="flex justify-between text-slate-600">
                      <span>{c.title}:</span>
                      <strong className="text-slate-900">${c.amount}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Total:</span>
                <span className="text-lg font-extrabold text-indigo-600">${s.totalAmount}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Process Simulated Fee Payment"
          description={`Invoice #${selectedInvoice.invoiceNumber} • Outstanding Due: $${selectedInvoice.dueAmount}`}
        >
          <form onSubmit={handleProcessPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Payment Amount ($) *
              </label>
              <input
                type="number"
                min="1"
                max={selectedInvoice.dueAmount}
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Cannot exceed outstanding balance of ${selectedInvoice.dueAmount}.
              </span>
            </div>

            <CustomSelect
              label="Payment Method"
              value={paymentForm.paymentMethod}
              onChange={(val) => setPaymentForm({ ...paymentForm, paymentMethod: val })}
              options={[
                { value: 'SIMULATED_CARD', label: 'Simulated Credit Card' },
                { value: 'BANK_TRANSFER', label: 'Direct Bank Transfer' },
                { value: 'CASH', label: 'Institutional Cash Counter' },
                { value: 'CHEQUE', label: 'Bank Cheque' },
              ]}
              placeholder="Select method..."
            />

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsPayModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm & Reconcile Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Fee Structure Modal */}
      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        title="Create Academic Fee Structure"
      >
        <form onSubmit={handleCreateStructure} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Structure Title *
            </label>
            <input
              type="text"
              required
              value={structureForm.name}
              onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              label="Class *"
              value={structureForm.classId}
              onChange={(val) => setStructureForm({ ...structureForm, classId: val })}
              options={classes.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              placeholder="Select Class..."
            />
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={structureForm.dueDate}
                onChange={(e) => setStructureForm({ ...structureForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsStructureModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Fee Structure
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate Invoices Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Batch Generate Invoices"
        description="Generates student invoices for a specific class and fee structure."
      >
        <form onSubmit={handleGenerateInvoices} className="space-y-4">
          <CustomSelect
            label="Fee Structure *"
            value={generateForm.feeStructureId}
            onChange={(val) => setGenerateForm({ ...generateForm, feeStructureId: val })}
            options={structures.map((s) => ({
              value: s._id,
              label: s.name,
              subtitle: `Amount: $${s.totalAmount} • Year: ${s.academicYear}`,
            }))}
            placeholder="Select Fee Structure..."
          />

          <CustomSelect
            label="Target Class (Optional - defaults to structure class)"
            value={generateForm.classId}
            onChange={(val) => setGenerateForm({ ...generateForm, classId: val })}
            options={[
              { value: '', label: 'Use Structure Default Class' },
              ...classes.map((c) => ({
                value: c._id,
                label: c.name,
              })),
            ]}
            placeholder="Choose Class Override..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Generate Invoices
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
