import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { BookOpen, Users, CalendarCheck, Award, ArrowRight } from 'lucide-react';

export const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard/teacher');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const teacher = data?.teacher || {};
  const assignments = data?.assignments || [];
  const attendance = data?.attendance || {};
  const exams = data?.upcomingExams || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Faculty Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, <strong>{teacher.name}</strong> • {teacher.designation} (
            {teacher.employeeId})
          </p>
        </div>
        <Link to="/teacher/attendance">
          <Button variant="primary" icon={CalendarCheck}>
            Mark Today's Attendance
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Assigned Classes"
          value={data?.assignedClassesCount ?? 0}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Enrolled Students"
          value={data?.totalStudents ?? 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Today's Attendance Rate"
          value={`${attendance.percentage ?? 0}%`}
          trend={0}
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {/* Assigned Classes Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">My Assigned Classes & Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((asg) => (
            <Card key={asg._id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    {asg.classId?.name} - Section {asg.sectionId?.name}
                  </h3>
                  <Badge variant={asg.isClassTeacher ? 'purple' : 'primary'} size="xs">
                    {asg.isClassTeacher ? 'Class Teacher' : 'Subject Faculty'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Room: {asg.sectionId?.roomNumber || 'N/A'} • {asg.academicYear}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">
                    Subject Assignment:
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {asg.subjectId ? asg.subjectId.name : 'Homeroom Duties'}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link to="/teacher/attendance">
                  <Button variant="outline" size="xs">
                    Attendance
                  </Button>
                </Link>
                <Link to="/teacher/marks">
                  <Button variant="secondary" size="xs">
                    Enter Marks
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Exams Row */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Upcoming Academic Examinations</h3>
          <Award className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="divide-y divide-slate-100">
          {exams.map((ex) => (
            <div key={ex._id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block text-sm">{ex.name}</span>
                <span className="text-slate-400">
                  {new Date(ex.startDate).toLocaleDateString()} to{' '}
                  {new Date(ex.endDate).toLocaleDateString()}
                </span>
              </div>
              <Badge variant="primary" size="xs">
                {ex.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
