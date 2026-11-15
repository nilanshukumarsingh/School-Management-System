import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CalendarCheck, Save, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('FULL_DAY');
  const [overwriteIfDuplicate, setOverwriteIfDuplicate] = useState(false);

  const [students, setStudents] = useState([]);
  const [recordsMap, setRecordsMap] = useState({}); // { studentId: { status, remarks } }
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/academics/classes'),
          api.get('/academics/sections'),
        ]);
        if (cRes.success && cRes.data.length > 0) {
          setClasses(cRes.data);
          setSelectedClass(cRes.data[0]._id);
        }
        if (sRes.success) {
          setSections(sRes.data);
          const firstSec = sRes.data.find((s) => s.classId?._id === cRes.data[0]?._id);
          if (firstSec) setSelectedSection(firstSec._id);
        }
      } catch (err) {
        toast.error('Failed to load academic classes');
      }
    };
    fetchStructures();
  }, []);

  const loadAttendance = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      // 1. Fetch students belonging to this class & section
      const studRes = await api.get(
        `/students?classId=${selectedClass}${selectedSection ? `&sectionId=${selectedSection}` : ''}&limit=100`
      );
      const studentList = studRes.data || [];
      setStudents(studentList);

      // 2. Fetch existing attendance for this class, section, date, session
      const attRes = await api.get(
        `/attendance/class?classId=${selectedClass}${selectedSection ? `&sectionId=${selectedSection}` : ''}&date=${date}&session=${session}`
      );

      const existingRecords = attRes.data?.records || [];
      setSummary(attRes.data?.summary || null);

      // Pre-fill records map
      const initialMap = {};
      studentList.forEach((s) => {
        const existing = existingRecords.find((r) => r.studentId?._id === s._id || r.studentId === s._id);
        initialMap[s._id] = {
          status: existing ? existing.status : 'PRESENT',
          remarks: existing?.remarks || '',
        };
      });
      setRecordsMap(initialMap);
    } catch (err) {
      toast.error(err.message || 'Error loading attendance roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadAttendance();
    }
  }, [selectedClass, selectedSection, date, session]);

  const handleStatusChange = (studentId, status) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = {
        ...recordsMap[s._id],
        status,
      };
    });
    setRecordsMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: recordsMap[s._id]?.status || 'PRESENT',
        remarks: recordsMap[s._id]?.remarks || '',
      }));

      const payload = {
        classId: selectedClass,
        sectionId: selectedSection || sections.find((s) => s.classId?._id === selectedClass)?._id,
        date,
        session,
        records,
        overwriteIfDuplicate,
      };

      const res = await api.post('/attendance/mark', payload);
      toast.success(res.message || 'Attendance saved successfully!');
      loadAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance Operations
          </h1>
          <p className="text-sm text-slate-500">
            Daily attendance recording protected by MongoDB compound unique index.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={Save}
            isLoading={saving}
            disabled={students.length === 0}
            onClick={handleSaveAttendance}
          >
            Commit Attendance
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const firstSec = sections.find((s) => s.classId?._id === e.target.value);
                if (firstSec) setSelectedSection(firstSec._id);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.academicYear})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {sections
                .filter((s) => s.classId?._id === selectedClass || s.classId === selectedClass)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    Section {s.name} ({s.roomNumber || 'Room N/A'})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="FULL_DAY">Full Day</option>
              <option value="MORNING">Morning Session</option>
              <option value="AFTERNOON">Afternoon Session</option>
            </select>
          </div>
        </div>

        {/* Duplicate Overwrite Guard Toggle (Acceptance Test #2) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={overwriteIfDuplicate}
              onChange={(e) => setOverwriteIfDuplicate(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>
              <strong>Overwrite if record exists</strong> (If unchecked, database unique constraint
              will reject duplicate submissions with 409 Conflict)
            </span>
          </label>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 font-semibold mr-1">Quick Mark All:</span>
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="px-2 py-1 rounded bg-rose-100 text-rose-800 font-bold hover:bg-rose-200"
            >
              All Absent
            </button>
          </div>
        </div>
      </Card>

      {/* Summary Stats Banner if exists */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Students</span>
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
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Attendance %</span>
            <span className="text-xl font-bold text-indigo-700 block">{summary.percentage}%</span>
          </div>
        </div>
      )}

      {/* Students Attendance Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading student roster...</div>
        ) : students.length === 0 ? (
          <EmptyState
            title="No students enrolled in this section"
            description="Assign students to this class & section to begin recording attendance."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Roll</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Admission #</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const currentStatus = recordsMap[student._id]?.status || 'PRESENT';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-xs">
                        {student.rollNumber || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {student.firstName} {student.lastName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-indigo-600">
                        {student.admissionNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
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
                          placeholder="Optional notes (e.g. Bus delay)"
                          value={recordsMap[student._id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
