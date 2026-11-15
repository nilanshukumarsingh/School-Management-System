import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CustomSelect } from '../../components/common/CustomSelect';
import { CalendarCheck, Save } from 'lucide-react';

export const TeacherAttendancePage = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('FULL_DAY');
  const [overwriteIfDuplicate, setOverwriteIfDuplicate] = useState(false);

  const [students, setStudents] = useState([]);
  const [recordsMap, setRecordsMap] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/academics/assignments');
        if (res.success && res.data.length > 0) {
          setAssignments(res.data);
          setSelectedAsg(res.data[0]);
        }
      } catch (err) {
        toast.error('Failed to load assigned classes');
      }
    };
    fetchAssignments();
  }, []);

  const loadAttendance = async () => {
    if (!selectedAsg) return;
    setLoading(true);
    try {
      const classId = selectedAsg.classId?._id;
      const sectionId = selectedAsg.sectionId?._id;

      const [studRes, attRes] = await Promise.all([
        api.get(`/students?classId=${classId}&sectionId=${sectionId}&limit=100`),
        api.get(`/attendance/class?classId=${classId}&sectionId=${sectionId}&date=${date}&session=${session}`),
      ]);

      const studentList = studRes.data || [];
      const existingRecords = attRes.data?.records || [];

      setStudents(studentList);
      setSummary(attRes.data?.summary || null);

      const map = {};
      studentList.forEach((s) => {
        const existing = existingRecords.find((r) => r.studentId?._id === s._id || r.studentId === s._id);
        map[s._id] = {
          status: existing ? existing.status : 'PRESENT',
          remarks: existing?.remarks || '',
        };
      });
      setRecordsMap(map);
    } catch (err) {
      toast.error(err.message || 'Error loading attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAsg) {
      loadAttendance();
    }
  }, [selectedAsg, date, session]);

  const handleStatusChange = (studentId, status) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleSave = async () => {
    if (students.length === 0 || !selectedAsg) return;
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: recordsMap[s._id]?.status || 'PRESENT',
        remarks: recordsMap[s._id]?.remarks || '',
      }));

      const payload = {
        classId: selectedAsg.classId?._id,
        sectionId: selectedAsg.sectionId?._id,
        date,
        session,
        records,
        overwriteIfDuplicate,
      };

      const res = await api.post('/attendance/mark', payload);
      toast.success(res.message || 'Attendance committed successfully!');
      loadAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to submit attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Attendance Register
          </h1>
          <p className="text-sm text-slate-500">
            Record and review student attendance for assigned sections.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Save}
          isLoading={saving}
          disabled={students.length === 0}
          onClick={handleSave}
        >
          Save & Commit Attendance
        </Button>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CustomSelect
            label="Authorized Class & Section"
            value={selectedAsg?._id || ''}
            onChange={(val) => {
              const found = assignments.find((a) => a._id === val);
              if (found) setSelectedAsg(found);
            }}
            options={assignments.map((asg) => ({
              value: asg._id,
              label: `${asg.classId?.name} - Section ${asg.sectionId?.name}`,
              subtitle: asg.subjectId?.name ? `Subject: ${asg.subjectId.name}` : 'Homeroom Lead',
            }))}
            placeholder="Select class section..."
          />

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
              Session Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 shadow-xs font-medium text-slate-800"
            />
          </div>

          <CustomSelect
            label="Session"
            value={session}
            onChange={(val) => setSession(val)}
            options={[
              { value: 'FULL_DAY', label: 'Full Day Attendance' },
              { value: 'MORNING', label: 'Morning Only' },
              { value: 'AFTERNOON', label: 'Afternoon Only' },
            ]}
            placeholder="Select session..."
          />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={overwriteIfDuplicate}
              onChange={(e) => setOverwriteIfDuplicate(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>
              <strong>Overwrite if already marked today</strong> (Enforces database uniqueness
              constraint when unchecked)
            </span>
          </label>
        </div>
      </Card>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Class Total</span>
            <span className="text-xl font-bold text-slate-800 block">{summary.total}</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Present</span>
            <span className="text-xl font-bold text-emerald-700 block">{summary.present}</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
            <span className="text-[10px] font-bold text-amber-600 uppercase">Late</span>
            <span className="text-xl font-bold text-amber-700 block">{summary.late}</span>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
            <span className="text-[10px] font-bold text-rose-600 uppercase">Absent</span>
            <span className="text-xl font-bold text-rose-700 block">{summary.absent}</span>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Percentage</span>
            <span className="text-xl font-bold text-indigo-700 block">{summary.percentage}%</span>
          </div>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading attendance sheet...</div>
        ) : students.length === 0 ? (
          <EmptyState title="No students in assigned section" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 text-center w-20">Roll</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 w-36">Admission #</th>
                  <th className="py-3.5 px-4 text-center w-80">Attendance Status</th>
                  <th className="py-3.5 px-4">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const currentStatus = recordsMap[student._id]?.status || 'PRESENT';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-center font-mono font-bold text-xs text-slate-700">
                        {student.rollNumber || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {student.firstName} {student.lastName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-indigo-600 font-bold">
                        {student.admissionNumber}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shadow-xs">
                          {['PRESENT', 'LATE', 'ABSENT', 'LEAVE'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(student._id, st)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                                currentStatus === st
                                  ? st === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'LATE'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : st === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-purple-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional notes"
                          value={recordsMap[student._id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
