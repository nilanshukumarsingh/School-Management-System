import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, Printer } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const GuardianReportCardsPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [results, setResults] = useState([]);
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
    const fetchReportCards = async () => {
      if (!selectedStudentId) return;
      try {
        const res = await api.get(`/exams/report-card/${selectedStudentId}`);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Failed to load report cards');
      }
    };
    fetchReportCards();
  }, [selectedStudentId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Academic Report Cards
          </h1>
          <p className="text-sm text-slate-500">
            Acceptance Test #4: Complete examination results for authorized linked children.
          </p>
        </div>
        <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
          Print Report Card
        </Button>
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

      {results.length === 0 ? (
        <EmptyState title="No published exam results found for this student" />
      ) : (
        results.map((result) => (
          <Card key={result._id} className="p-6 space-y-6">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
                  Official Statement of Results
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {result.examinationId?.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Student: {result.studentId?.firstName} {result.studentId?.lastName} (
                  {result.studentId?.admissionNumber}) • {result.classId?.name} - Section{' '}
                  {result.sectionId?.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block uppercase font-bold">Overall</span>
                  <span className="text-2xl font-black text-slate-900">{result.percentage}%</span>
                </div>
                <Badge variant="purple" size="md" className="text-base px-3 py-1">
                  Grade {result.grade}
                </Badge>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 font-mono text-center">Score</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Passing</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.marks?.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {m.subjectId?.name || 'Subject'}{' '}
                        <span className="text-slate-400 font-mono text-xs">
                          ({m.subjectId?.code})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-center text-slate-900">
                        {m.marksObtained}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">{m.maxMarks}</td>
                      <td className="py-3 px-4 text-center text-slate-500">{m.passingMarks}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={m.isPassed ? 'success' : 'danger'} size="xs">
                          {m.isPassed ? 'Passed' : 'Remedial'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex gap-4">
                <span>
                  Total Score: <strong>{result.totalObtained}</strong> / {result.totalMaxMarks}
                </span>
                <span>
                  GPA Awarded: <strong>{result.gpa} / 4.0</strong>
                </span>
              </div>
              <Badge variant={result.status === 'PASS' ? 'success' : 'danger'} size="md">
                Final Result: {result.status}
              </Badge>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
