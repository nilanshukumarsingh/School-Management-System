import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { CustomSelect } from '../../components/common/CustomSelect';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '2010-01-01',
    gender: 'MALE',
    bloodGroup: 'O+',
    classId: '',
    sectionId: '',
    rollNumber: '',
    address: '',
    status: 'ENROLLED',
  });

  const toast = useToast();

  const fetchClassesAndSections = async () => {
    try {
      const [classRes, secRes] = await Promise.all([
        api.get('/academics/classes'),
        api.get('/academics/sections'),
      ]);
      if (classRes.success) setClasses(classRes.data);
      if (secRes.success) setSections(secRes.data);
    } catch (err) {
      console.error('Error fetching academic structures:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        ...(selectedClass && { classId: selectedClass }),
      });
      const res = await api.get(`/students?${params}`);
      if (res.success) {
        setStudents(res.data);
        setMeta(res.meta || { totalPages: 1, total: res.data.length });
      }
    } catch (err) {
      toast.error('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndSections();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedClass]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      admissionNumber: `ADM-2026-${Math.floor(100 + Math.random() * 900)}`,
      firstName: '',
      lastName: '',
      dateOfBirth: '2010-01-01',
      gender: 'MALE',
      bloodGroup: 'O+',
      classId: classes[0]?._id || '',
      sectionId: sections[0]?._id || '',
      rollNumber: '',
      address: '',
      status: 'ENROLLED',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      admissionNumber: student.admissionNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth?.split('T')[0] || '2010-01-01',
      gender: student.gender,
      bloodGroup: student.bloodGroup || 'UNKNOWN',
      classId: student.classId?._id || student.classId || '',
      sectionId: student.sectionId?._id || student.sectionId || '',
      rollNumber: student.rollNumber || '',
      address: student.address || '',
      status: student.status || 'ENROLLED',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData);
        toast.success('Student record updated successfully');
      } else {
        await api.post('/students', formData);
        toast.success('Student enrolled successfully');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student record deleted');
      fetchStudents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete student');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Roster</h1>
          <p className="text-sm text-slate-500">
            Admit, organize, and manage enrolled students across all academic classes.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          Admit Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or admission..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <CustomSelect
              value={selectedClass}
              onChange={(val) => {
                setSelectedClass(val);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Enrolled Classes' },
                ...classes.map((c) => ({
                  value: c._id,
                  label: `${c.name} (${c.academicYear})`,
                })),
              ]}
              placeholder="Filter by Class..."
            />
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="There are no student records matching the filter criteria."
            actionLabel="Admit New Student"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 w-36">Admission #</th>
                  <th className="py-3.5 px-4">Class & Section</th>
                  <th className="py-3.5 px-4 text-center w-20">Roll</th>
                  <th className="py-3.5 px-4 text-center w-28">Status</th>
                  <th className="py-3.5 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {student.firstName} {student.lastName}
                          </span>
                          <span className="text-xs text-slate-400">
                            DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">
                      {student.admissionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {student.classId?.name || 'Unassigned'} - Section {student.sectionId?.name || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-slate-700">
                      {student.rollNumber || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={student.status === 'ENROLLED' ? 'success' : 'neutral'}
                        size="xs"
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(student)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(student._id, `${student.firstName} ${student.lastName}`)
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total {meta.total} registered students</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="font-semibold text-slate-700">
              Page {page} of {meta.totalPages || 1}
            </span>
            <Button
              variant="secondary"
              size="xs"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Student Admission Form'}
        description="Enter the student's personal, academic, and enrollment information."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Admission Number *
              </label>
              <input
                type="text"
                required
                value={formData.admissionNumber}
                onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Roll Number
              </label>
              <input
                type="number"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <CustomSelect
              label="Gender *"
              value={formData.gender}
              onChange={(val) => setFormData({ ...formData, gender: val })}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
              placeholder="Select gender..."
            />
            <CustomSelect
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(val) => setFormData({ ...formData, bloodGroup: val })}
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'].map((bg) => ({
                value: bg,
                label: bg,
              }))}
              placeholder="Select blood group..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect
              label="Class *"
              value={formData.classId}
              onChange={(val) => setFormData({ ...formData, classId: val, sectionId: '' })}
              options={classes.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              placeholder="Select Class..."
            />
            <CustomSelect
              label="Section *"
              value={formData.sectionId}
              onChange={(val) => setFormData({ ...formData, sectionId: val })}
              options={sections
                .filter(
                  (s) =>
                    !formData.classId ||
                    s.classId?._id === formData.classId ||
                    s.classId === formData.classId
                )
                .map((s) => ({
                  value: s._id,
                  label: `Section ${s.name}`,
                }))}
              placeholder="Select Section..."
              disabled={!formData.classId}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Residential street, city"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingStudent ? 'Save Changes' : 'Confirm Admission'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
