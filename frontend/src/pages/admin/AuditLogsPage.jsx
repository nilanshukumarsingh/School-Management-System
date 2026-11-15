import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { ShieldAlert, Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        search,
        ...(selectedModule && { module: selectedModule }),
      });
      const res = await api.get(`/audit-logs?${params}`);
      if (res.success) {
        setLogs(res.data);
        setMeta(res.meta || { totalPages: 1, total: res.data.length });
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, selectedModule]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Audit Trail</h1>
        <p className="text-sm text-slate-500">
          Immutable records of user operations, security events, and business state transitions.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, action or model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">All Functional Modules</option>
              <option value="AUTH">Authentication</option>
              <option value="STUDENT">Student Management</option>
              <option value="TEACHER">Teacher Management</option>
              <option value="ACADEMICS">Academics</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="EXAMINATION">Examinations</option>
              <option value="FEES">Fee Ledger</option>
              <option value="SYSTEM">System & Bootstrap</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Operator</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                      {log.userName}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">({log.userRole})</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">{log.action}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="xs">
                        {log.module}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="View payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total {meta.total} audit entries</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="font-semibold text-slate-700">
              Page {page} of {meta.totalPages || 1}
            </span>
            <Button
              variant="secondary"
              size="xs"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event: ${selectedLog.action}`}
          description={`Recorded on ${new Date(selectedLog.timestamp).toLocaleString()} by ${selectedLog.userName}`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block uppercase font-bold">Module:</span>
                <span className="font-semibold text-slate-800">{selectedLog.module}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">Affected Model:</span>
                <span className="font-semibold text-slate-800">
                  {selectedLog.affectedModel || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">Record ID:</span>
                <span className="font-mono text-slate-800">
                  {selectedLog.affectedRecordId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">Client IP:</span>
                <span className="font-mono text-slate-800">{selectedLog.ipAddress}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block uppercase font-bold mb-1">
                Event Payload & Changes:
              </span>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
