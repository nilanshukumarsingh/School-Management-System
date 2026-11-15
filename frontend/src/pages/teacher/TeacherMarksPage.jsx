import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, Save, Calculator } from 'lucide-react';

export const TeacherMarksPage = () => {
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [exRes, asgRes] = await Promise.all([
          api.get('/exams'),
          api.get('/academics/assignments'),
        ]);
        if (exRes.success && exRes.data.length > 0) {
          setExams(exRes.data);
          setSelectedExamId(exRes.data[0]._id);
        }
        if (asgRes.success && asgRes.data.length > 0) {
          setAssignments(asgRes.data);
          setSelectedAsg(asgRes.data[0]);
        }
      } catch (err) {
        toast.error('Failed to load examination parameters');
      } finally {
        setLoading(false);
      }
    };
    fetchPrerequisites();
  }, []);

  useEffect(() => {
    const loadStudentsAndSubjects = async () => {
      if (!selectedAsg) return;
      try {
        const [studRes, subRes] = await Promise.all([
          api.get(`/students?classId=${selectedAsg.classId?._id}&sectionId=${selectedAsg.sectionId?._id}&limit=100`),
          api.get(`/academics/subjects?classId=${selectedAsg.classId?._id}`),
        ]);

        const studentList = studRes.data || [];
        const subjectList = subRes.data || [];
        setStudents(studentList);
        setSubjects(subjectList);

        if (studentList.length > 0) {
          setSelectedStudentId(studentList[0]._id);
          initMarks(subjectList);
        }
      } catch (err) {
        console.error('Failed to load student roster');
      }
    };
    loadStudentsAndSubjects();
  }, [selectedAsg]);

  const initMarks = (subList) => {
    setMarks(
      subList.map((s) => ({
        subjectId: s._id,
        name: s.name,
        code: s.code,
        marksObtained: 80,
        maxMarks: 100,
        passingMarks: 40,
      }))
    );
  };

  const handleMarkChange = (index, val) => {
    const updated = [...marks];
    updated[index].marksObtained = Number(val);
    setMarks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExamId || !selectedStudentId) return;

    setSaving(true);
    try {
      const payload = {
        examinationId: selectedExamId,
        studentId: selectedStudentId,
        marks: marks.map((m) => ({
          subjectId: m.subjectId,
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks,
          passingMarks: m.passingMarks,
        })),
      };

      const res = await api.post('/exams/marks', payload);
      toast.success(res.message || 'Marks successfully computed and recorded!');
    } catch (err) {
      toast.error(err.message || 'Error recording marks');
    } finally {
      setSaving(false);
    }
  };

  const totalObtained = marks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
  const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Examination Gradebook
          </h1>
          <p className="text-sm text-slate-500">
            Real-time percentage, GPA and letter grade calculations for enrolled students.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Save}
          isLoading={saving}
          disabled={students.length === 0}
          onClick={handleSubmit}
        >
          Compute & Save Grade
        </Button>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} ({ex.academicYear})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Class & Section
            </label>
            <select
              value={selectedAsg?._id || ''}
              onChange={(e) => {
                const found = assignments.find((a) => a._id === e.target.value);
                if (found) setSelectedAsg(found);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {assignments.map((asg) => (
                <option key={asg._id} value={asg._id}>
                  {asg.classId?.name} - Section {asg.sectionId?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Select Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                initMarks(subjects);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.admissionNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Marks Entry Table */}
      <Card className="p-0 overflow-hidden">
        {students.length === 0 ? (
          <EmptyState title="No students found in selected class" />
        ) : (
          <div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 w-36 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 w-28 text-center">Max Marks</th>
                  <th className="py-3 px-4 w-28 text-center">Passing</th>
                  <th className="py-3 px-4 w-32 text-right">Live Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marks.map((m, idx) => {
                  const isPass = m.marksObtained >= m.passingMarks;
                  return (
                    <tr key={m.subjectId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {m.name} <span className="text-slate-400 font-mono text-xs">({m.code})</span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max={m.maxMarks}
                          value={m.marksObtained}
                          onChange={(e) => handleMarkChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-center"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{m.maxMarks}</td>
                      <td className="py-3 px-4 text-center font-medium">{m.passingMarks}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={isPass ? 'success' : 'danger'} size="xs">
                          {isPass ? 'Passed' : 'Failed'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <div>
                Total Score: <span className="text-indigo-600 font-extrabold">{totalObtained}</span> /{' '}
                {totalMax}
              </div>
              <div>
                Percentage:{' '}
                <span className="text-emerald-600 font-extrabold text-sm">{percentage}%</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
