import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import {
  School,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  FileText,
  Check,
  Lock,
  ChevronRight,
  Layers,
  Database,
  CreditCard,
  Award,
  Calendar,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Key,
  ShieldCheck,
  Laptop,
  Cpu,
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
  const liveAttendanceRate = Math.round(((presentCount + lateCount * 0.5) / mockAttendance.length) * 100);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Background Tech Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b14_1px,transparent_1px),linear-gradient(to_bottom,#1e293b14_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-600/15 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] -right-[200px] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Glassmorphic Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090D16]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <School className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Schola<span className="text-indigo-400">Verse</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OS v2.4
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#console-preview" className="hover:text-indigo-400 transition">
              Live Console
            </a>
            <a href="#architecture" className="hover:text-indigo-400 transition">
              Integrity Engine
            </a>
            <a href="#roles-matrix" className="hover:text-indigo-400 transition">
              Role Matrix
            </a>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400 transition text-slate-400"
            >
              Swagger Docs <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (user?.role === 'ADMIN') navigate('/admin/dashboard');
                  else if (user?.role === 'TEACHER') navigate('/teacher/dashboard');
                  else navigate('/guardian/dashboard');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
              >
                Go to Workspace <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link to="/login">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 font-semibold"
                  >
                    Open Console
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Copy */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-indigo-300 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium">Enterprise Academic Operations Platform</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-emerald-400">REST + MongoDB Cluster</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
              The Operating System for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">
                Modern Institutions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Engineered for academic precision, role-isolated visibility, and deterministic
              reconciliation. Three distinct operational workspaces powered by a transactional Express & MongoDB backend.
            </p>

            {/* Instant 1-Click Role Pod Launchers */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> 1-Click Launch:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleQuickDemoLogin('admin@scholaverse.edu', 'Admin@123', 'Admin')}
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs font-semibold transition hover:border-purple-400/60 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition" />
                  <span>Admin Workspace</span>
                  <ChevronRight className="w-3 h-3 text-purple-400/60" />
                </button>

                <button
                  onClick={() =>
                    handleQuickDemoLogin('sarah.jenkins@scholaverse.edu', 'Teacher@123', 'Faculty')
                  }
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-xs font-semibold transition hover:border-indigo-400/60 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
                  <span>Faculty Console</span>
                  <ChevronRight className="w-3 h-3 text-indigo-400/60" />
                </button>

                <button
                  onClick={() =>
                    handleQuickDemoLogin(
                      'michael.vance@parent.scholaverse.edu',
                      'Guardian@123',
                      'Guardian'
                    )
                  }
                  className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 text-xs font-semibold transition hover:border-emerald-400/60 shadow-sm"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
                  <span>Guardian Portal</span>
                  <ChevronRight className="w-3 h-3 text-emerald-400/60" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Hero Product Console Showcase (The Bespoke Component) */}
          <div id="console-preview" className="mt-14 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-slate-900/90 border border-white/[0.12] shadow-2xl shadow-indigo-950/50 overflow-hidden backdrop-blur-xl">
              {/* Window Title Bar */}
              <div className="px-4 py-3 bg-[#0B0F19]/90 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="ml-3 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>app.scholaverse.edu/workspace</span>
                  </div>
                </div>

                {/* Interactive Console Tabs */}
                <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
                  <button
                    onClick={() => setConsoleTab('faculty')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      consoleTab === 'faculty'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Faculty Register
                  </button>

                  <button
                    onClick={() => setConsoleTab('admin')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      consoleTab === 'admin'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Admin Overview
                  </button>

                  <button
                    onClick={() => setConsoleTab('guardian')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      consoleTab === 'guardian'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Guardian Hub
                  </button>
                </div>
              </div>

              {/* Console Body: Dynamic View */}
              <div className="p-6 bg-gradient-to-b from-slate-900 to-[#0A0E17]">
                {/* TAB 1: Faculty Interactive Register */}
                {consoleTab === 'faculty' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                            CLASS 10-A
                          </span>
                          <h3 className="text-sm font-bold text-white">Daily Attendance Register</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Try clicking status buttons below to test live percentage computation:
                        </p>
                      </div>

                      {/* Live Calculated Stats Pill */}
                      <div className="flex items-center gap-3 bg-white/[0.03] px-3.5 py-1.5 rounded-xl border border-white/[0.06]">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono uppercase">
                            Live Rate
                          </span>
                          <span className="text-base font-extrabold text-emerald-400 font-mono">
                            {liveAttendanceRate}%
                          </span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{presentCount} Present</span>
                          <span className="text-amber-400 font-bold">{lateCount} Late</span>
                          <span className="text-rose-400 font-bold">{absentCount} Absent</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Roster Table */}
                    <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-black/20">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4 w-20 text-center">Roll</th>
                            <th className="py-2.5 px-4">Student</th>
                            <th className="py-2.5 px-4 w-32 font-mono">Admission #</th>
                            <th className="py-2.5 px-4 text-center w-64">Attendance Status</th>
                            <th className="py-2.5 px-4 text-right w-24">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {mockAttendance.map((student) => (
                            <tr key={student.id} className="hover:bg-white/[0.02] transition">
                              <td className="py-2.5 px-4 text-center font-mono font-bold text-indigo-400">
                                {student.roll}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-200">
                                {student.name}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-400">{student.id}</td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="inline-flex rounded-lg border border-white/10 p-0.5 bg-black/40">
                                  {['PRESENT', 'LATE', 'ABSENT'].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleToggleMockStatus(student.id, status)}
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                                        student.status === status
                                          ? status === 'PRESENT'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : status === 'LATE'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'bg-rose-600 text-white shadow-xs'
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-300">
                                A+
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Compound Unique Guard active
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
                      <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          Total Students
                        </span>
                        <span className="text-xl font-black text-white block mt-0.5">48</span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          100% Active Enrollment
                        </span>
                      </div>

                      <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          Faculty Members
                        </span>
                        <span className="text-xl font-black text-white block mt-0.5">12</span>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          6 Sections Assigned
                        </span>
                      </div>

                      <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          Fee Reconciled
                        </span>
                        <span className="text-xl font-black text-emerald-400 block mt-0.5">
                          $11,000
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ledger Balance Zero-Diff
                        </span>
                      </div>

                      <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          Audit Trail
                        </span>
                        <span className="text-xl font-black text-purple-400 block mt-0.5">
                          24 Events
                        </span>
                        <span className="text-[10px] text-purple-400 font-mono">
                          Full Traceability
                        </span>
                      </div>
                    </div>

                    {/* Simulated Mini Activity Feed */}
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/[0.06] pb-2">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-400">
                          <Activity className="w-3.5 h-3.5" /> Recent Transaction Ledger
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Live Stream</span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            FEE_PAYMENT_PROCESSED (Invoice #INV-2026-001)
                          </span>
                          <span className="text-emerald-400 font-bold">+$2,500.00</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            ATTENDANCE_RECORDED (Grade 10-A • 4 Students)
                          </span>
                          <span className="text-slate-400">0 Conflict</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            EXAM_MARKS_RECORDED (Midterm Assessment 2026)
                          </span>
                          <span className="text-purple-300">GPA 4.0 Computed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Guardian Hub */}
                {consoleTab === 'guardian' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                          Authorized Family Roster
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">
                          Michael Vance • 2 Linked Children
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-emerald-400" /> Unlinked Student Isolation Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Child 1 Card */}
                      <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">Lucas Vance</h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Grade 10-A • SCH-2026-001
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono font-bold">
                            GPA 4.0 / 4.0
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <div className="bg-black/30 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Attendance</span>
                            <span className="text-emerald-400 font-bold text-sm">96.8%</span>
                          </div>
                          <div className="bg-black/30 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Tuition Status</span>
                            <span className="text-indigo-300 font-bold text-sm">Settled ($0 Due)</span>
                          </div>
                        </div>
                      </div>

                      {/* Child 2 Card */}
                      <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.06] space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white text-sm">Sophia Vance</h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Grade 9-B • SCH-2026-002
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono font-bold">
                            GPA 3.8 / 4.0
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <div className="bg-black/30 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Attendance</span>
                            <span className="text-emerald-400 font-bold text-sm">94.2%</span>
                          </div>
                          <div className="bg-black/30 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Tuition Status</span>
                            <span className="text-amber-400 font-bold text-sm">Active Statement</span>
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
      <section className="border-y border-white/[0.08] bg-black/30 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono block">15</span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              Mongoose Schemas & Foreign ObjectIds
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono block">
              100%
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              Server-Side RBAC Enforcement
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block">0</span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              Duplicate Attendance Collisions
            </span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">3</span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              Role-Isolated Portals
            </span>
          </div>
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono block">
              16 / 16
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1 block">
              Automated Jest Tests Passing
            </span>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Architectural Capabilities */}
      <section id="architecture" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Designed with Structural Integrity
            </h2>
            <p className="text-sm text-slate-400">
              Moving beyond superficial UI templates. ScholaVerse enforces database-level integrity,
              immutable audit logging, and mathematical financial reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Attendance Engine (Large 2 Cols) */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/60 border border-white/[0.08] p-8 flex flex-col justify-between hover:border-indigo-500/40 transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Deterministic Daily Attendance Engine
                </h3>
                <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                  Eliminates double-entry collisions using a MongoDB compound unique index on{' '}
                  <code className="text-xs font-mono text-indigo-300 bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-800/50">
                    &#123; studentId: 1, date: 1, session: 1 &#125;
                  </code>
                  . Concurrent or duplicate requests are either strictly rejected (409 Conflict) or
                  safely updated with explicit overwrite authorization.
                </p>
              </div>

              {/* Visual Tech Pill Preview */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-slate-400">
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Unique Index Guard Active
                </span>
                <span className="text-slate-500">Constraint: studentId + date + session</span>
              </div>
            </div>

            {/* Bento Card 2: Autonomous Gradebook */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] p-8 flex flex-col justify-between hover:border-purple-500/40 transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Autonomous Gradebook</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Dynamically evaluates student marks against maximum thresholds, computing total
                  percentages, GPA scales (4.0), and official letter grades (A+, A, B, C, D, F).
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs">
                <span className="text-purple-300 font-bold">Configurable Scale</span>
                <span className="text-slate-500">4.0 GPA Standard</span>
              </div>
            </div>

            {/* Bento Card 3: Guardian Privacy Shield */}
            <div className="rounded-2xl bg-slate-900/60 border border-white/[0.08] p-8 flex flex-col justify-between hover:border-emerald-500/40 transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Guardian Privacy Shield</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Cryptographically isolated parent view. Backend filters all student, attendance,
                  grade, and invoice queries to verified linked children only.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-400 font-bold">Zero Cross-Leakage</span>
                <span className="text-slate-500">403 on Foreign IDs</span>
              </div>
            </div>

            {/* Bento Card 4: Idempotent Fee Reconciliation (Large 2 Cols) */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/60 border border-white/[0.08] p-8 flex flex-col justify-between hover:border-amber-500/40 transition group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Idempotent Fee Reconciliation Ledger
                </h3>
                <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                  Financial integrity without phantom balances. Simulated checkout generates
                  immutable payment records with idempotency keys. The invoice ledger automatically
                  reconciles: <code className="text-xs font-mono text-amber-300">Total = Paid + Due</code>.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-slate-400">
                <span className="text-amber-400 flex items-center gap-1.5 font-bold">
                  <Check className="w-3.5 h-3.5" /> Immutable Transaction Ledger
                </span>
                <span className="text-slate-500">Prevents Overpayment & Replay Attacks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Matrix & Deep Dive */}
      <section id="roles-matrix" className="py-24 px-6 border-t border-white/[0.08] bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
              Access Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Segregated Roles, Zero Compromise
            </h2>
            <p className="text-sm text-slate-400">
              Server-side RBAC ensures every route, controller, and query is verified.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] gap-1">
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeRoleTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Administrator
              </button>
              <button
                onClick={() => setActiveRoleTab('teacher')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeRoleTab === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Faculty Member
              </button>
              <button
                onClick={() => setActiveRoleTab('guardian')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeRoleTab === 'guardian'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Parent & Guardian
              </button>
            </div>
          </div>

          {/* Role Detail Card */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/80 border border-white/[0.1] p-8 backdrop-blur-xl">
            {activeRoleTab === 'admin' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
                  <div>
                    <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block">
                      Scope: Entire Educational Institution
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      Administrative Command Console
                    </h3>
                  </div>
                  <button
                    onClick={() => handleQuickDemoLogin('admin@scholaverse.edu', 'Admin@123', 'Admin')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 flex items-center gap-2 shrink-0"
                  >
                    Launch Admin Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <span className="text-slate-400 font-mono uppercase text-[11px] block">
                      Authorized Capabilities:
                    </span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      Manage student enrollment, guardians, and faculty credentials
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      Create academic years, classes, sections, and subjects
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      Allocate teachers to classes and designate homeroom leads
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-slate-400 font-mono uppercase text-[11px] block">
                      Governance & Intelligence:
                    </span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      Establish institutional fee structures & invoice cohorts
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      Query immutable administrative audit logs with IP tracking
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      Export class-wise performance and attendance CSV reports
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'teacher' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest block">
                      Scope: Assigned Classrooms & Subjects
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      Instructional Faculty Console
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickDemoLogin('sarah.jenkins@scholaverse.edu', 'Teacher@123', 'Faculty')
                    }
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-2 shrink-0"
                  >
                    Launch Faculty Console <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <span className="text-slate-400 font-mono uppercase text-[11px] block">
                      Authorized Capabilities:
                    </span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      View student roster strictly for assigned sections
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      Record daily attendance (Present, Late, Absent, Leave)
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      Enter examination marks with threshold validation
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-slate-400 font-mono uppercase text-[11px] block">
                      Security Guarantees:
                    </span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      Backend rejects attempts to access unassigned classes (403)
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      Live grade computation prevents score overflow errors
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      Class performance rankings and GPA distributions
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === 'guardian' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block">
                      Scope: Verified Linked Dependents Only
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-2 shrink-0"
                  >
                    Launch Guardian Portal <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <span className="text-slate-400 font-mono uppercase text-[11px] block">
                      Authorized Capabilities:
                    </span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      Switch between multiple linked children profiles
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      Inspect official academic transcripts and GPA records
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      Instant simulated fee invoice checkout with receipt hashes
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-slate-400 font-mono uppercase text-[11px] block">
                      Privacy Shielding:
                    </span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      Strict isolation prevents accessing any other student data
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      Attendance history with date-wise session breakdown
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
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
      <section className="py-20 px-6 border-t border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-white/[0.08] p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" /> OpenAPI 3.0 Documentation
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Tested, Documented, and Production-Ready
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Explore the complete interactive API specification mounted at{' '}
                <code className="text-xs font-mono text-indigo-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                >
                  Open Swagger API Docs <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold transition"
                >
                  Sign In to Workspace
                </Link>
              </div>
            </div>

            {/* Terminal Preview Snippet */}
            <div className="w-full lg:max-w-md rounded-2xl bg-[#0B0F19] border border-white/[0.1] p-5 font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-slate-400 text-[11px]">
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
      <footer className="mt-auto bg-[#070A10] border-t border-white/[0.08] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm">ScholaVerse</span>
              <span className="text-slate-500 ml-2">Academic Operations Platform</span>
            </div>
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
