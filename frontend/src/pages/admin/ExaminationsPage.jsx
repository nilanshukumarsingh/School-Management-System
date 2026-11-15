import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Award, Plus, Edit, Calculator, FileText, CheckCircle, Check } from 'lucide-react';

export const ExaminationsPage = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCardData, setReportCardData] = useState(null);

  // Form states
  const [examForm, setExamForm] = useState({
    name: '',
    examType: 'MIDTERM',
    academicYear: '2026-2027',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    status: 'SCHEDULED',
  });

  const [marksForm, setMarksForm] = useState({
    studentId: '',
    marks: [], // [ { subjectId, marksObtained, maxMarks: 100, passingMarks: 40 } ]
  });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [exRes, clRes, subRes] = await Promise.all([
        api.get('/exams'),
        api.get('/academics/classes'),
        api.get('/academics/subjects'),
      ]);
      if (exRes.success) {
        setExams(exRes.data);
        if (exRes.data.length > 0 && !selectedExam) {
          setSelectedExam(exRes.data[0]);
        }
      }
      if (clRes.success) setClasses(clRes.data);
      if (subRes.success) setSubjects(subRes.data);
    } catch (err) {
      toast.error('Failed to load exams: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When opening marks modal for an exam
  const handleOpenMarksModal = async (exam) => {
    setSelectedExam(exam);
    try {
      const studRes = await api.get('/students?limit=100');
      if (studRes.success) {
        setStudents(studRes.data);
        if (studRes.data.length > 0) {
          initMarksForStudent(studRes.data[0]._id);
        }
      }
      setIsMarksModalOpen(true);
    } catch (err) {
      toast.error('Failed to prepare marks entry form');
    }
  };

  const initMarksForStudent = (studentId) => {
    // Populate subjects list with default 100 maxMarks
    const marksList = subjects.map((sub) => ({
      subjectId: sub._id,
      subjectName: sub.name,
      code: sub.code,
      marksObtained: 85,
      maxMarks: 100,
      passingMarks: 40,
    }));
    setMarksForm({ studentId, marks: marksList });
  };

  const handleMarksFieldChange = (index, field, value) => {
    const updated = [...marksForm.marks];
    updated[index][field] = Number(value);
    setMarksForm({ ...marksForm, marks: updated });
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;

    try {
      const payload = {
        examinationId: selectedExam._id,
        studentId: marksForm.studentId,
        marks: marksForm.marks.map((m) => ({
          subjectId: m.subjectId,
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks,
          passingMarks: m.passingMarks,
        })),
      };

      const res = await api.post('/exams/marks', payload);
      toast.success(res.message || 'Marks recorded and grades calculated!');
      setIsMarksModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit marks');
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', examForm);
      toast.success('Examination created');
      setIsExamModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewReportCard = async (studentId) => {
    try {
      const res = await api.get(`/exams/report-card/${studentId}`);
      if (res.success && res.data.length > 0) {
        setReportCardData(res.data[0]);
        setIsReportModalOpen(true);
      } else {
        toast.info('No exam result found for this student yet.');
      }
    } catch (err) {
      toast.error('Failed to load report card');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Examinations & Academic Grading
          </h1>
          <p className="text-sm text-slate-500">
            Define institutional exams, configure grading curves, and compute report cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Calculator}
            onClick={() => handleOpenMarksModal(exams[0])}
            disabled={exams.length === 0}
          >
            Enter Student Marks
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsExamModalOpen(true)}
          >
            Create Examination
          </Button>
        </div>
      </div>

      {/* Examinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam._id} hover className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{exam.name}</h3>
                  <span className="text-xs text-slate-400">Term: {exam.academicYear}</span>
                </div>
                <Badge
                  variant={
                    exam.status === 'PUBLISHED'
                      ? 'success'
                      : exam.status === 'ONGOING'
                      ? 'primary'
                      : 'neutral'
                  }
                  size="xs"
                >
                  {exam.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Exam Type:</span>
                  <strong className="text-slate-800">{exam.examType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Start Date:</span>
                  <span>{new Date(exam.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">End Date:</span>
                  <span>{new Date(exam.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Grading Scale:</span>
                  <span>A+ (90-100), A (80-89), B (70-79)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="xs"
                icon={Calculator}
                onClick={() => handleOpenMarksModal(exam)}
              >
                Record Marks
              </Button>
              <Button
                variant="secondary"
                size="xs"
                icon={FileText}
                onClick={() => handleViewReportCard(students[0]?._id || 'demo')}
              >
                Sample Report Card
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Enter Marks Modal (Acceptance Criteria #3) */}
      <Modal
        isOpen={isMarksModalOpen}
        onClose={() => setIsMarksModalOpen(false)}
        title={`Enter Marks - ${selectedExam?.name || 'Examination'}`}
        description="Grades, percentages, GPA and pass/fail statuses are calculated automatically."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveMarks} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Select Student *
            </label>
            <select
              required
              value={marksForm.studentId}
              onChange={(e) => {
                initMarksForStudent(e.target.value);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.admissionNumber} - {s.classId?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3 w-28">Marks Obtained</th>
                  <th className="p-3 w-24">Max Marks</th>
                  <th className="p-3 w-24">Pass Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marksForm.marks.map((m, idx) => (
                  <tr key={m.subjectId}>
                    <td className="p-3 font-semibold text-slate-800">
                      {m.subjectName} <span className="text-slate-400">({m.code})</span>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        max={m.maxMarks}
                        required
                        value={m.marksObtained}
                        onChange={(e) => handleMarksFieldChange(idx, 'marksObtained', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </td>
                    <td className="p-3 text-center text-slate-500 font-medium">{m.maxMarks}</td>
                    <td className="p-3 text-center text-slate-500 font-medium">{m.passingMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Real-time Calculated Preview */}
          {marksForm.marks.length > 0 && (
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <div>
                <strong>Total Score:</strong>{' '}
                {marksForm.marks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0)} /{' '}
                {marksForm.marks.reduce((sum, m) => sum + m.maxMarks, 0)}
              </div>
              <div>
                <strong>Percentage:</strong>{' '}
                {(
                  (marksForm.marks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0) /
                    (marksForm.marks.reduce((sum, m) => sum + m.maxMarks, 0) || 1)) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsMarksModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Calculate & Save Result
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Schedule New Examination"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Examination Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Final Semester Examination 2027"
              value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Exam Type
              </label>
              <select
                value={examForm.examType}
                onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={examForm.academicYear}
                onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsExamModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Schedule Exam
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Card Viewer Modal */}
      {reportCardData && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Student Official Report Card"
          description={`${reportCardData.studentId?.firstName} ${reportCardData.studentId?.lastName} • ${reportCardData.examinationId?.name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Admission Number:</span>
                <span className="font-bold text-slate-800">
                  {reportCardData.studentId?.admissionNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Overall Percentage:</span>
                <span className="font-extrabold text-indigo-600 text-sm">
                  {reportCardData.percentage}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Grade Awarded:</span>
                <Badge variant="purple" size="md">
                  {reportCardData.grade} (GPA {reportCardData.gpa})
                </Badge>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {reportCardData.marks?.map((m, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {m.subjectId?.name || 'Subject'}
                    </span>
                    <span className="text-slate-400">Code: {m.subjectId?.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {m.marksObtained} / {m.maxMarks}
                    </span>
                    <Badge variant={m.isPassed ? 'success' : 'danger'} size="xs">
                      {m.isPassed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="secondary" size="sm" onClick={() => setIsReportModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
