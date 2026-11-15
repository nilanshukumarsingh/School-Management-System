import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { BarChart3 } from 'lucide-react';

export const TeacherReportsPage = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        if (res.success && res.data.length > 0) {
          setExams(res.data);
          setSelectedExam(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    const fetchClassResults = async () => {
      if (!selectedExam) return;
      try {
        const res = await api.get(`/exams/class-results?examinationId=${selectedExam}`);
        if (res.success) {
          setResultsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load class exam results');
      }
    };
    fetchClassResults();
  }, [selectedExam]);

  const summary = resultsData?.summary || {};
  const results = resultsData?.results || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Class Academic Performance
        </h1>
        <p className="text-sm text-slate-500">
          Cohort exam summaries, percentages, and performance rank list.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-700">Select Exam:</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full sm:w-72 py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.name} ({ex.academicYear})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Total Assessed</span>
          <span className="text-2xl font-extrabold text-slate-900 block mt-1">
            {summary.totalStudents ?? 0}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Class Average</span>
          <span className="text-2xl font-extrabold text-indigo-600 block mt-1">
            {summary.classAvgPercentage ?? 0}%
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Passed</span>
          <span className="text-2xl font-extrabold text-emerald-600 block mt-1">
            {summary.passedCount ?? 0}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs font-bold uppercase text-slate-400">Remedial/Failed</span>
          <span className="text-2xl font-extrabold text-rose-600 block mt-1">
            {summary.failedCount ?? 0}
          </span>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank / Student</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Total Score</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r, idx) => (
                <tr key={r._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {r.studentId?.firstName} {r.studentId?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-indigo-600">
                    {r.studentId?.admissionNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {r.totalObtained} / {r.totalMaxMarks}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.percentage}%</td>
                  <td className="py-3 px-4 font-extrabold text-indigo-600">{r.grade}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={r.status === 'PASS' ? 'success' : 'danger'} size="xs">
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
