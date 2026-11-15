import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { BookOpen, Plus, Trash2, Users, School, Layers, CheckCircle } from 'lucide-react';

export const AcademicsPage = () => {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'subjects' | 'assignments'
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Forms
  const [classForm, setClassForm] = useState({
    name: '',
    gradeLevel: '10',
    academicYear: '2026-2027',
    description: '',
  });

  const [sectionForm, setSectionForm] = useState({
    name: '',
    classId: '',
    roomNumber: '',
    capacity: 40,
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    classId: '',
    credits: 3,
    description: '',
  });

  const [assignForm, setAssignForm] = useState({
    teacherId: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    isClassTeacher: false,
    academicYear: '2026-2027',
  });

  const toast = useToast();

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cls, sec, sub, tch, asg] = await Promise.all([
        api.get('/academics/classes'),
        api.get('/academics/sections'),
        api.get('/academics/subjects'),
        api.get('/teachers'),
        api.get('/academics/assignments'),
      ]);
      if (cls.success) setClasses(cls.data);
      if (sec.success) setSections(sec.data);
      if (sub.success) setSubjects(sub.data);
      if (tch.success) setTeachers(tch.data);
      if (asg.success) setAssignments(asg.data);
    } catch (err) {
      toast.error('Failed to load academic entities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Handlers
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academics/classes', classForm);
      toast.success('Class created successfully');
      setIsClassModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academics/sections', sectionForm);
      toast.success('Section created successfully');
      setIsSectionModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academics/subjects', subjectForm);
      toast.success('Subject created successfully');
      setIsSubjectModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academics/assignments', assignForm);
      toast.success('Teacher assigned successfully');
      setIsAssignModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Remove this teacher assignment?')) return;
    try {
      await api.delete(`/academics/assignments/${id}`);
      toast.success('Assignment removed');
      loadAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Architecture</h1>
          <p className="text-sm text-slate-500">
            Define grade levels, classroom sections, subject curriculums, and faculty assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'classes' && (
            <>
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsSectionModalOpen(true)}>
                Add Section
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsClassModalOpen(true)}>
                New Class
              </Button>
            </>
          )}
          {activeTab === 'subjects' && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsSubjectModalOpen(true)}>
              New Subject
            </Button>
          )}
          {activeTab === 'assignments' && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAssignModalOpen(true)}>
              Assign Teacher
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'classes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" /> Classes & Sections ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Subjects ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${
            activeTab === 'assignments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Teacher Assignments ({assignments.length})
        </button>
      </div>

      {/* TAB 1: Classes & Sections */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => {
            const classSections = sections.filter((s) => s.classId?._id === c._id || s.classId === c._id);
            return (
              <Card key={c._id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                      <span className="text-xs text-slate-400">Academic Year: {c.academicYear}</span>
                    </div>
                    <Badge variant="primary" size="xs">
                      Grade {c.gradeLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{c.description || 'General program'}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Sections ({classSections.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {classSections.length > 0 ? (
                        classSections.map((s) => (
                          <div
                            key={s._id}
                            className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200"
                          >
                            Sec {s.name} • {s.roomNumber || 'Room N/A'}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No sections created yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: Subjects */}
      {activeTab === 'subjects' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Credits</th>
                  <th className="py-3.5 px-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">{s.code}</td>
                    <td className="py-3.5 px-4">{s.classId?.name || 'All'}</td>
                    <td className="py-3.5 px-4 font-medium">{s.credits} Credits</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={s.isElective ? 'warning' : 'neutral'} size="xs">
                        {s.isElective ? 'Elective' : 'Core Required'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Teacher Assignments */}
      {activeTab === 'assignments' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Teacher</th>
                  <th className="py-3.5 px-4">Class & Section</th>
                  <th className="py-3.5 px-4">Assigned Subject</th>
                  <th className="py-3.5 px-4">Class Teacher?</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asg) => (
                  <tr key={asg._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {asg.teacherId?.userId?.name || asg.teacherId?.employeeId}
                        </span>
                        <span className="text-xs text-slate-400">({asg.teacherId?.employeeId})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {asg.classId?.name} - Section {asg.sectionId?.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {asg.subjectId ? (
                        <span className="font-semibold text-indigo-600">
                          {asg.subjectId.name} ({asg.subjectId.code})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Homeroom Only</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={asg.isClassTeacher ? 'purple' : 'neutral'} size="xs">
                        {asg.isClassTeacher ? 'Class Teacher' : 'Subject Faculty'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(asg._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Create Academic Class"
        description="Add a new class or grade level."
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Class Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grade 11"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Grade Level (1-12) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="12"
                value={classForm.gradeLevel}
                onChange={(e) => setClassForm({ ...classForm, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                required
                value={classForm.academicYear}
                onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Section Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title="Create Section"
        description="Add a section to a specific class."
      >
        <form onSubmit={handleCreateSection} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Class *</label>
            <select
              required
              value={sectionForm.classId}
              onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Section Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. C"
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Room Number
              </label>
              <input
                type="text"
                placeholder="e.g. Room 402"
                value={sectionForm.roomNumber}
                onChange={(e) => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Section
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Subject to Curriculum"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Biology"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BIO101"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Class *</label>
            <select
              required
              value={subjectForm.classId}
              onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Teacher to Class & Subject"
        description="Enforces teacher access boundaries."
      >
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Teacher *</label>
            <select
              required
              value={assignForm.teacherId}
              onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.userId?.name} ({t.employeeId} - {t.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Class *</label>
              <select
                required
                value={assignForm.classId}
                onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Section *</label>
              <select
                required
                value={assignForm.sectionId}
                onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Section</option>
                {sections
                  .filter((s) => !assignForm.classId || s.classId?._id === assignForm.classId || s.classId === assignForm.classId)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      Section {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Subject (Optional for Homeroom)
            </label>
            <select
              value={assignForm.subjectId}
              onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">No specific subject (Class Teacher Only)</option>
              {subjects
                .filter((sub) => !assignForm.classId || sub.classId?._id === assignForm.classId || sub.classId === assignForm.classId)
                .map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isClassTeacher"
              checked={assignForm.isClassTeacher}
              onChange={(e) => setAssignForm({ ...assignForm, isClassTeacher: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="isClassTeacher" className="text-xs font-medium text-slate-700">
              Set as designated Class Teacher for this section
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
