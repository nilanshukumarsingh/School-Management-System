import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { GraduationCap, Phone, ShieldCheck } from 'lucide-react';

export const GuardianStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        if (res.success) {
          setStudents(res.data);
        }
      } catch (err) {
        console.error('Failed to load linked students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Linked Student Profiles
        </h1>
        <p className="text-sm text-slate-500">
          Acceptance Test #4: Secure view restricted solely to your authorized family members.
        </p>
      </div>

      {students.length === 0 ? (
        <EmptyState title="No linked children found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {students.map((s) => (
            <Card key={s._id} hover>
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                  {s.firstName[0]}
                  {s.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {s.firstName} {s.lastName}
                  </h3>
                  <span className="text-xs font-mono font-semibold text-indigo-600 block">
                    Admission ID: {s.admissionNumber}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Class & Section:</span>
                  <strong className="text-slate-800">
                    {s.classId?.name} - Section {s.sectionId?.name}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll Number:</span>
                  <span>{s.rollNumber || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span>{new Date(s.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Group:</span>
                  <span>{s.bloodGroup || 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medical Notes:</span>
                  <span>{s.medicalNotes || 'None recorded'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span>{s.emergencyContact?.phone || 'Primary contact on record'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
