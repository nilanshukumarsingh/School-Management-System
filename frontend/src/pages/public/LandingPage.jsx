import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';
import {
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  Check,
  Lock,
  ChevronRight,
  Database,
  CreditCard,
  Award,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const LandingPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Active tab in the Hero Interactive Console Mockup
  const [consoleTab, setConsoleTab] = useState('faculty');

  // Interactive Attendance State inside the Faculty Mockup preview
  const [mockAttendance, setMockAttendance] = useState([
    { id: 'STU-001', name: 'Lucas Vance', roll: '10A-01', status: 'PRESENT' },
    { id: 'STU-002', name: 'Sophia Vance', roll: '10A-02', status: 'PRESENT' },
    { id: 'STU-003', name: 'Alexander Rostov', roll: '10A-03', status: 'LATE' },
    { id: 'STU-004', name: 'Maya Lin', roll: '10A-04', status: 'PRESENT' },
  ]);

  // Selected role tab for the Deep Dive section
  const [activeRoleTab, setActiveRoleTab] = useState('admin');

  // Quick 1-click login handler
  const handleQuickDemoLogin = async (email, password, role) => {
    try {
      toast.info(`Authenticating as ${role}...`);
      const { user: loggedInUser } = await login(email, password);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      if (loggedInUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (loggedInUser.role === 'TEACHER') navigate('/teacher/dashboard');
      else if (loggedInUser.role === 'GUARDIAN') navigate('/guardian/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    }
  };

  // Toggle status inside the interactive hero preview
  const handleToggleMockStatus = (studentId, newStatus) => {
    setMockAttendance((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  // Calculate live stats for the interactive hero mockup
  const presentCount = mockAttendance.filter((s) => s.status === 'PRESENT').length;
  const lateCount = mockAttendance.filter((s) => s.status === 'LATE').length;
  const absentCount = mockAttendance.filter((s) => s.status === 'ABSENT').length;
  const liveAttendanceRate = Math.round(
    ((presentCount + lateCount * 0.5) / mockAttendance.length) * 100
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Subtle Background Mesh & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-indigo-100/60 via-purple-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Glassmorphic Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Version Pill */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <Logo size="md" showText={true} textVariant="dark" subtitle="Academy OS" />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-[11px] font-mono font-bold text-indigo-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v2.4 Production
            </span>
          </div>

          {/* Center Segmented Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60 text-xs font-bold text-slate-600">
            <a href="#console-preview" className="px-3 py-1.5 rounded-full hover:text-indigo-600 hover:bg-white transition shadow-2xs">
              Live Console
            </a>
            <a href="#architecture" className="px-3 py-1.5 rounded-full hover:text-indigo-600 hover:bg-white transition shadow-2xs">
              Integrity Engine
            </a>
            <a href="#roles-matrix" className="px-3 py-1.5 rounded-full hover:text-indigo-600 hover:bg-white transition shadow-2xs">
              Role Matrix
            </a>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full flex items-center gap-1 hover:text-indigo-600 hover:bg-white transition shadow-2xs text-slate-500"
            >
              Swagger Docs <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (user?.role === 'ADMIN') navigate('/admin/dashboard');
                  else if (user?.role === 'TEACHER') navigate('/teacher/dashboard');
                  else navigate('/guardian/dashboard');
                }}
                className="font-bold shadow-md shadow-indigo-600/20"
              >
                Go to Workspace <ArrowRight className="w-3.5 h-3.5 ml-1 shrink-0" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-slate-100/70 transition"
                >
                  Sign In
                </Link>
                <Link to="/login">
                  <Button variant="primary" size="sm" className="font-bold shadow-md shadow-indigo-600/20">
                    Open Console
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Copy */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold">Enterprise Academic Operations Platform</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] text-emerald-600 font-bold">
                REST + MongoDB Cluster
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              The Operating System for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
                Modern Institutions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Engineered for academic precision, role-isolated visibility, and deterministic
              reconciliation. Three distinct operational workspaces powered by a transactional
              Express & MongoDB backend.
            </p>

            {/* Instant 1-Click Role Pod Launchers */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Click Launch:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleQuickDemoLogin('admin@scholaverse.edu', 'Admin@123', 'Admin')}
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/90 text-purple-900 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
                  <span>Admin Workspace</span>
                  <ChevronRight className="w-3 h-3 text-purple-500" />
                </button>

                <button
                  onClick={() =>
                    handleQuickDemoLogin('sarah.jenkins@scholaverse.edu', 'Teacher@123', 'Faculty')
                  }
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 text-indigo-900 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
                  <span>Faculty Console</span>
                  <ChevronRight className="w-3 h-3 text-indigo-500" />
                </button>

                <button
                  onClick={() =>
                    handleQuickDemoLogin(
                      'michael.vance@parent.scholaverse.edu',
                      'Guardian@123',
                      'Guardian'
                    )
                  }
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-900 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
                  <span>Guardian Portal</span>
                  <ChevronRight className="w-3 h-3 text-emerald-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Hero Product Console Showcase */}
          <div id="console-preview" className="mt-14 max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-white border border-slate-200/80 shadow-elevated overflow-hidden">
              {/* Window Title Bar */}
              <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <div className="ml-3 px-3 py-1 rounded-md bg-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>app.scholaverse.edu / workspace</span>
                  </div>
                </div>

                {/* Interactive Console Tabs */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setConsoleTab('faculty')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      consoleTab === 'faculty'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Faculty Register
                  </button>

                  <button
                    onClick={() => setConsoleTab('admin')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      consoleTab === 'admin'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Admin Overview
                  </button>

                  <button
                    onClick={() => setConsoleTab('guardian')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      consoleTab === 'guardian'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Guardian Hub
                  </button>
                </div>
              </div>

              {/* Console Body: Dynamic View */}
              <div className="p-6 bg-slate-50/50">
                {/* TAB 1: Faculty Interactive Register */}
                {consoleTab === 'faculty' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                            CLASS 10-A
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">
                            Daily Attendance Register
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Try clicking status buttons below to test live percentage computation:
                        </p>
                      </div>

                      {/* Live Calculated Stats Pill */}
                      <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono uppercase font-bold">
                            Live Rate
                          </span>
                          <span className="text-base font-extrabold text-emerald-600 font-mono">
                            {liveAttendanceRate}%
                          </span>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                          <span className="text-emerald-600 font-bold">{presentCount} Present</span>
                          <span className="text-amber-600 font-bold">{lateCount} Late</span>
                          <span className="text-rose-600 font-bold">{absentCount} Absent</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Roster Table */}
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4 w-20 text-center font-bold">Roll</th>
                            <th className="py-2.5 px-4 font-bold">Student</th>
                            <th className="py-2.5 px-4 w-32 font-mono font-bold">Admission #</th>
                            <th className="py-2.5 px-4 text-center w-64 font-bold">
                              Attendance Status
                            </th>
                            <th className="py-2.5 px-4 text-right w-24 font-bold">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mockAttendance.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-2.5 px-4 text-center font-mono font-bold text-indigo-600">
                                {student.roll}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-900">
                                {student.name}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-500">{student.id}</td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shadow-xs">
                                  {['PRESENT', 'LATE', 'ABSENT'].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleToggleMockStatus(student.id, status)}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition cursor-pointer ${
                                        student.status === status
                                          ? status === 'PRESENT'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : status === 'LATE'
                                            ? 'bg-amber-500 text-white shadow-xs'
                                            : 'bg-rose-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-600">
                                A+
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Compound Unique Guard Active
                      </span>
                      <span>Section: Grade 10-A • Sarah Jenkins (Class Teacher)</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: Admin Command Overview */}
                {consoleTab === 'admin' && (
                  <div className="space-y-5">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                          Total Students
                        </span>
                        <span className="text-xl font-black text-slate-900 block mt-0.5">48</span>
                        <span className="text-[10px] text-emerald-600 font-mono font-semibold">
                          100% Active Enrollment
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                          Faculty Members
                        </span>
                        <span className="text-xl font-black text-slate-900 block mt-0.5">12</span>
                        <span className="text-[10px] text-indigo-600 font-mono font-semibold">
                          6 Sections Assigned
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                          Fee Reconciled
                        </span>
                        <span className="text-xl font-black text-emerald-600 block mt-0.5">
                          $11,000
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold">
                          Ledger Balance Zero-Diff
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                          Audit Trail
                        </span>
                        <span className="text-xl font-black text-purple-600 block mt-0.5">
                          24 Events
                        </span>
                        <span className="text-[10px] text-purple-600 font-mono font-semibold">
                          Full Traceability
                        </span>
                      </div>
                    </div>

                    {/* Simulated Mini Activity Feed */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-600">
                          <Activity className="w-3.5 h-3.5" /> Recent Transaction Ledger
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          Live Stream
                        </span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            FEE_PAYMENT_PROCESSED (Invoice #INV-2026-001)
                          </span>
                          <span className="text-emerald-600 font-bold">+$2,500.00</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            ATTENDANCE_RECORDED (Grade 10-A • 4 Students)
                          </span>
                          <span className="text-slate-500">0 Conflict</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            EXAM_MARKS_RECORDED (Midterm Assessment 2026)
                          </span>
                          <span className="text-purple-600 font-bold">GPA 4.0 Computed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Guardian Hub */}
                {consoleTab === 'guardian' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider block font-bold">
                          Authorized Family Roster
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                          Michael Vance • 2 Linked Children
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-emerald-500" /> Unlinked Student Isolation Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Child 1 Card */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">Lucas Vance</h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Grade 10-A • SCH-2026-001
                            </span>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                            GPA 4.0 / 4.0
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Attendance
                            </span>
                            <span className="text-emerald-600 font-bold text-sm">96.8%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Tuition Status
                            </span>
                            <span className="text-indigo-600 font-bold text-sm">
                              Settled ($0 Due)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Child 2 Card */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">Sophia Vance</h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Grade 9-B • SCH-2026-002
                            </span>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">
                            GPA 3.8 / 4.0
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Attendance
                            </span>
                            <span className="text-emerald-600 font-bold text-sm">94.2%</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Tuition Status
                            </span>
                            <span className="text-amber-600 font-bold text-sm">Active Statement</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof-of-Engineering Institutional Metrics Ribbon */}
      <section className="border-y border-slate-200 bg-white py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">15</span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              Mongoose Schemas & Foreign ObjectIds
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono block">
              100%
            </span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              Server-Side RBAC Enforcement
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block">0</span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              Duplicate Attendance Collisions
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono block">3</span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              Role-Isolated Portals
            </span>
          </div>
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono block">
              16 / 16
            </span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              Automated Jest Tests Passing
            </span>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Architectural Capabilities */}
      <section id="architecture" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-bold">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed with Structural Integrity
            </h2>
            <p className="text-sm text-slate-600">
              ScholaVerse enforces database-level integrity, immutable audit logging, and
              mathematical financial reconciliation across all institutional modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Attendance Engine (Large 2 Cols) */}
            <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-8 flex flex-col justify-between hover:border-indigo-400 hover:shadow-soft transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Deterministic Daily Attendance Engine
                </h3>
                <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                  Eliminates double-entry collisions using a MongoDB compound unique index on{' '}
                  <code className="text-xs font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    &#123; studentId: 1, date: 1, session: 1 &#125;
                  </code>
                  . Concurrent or duplicate requests are either strictly rejected (409 Conflict) or
                  safely updated with explicit overwrite authorization.
                </p>
              </div>

              {/* Visual Tech Pill Preview */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-slate-500">
                <span className="flex items-center gap-2 text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Unique Index Guard Active
                </span>
                <span className="text-slate-400">Constraint: studentId + date + session</span>
              </div>
            </div>

            {/* Bento Card 2: Autonomous Gradebook */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-8 flex flex-col justify-between hover:border-purple-400 hover:shadow-soft transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Autonomous Gradebook</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dynamically evaluates student marks against maximum thresholds, computing total
                  percentages, GPA scales (4.0), and official letter grades (A+, A, B, C, D, F).
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between font-mono text-xs">
                <span className="text-purple-600 font-bold">Configurable Scale</span>
                <span className="text-slate-400 font-semibold">4.0 GPA Standard</span>
              </div>
            </div>

            {/* Bento Card 3: Guardian Privacy Shield */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-8 flex flex-col justify-between hover:border-emerald-400 hover:shadow-soft transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Guardian Privacy Shield</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cryptographically isolated parent view. Backend filters all student, attendance,
                  grade, and invoice queries to verified linked children only.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-600 font-bold">Zero Cross-Leakage</span>
                <span className="text-slate-400 font-semibold">403 on Foreign IDs</span>
              </div>
            </div>

            {/* Bento Card 4: Idempotent Fee Reconciliation (Large 2 Cols) */}
            <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-8 flex flex-col justify-between hover:border-amber-400 hover:shadow-soft transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Idempotent Fee Reconciliation Ledger
                </h3>
                <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                  Financial integrity without phantom balances. Simulated checkout generates
                  immutable payment records with idempotency keys. The invoice ledger automatically
                  reconciles: <code className="text-xs font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">Total = Paid + Due</code>.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-slate-500">
                <span className="text-amber-600 flex items-center gap-1.5 font-bold">
                  <Check className="w-3.5 h-3.5" /> Immutable Transaction Ledger
                </span>
                <span className="text-slate-400">Prevents Overpayment & Replay Attacks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Matrix & Deep Dive */}
      <section id="roles-matrix" className="py-24 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 font-bold">
              Access Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Three Segregated Roles, Zero Compromise
            </h2>
            <p className="text-sm text-slate-600">
              Server-side RBAC ensures every route, controller, and query is verified against
              role authorizations.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200 gap-1 shadow-inner">
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Administrator
              </button>
              <button
                onClick={() => setActiveRoleTab('teacher')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeRoleTab === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Faculty Member
              </button>
              <button
                onClick={() => setActiveRoleTab('guardian')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeRoleTab === 'guardian'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Parent & Guardian
              </button>
            </div>
          </div>

          {/* Role Detail Card */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-50/70 border border-slate-200/90 p-8 shadow-soft">
            {activeRoleTab === 'admin' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                  <div>
                    <span className="text-xs font-mono text-purple-700 uppercase tracking-widest block font-bold">
                      Scope: Entire Educational Institution
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      Administrative Command Console
                    </h3>
                  </div>
                  <button
                    onClick={() => handleQuickDemoLogin('admin@scholaverse.edu', 'Admin@123', 'Admin')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    Launch Admin Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[11px] block font-bold">
                      Authorized Capabilities:
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      Manage student enrollment, guardians, and faculty credentials
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      Create academic years, classes, sections, and subjects
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      Allocate teachers to classes and designate homeroom leads
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[11px] block font-bold">
                      Governance & Intelligence:
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      Establish institutional fee structures & invoice cohorts
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      Query immutable administrative audit logs with IP tracking
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      Export class-wise performance and attendance CSV reports
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'teacher' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                  <div>
                    <span className="text-xs font-mono text-indigo-700 uppercase tracking-widest block font-bold">
                      Scope: Assigned Classrooms & Subjects
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      Instructional Faculty Console
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickDemoLogin('sarah.jenkins@scholaverse.edu', 'Teacher@123', 'Faculty')
                    }
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    Launch Faculty Console <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[11px] block font-bold">
                      Authorized Capabilities:
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      View student roster strictly for assigned sections
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      Record daily attendance (Present, Late, Absent, Leave)
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      Enter examination marks with threshold validation
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[11px] block font-bold">
                      Security Guarantees:
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      Backend rejects attempts to access unassigned classes (403)
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      Live grade computation prevents score overflow errors
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                      Class performance rankings and GPA distributions
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'guardian' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                  <div>
                    <span className="text-xs font-mono text-emerald-700 uppercase tracking-widest block font-bold">
                      Scope: Verified Linked Dependents Only
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      Family & Guardian Portal
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickDemoLogin(
                        'michael.vance@parent.scholaverse.edu',
                        'Guardian@123',
                        'Guardian'
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    Launch Guardian Portal <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[11px] block font-bold">
                      Authorized Capabilities:
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Switch between multiple linked children profiles
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Inspect official academic transcripts and GPA records
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Instant simulated fee invoice checkout with receipt hashes
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-slate-500 font-mono uppercase text-[11px] block font-bold">
                      Privacy Shielding:
                    </span>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Strict isolation prevents accessing any other student data
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Attendance history with date-wise session breakdown
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Printable official examination report cards
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Developer API & Technology Stack Section */}
      <section className="py-20 px-6 border-t border-slate-200 relative bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-12 shadow-soft flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-600 flex items-center gap-2 font-bold">
                <Terminal className="w-4 h-4" /> OpenAPI 3.0 Documentation
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Tested, Documented, and Production-Ready
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore the complete interactive API specification mounted at{' '}
                <code className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                  /api-docs
                </code>
                . Test authentication tokens, student enrollment filters, attendance transactions,
                and simulated payment reconciliation directly in Swagger UI.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="http://localhost:5000/api-docs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                >
                  Open Swagger API Docs <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-200"
                >
                  Sign In to Workspace
                </Link>
              </div>
            </div>

            {/* Terminal Preview Snippet */}
            <div className="w-full lg:max-w-md rounded-2xl bg-slate-900 text-white p-5 font-mono text-xs shadow-elevated">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </span>
                <span>REST Response Envelope</span>
              </div>
              <pre className="mt-3 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                <code>{`{
  "success": true,
  "message": "Daily attendance recorded successfully",
  "data": {
    "recordsProcessed": 4,
    "classId": "64f1a2...",
    "session": "FULL_DAY",
    "collisionPrevention": "ACTIVE"
  },
  "meta": {
    "timestamp": "${new Date().toISOString()}",
    "executionTime": "14ms"
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Executive Footer */}
      <footer className="mt-auto bg-[#0B1120] border-t border-slate-800/80 py-12 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} textVariant="light" subtitle="Academic Operations Platform" />
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1"
            >
              API Reference <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">React • Express • MongoDB • Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
