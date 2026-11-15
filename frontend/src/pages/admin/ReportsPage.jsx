import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Download, BarChart3, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    const loadAcademicReport = async () => {
      if (!selectedExam) return;
      setLoading(true);
      try {
        const res = await api.get(`/reports/academic?examinationId=${selectedExam}`);
        if (res.success) {
          setReportData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load reports: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAcademicReport();
  }, [selectedExam]);

  const exportCSV = () => {
    if (!reportData?.results || reportData.results.length === 0) {
      toast.info('No data available to export.');
      return;
    }

    const headers = ['Student ID', 'Student Name', 'Class', 'Percentage', 'Grade', 'Status'];
    const rows = reportData.results.map((r) => [
      r.studentId?.admissionNumber || '',
      `"${r.studentId?.firstName || ''} ${r.studentId?.lastName || ''}"`,
      `"${r.classId?.name || ''}"`,
      r.percentage,
      r.grade,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ScholaVerse_Academic_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report successfully exported to CSV!');
  };

  const gradeDist = reportData?.gradeDistribution || {};
  const chartData = Object.keys(gradeDist).map((grade) => ({
    grade,
    count: gradeDist[grade] || 0,
  }));

  const pieData = [
    { name: 'Passed', value: reportData?.summary?.passed || 0, color: '#10B981' },
    { name: 'Failed', value: reportData?.summary?.failed || 0, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Reports & Institutional Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Exportable performance metrics and grade distributions across examination cohorts.
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCSV}>
          Export CSV Ledger
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-700">Select Exam Cohort:</label>
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

      {/* Summary KPI row */}
      {reportData?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <span className="text-xs font-bold uppercase text-slate-400">Total Students</span>
            <span className="text-2xl font-extrabold text-slate-900 block mt-1">
              {reportData.summary.total}
            </span>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs font-bold uppercase text-slate-400">Passing Rate</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">
              {reportData.summary.passPercentage}%
            </span>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs font-bold uppercase text-slate-400">Passed Students</span>
            <span className="text-2xl font-extrabold text-indigo-600 block mt-1">
              {reportData.summary.passed}
            </span>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs font-bold uppercase text-slate-400">Remedial/Failed</span>
            <span className="text-2xl font-extrabold text-rose-600 block mt-1">
              {reportData.summary.failed}
            </span>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <h3 className="text-base font-bold text-slate-900 mb-4">Letter Grade Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="grade" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold text-slate-900 mb-2 self-start">Cohort Pass Ratio</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
