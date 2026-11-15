import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
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

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard/admin');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const counts = data?.counts || {};
  const attendance = data?.attendance || {};
  const finance = data?.finance || {};
  const monthlyTrend = finance?.monthlyTrend || [];
  const statusBreakdown = attendance?.statusBreakdown || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Institutional Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome to the central command dashboard of ScholaVerse Academy.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={counts.totalStudents ?? 0}
          trend={8.4}
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Teaching Staff"
          value={counts.totalTeachers ?? 0}
          trend={0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Today Attendance"
          value={`${attendance.percentage ?? 0}%`}
          trend={2.1}
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Fee Collections"
          value={`$${(finance.totalCollected ?? 0).toLocaleString()}`}
          trend={12.5}
          icon={CreditCard}
          color="amber"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Fee Collection Trend Bar Chart */}
        <Card className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Fee Collection & Receivables</h3>
              <p className="text-xs text-slate-500">Collected vs Outstanding by Month</p>
            </div>
            <Badge variant="primary" size="xs">
              Reconciled Ledger
            </Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="collected" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Collected ($)" />
                <Bar dataKey="pending" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Pending ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attendance Breakdown Donut Chart */}
        <Card className="lg:col-span-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Attendance Distribution</h3>
              <p className="text-xs text-slate-500">Status ratio across today's sessions</p>
            </div>
            <Badge variant="success" size="xs">
              Unique Index
            </Badge>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Activity Streams Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Payment Ledger</h3>
            <span className="text-xs text-slate-400">Latest 5 Transactions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.recentPayments?.length > 0 ? (
              data.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {p.studentId?.firstName} {p.studentId?.lastName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {p.receiptNumber} • {p.paymentMethod}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">+${p.amountPaid}</span>
                    <Badge variant="success" size="xs">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No transactions recorded yet</p>
            )}
          </div>
        </Card>

        {/* Recent Audit Logs */}
        <Card className="lg:col-span-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">System Audit Trail</h3>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100">
            {data?.recentAuditLogs?.length > 0 ? (
              data.recentAuditLogs.map((log) => (
                <div key={log._id} className="py-3 flex items-start justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <Badge variant="neutral" size="xs">
                        {log.module}
                      </Badge>
                    </div>
                    <span className="text-slate-500 block">
                      Performed by <strong className="text-slate-700">{log.userName}</strong> (
                      {log.userRole})
                    </span>
                  </div>
                  <span className="text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No recent audit logs</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
