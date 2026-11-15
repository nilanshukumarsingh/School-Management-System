import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { BookOpen, Users } from 'lucide-react';

export const TeacherClassesPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const asgRes = await api.get('/academics/assignments');
        if (asgRes.success) {
          setAssignments(asgRes.data);
          if (asgRes.data.length > 0) {
            setSelectedClassId(asgRes.data[0].classId?._id);
          }
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchStudentsForClass = async () => {
      if (!selectedClassId) return;
      try {
        const res = await api.get(`/students?classId=${selectedClassId}&limit=100`);
        if (res.success) {
          setStudents(res.data);
        }
      } catch (err) {
        console.error('Failed to load students');
      }
    };
    fetchStudentsForClass();
  }, [selectedClassId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Authorized Classes & Students
        </h1>
        <p className="text-sm text-slate-500">
          Scoped classroom and student roster for assigned sections.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {assignments.map((asg) => (
          <button
            key={asg._id}
            onClick={() => setSelectedClassId(asg.classId?._id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
              selectedClassId === asg.classId?._id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {asg.classId?.name} - Sec {asg.sectionId?.name} ({asg.subjectId?.name || 'Class Teacher'})
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Enrolled Class Students ({students.length})
          </h3>
          <Badge variant="primary" size="xs">
            Assigned Scope
          </Badge>
        </div>

        {students.length === 0 ? (
          <EmptyState title="No students found in this assigned class" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-20 text-center">Roll</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 w-36">Admission #</th>
                  <th className="py-3 px-4 w-28 text-center">Gender</th>
                  <th className="py-3 px-4 w-64">Emergency Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-center font-mono font-bold text-xs text-slate-700">{s.rollNumber || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-indigo-600">{s.admissionNumber}</td>
                    <td className="py-3 px-4 text-center text-xs font-medium">{s.gender}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {s.emergencyContact?.name ? `${s.emergencyContact.name} (${s.emergencyContact.phone})` : 'Parent on file'}
                    </td>
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
