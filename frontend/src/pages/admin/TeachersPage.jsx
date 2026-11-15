import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, Plus, Search, Edit, Trash2 } from 'lucide-react';

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Teacher@123',
    phone: '',
    employeeId: '',
    designation: 'Faculty',
    qualification: 'M.Sc, B.Ed',
    specialization: '',
    availabilityStatus: 'AVAILABLE',
  });

  const toast = useToast();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teachers?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setTeachers(res.data);
      }
    } catch (err) {
      toast.error('Failed to load teachers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      password: 'Teacher@123',
      phone: '',
      employeeId: `EMP-T-${Math.floor(100 + Math.random() * 900)}`,
      designation: 'Faculty',
      qualification: 'M.Sc, B.Ed',
      specialization: '',
      availabilityStatus: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTeacher(t);
    setFormData({
      name: t.userId?.name || '',
      email: t.userId?.email || '',
      password: '',
      phone: t.contactPhone || t.userId?.phone || '',
      employeeId: t.employeeId,
      designation: t.designation,
      qualification: t.qualification,
      specialization: t.specialization || '',
      availabilityStatus: t.availabilityStatus || 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher._id}`, formData);
        toast.success('Teacher profile updated');
      } else {
        await api.post('/teachers', formData);
        toast.success('Teacher created and user account activated');
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove teacher "${name}"?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher removed');
      fetchTeachers();
    } catch (err) {
      toast.error(err.message || 'Failed to remove teacher');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty & Teachers</h1>
          <p className="text-sm text-slate-500">
            Manage instructional staff, subject specializations, and departmental designations.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Faculty Member
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, employee ID, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : teachers.length === 0 ? (
          <EmptyState
            title="No teachers found"
            description="No faculty records match the query."
            actionLabel="Add Teacher"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Designation & Qualification</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            t.userId?.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${t.employeeId}`
                          }
                          alt="Avatar"
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {t.userId?.name || 'Unnamed'}
                          </span>
                          <span className="text-xs text-slate-400">{t.userId?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-600">
                      {t.employeeId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{t.designation}</span>
                      <span className="text-xs text-slate-400">{t.qualification}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {t.specialization || 'General'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={t.availabilityStatus === 'AVAILABLE' ? 'success' : 'warning'}
                        size="xs"
                      >
                        {t.availabilityStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id, t.userId?.name)}
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
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Edit Faculty Profile' : 'Register New Faculty Member'}
        description="Creates credentials and academic profile for instructor."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                required
                disabled={!!editingTeacher}
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            {!editingTeacher && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Default Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}
            {editingTeacher && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Qualification *
              </label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Mathematics & Calculus"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Availability Status
              </label>
              <select
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="BUSY">Busy</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingTeacher ? 'Update Profile' : 'Register Faculty'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
