import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CalendarCheck } from 'lucide-react';

export const GuardianAttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        if (res.success && res.data.length > 0) {
          setStudents(res.data);
          setSelectedStudentId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchStudentAttendance = async () => {
      if (!selectedStudentId) return;
      try {
        const res = await api.get(`/attendance/student/${selectedStudentId}`);
        if (res.success) {
          setAttendanceData(res.data);
        }
      } catch (err) {
        console.error('Failed to load attendance history');
      }
    };
    fetchStudentAttendance();
  }, [selectedStudentId]);

  const stats = attendanceData?.statistics || {};
  const records = attendanceData?.records || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Attendance History
        </h1>
        <p className="text-sm text-slate-500">
          Daily presence records, punctuality tracking, and percentage calculations.
        </p>
      </div>

      {students.length > 1 && (
        <div className="flex gap-2">
          {students.map((s) => (
            <button
              key={s._id}
              onClick={() => setSelectedStudentId(s._id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                selectedStudentId === s._id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {s.firstName} {s.lastName}
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Total Days Logged</span>
          <span className="text-2xl font-extrabold text-slate-900 block mt-1">
            {stats.totalSessions ?? 0}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Days Present</span>
          <span className="text-2xl font-extrabold text-emerald-600 block mt-1">
            {stats.presentCount ?? 0}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Late Arrivals</span>
          <span className="text-2xl font-extrabold text-amber-600 block mt-1">
            {stats.lateCount ?? 0}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Overall Attendance</span>
          <span className="text-2xl font-extrabold text-indigo-600 block mt-1">
            {stats.attendancePercentage ?? 0}%
          </span>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {records.length === 0 ? (
          <EmptyState title="No attendance records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Session</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-500">{r.session}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          r.status === 'PRESENT'
                            ? 'success'
                            : r.status === 'LATE'
                            ? 'warning'
                            : 'danger'
                        }
                        size="xs"
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{r.remarks || 'Normal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
