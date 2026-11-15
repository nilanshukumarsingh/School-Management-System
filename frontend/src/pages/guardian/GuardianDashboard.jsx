import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { GraduationCap, CalendarCheck, Award, CreditCard, ArrowRight, UserCheck } from 'lucide-react';

export const GuardianDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard/guardian');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load guardian dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const guardian = data?.guardian || {};
  const children = data?.children || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Parent & Guardian Portal
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome, <strong>{guardian.name}</strong> • Linked to {children.length} student(s) with
          strict family privacy and verified data security.
        </p>
      </div>

      {/* Children Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((childOverview) => {
          const student = childOverview.student;
          const att = childOverview.attendance;
          const fees = childOverview.fees;
          const results = childOverview.recentResults || [];

          return (
            <Card key={student._id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-base shadow-sm">
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {student.classId?.name} - Section {student.sectionId?.name} • Roll #
                        {student.rollNumber || '1'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" size="xs">
                    {student.status}
                  </Badge>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Attendance Rate
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">
                      {att.percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {att.present} of {att.total} days present
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Outstanding Fee
                    </span>
                    <span
                      className={`text-xl font-extrabold block mt-0.5 ${
                        fees.totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      ${fees.totalDue}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {fees.totalDue > 0 ? 'Pending invoice' : 'All cleared'}
                    </span>
                  </div>
                </div>

                {/* Latest Exam Snapshot */}
                <div className="border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1.5">
                    Latest Examination Result:
                  </span>
                  {results.length > 0 ? (
                    <div className="flex items-center justify-between bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {results[0].examinationId?.name}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Score: {results[0].percentage}%
                        </span>
                      </div>
                      <Badge variant="purple" size="sm">
                        Grade {results[0].grade} (GPA {results[0].gpa})
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No exams recorded yet</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link to="/guardian/attendance">
                  <Button variant="outline" size="xs">
                    Attendance History
                  </Button>
                </Link>
                <Link to="/guardian/report-cards">
                  <Button variant="secondary" size="xs">
                    View Report Card
                  </Button>
                </Link>
                <Link to="/guardian/fees">
                  <Button variant="primary" size="xs">
                    Pay Fees
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
