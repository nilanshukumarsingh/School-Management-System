import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Logo } from '../components/common/Logo';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  BarChart3,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout, isAdmin, isTeacher, isGuardian } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Build role-specific navigation menu
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Students', path: '/admin/students', icon: GraduationCap },
        { label: 'Teachers', path: '/admin/teachers', icon: Users },
        { label: 'Academics', path: '/admin/academics', icon: BookOpen },
        { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
        { label: 'Examinations', path: '/admin/exams', icon: Award },
        { label: 'Fee Management', path: '/admin/fees', icon: CreditCard },
        { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
      ];
    }

    if (isTeacher) {
      return [
        { label: 'Teacher Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { label: 'My Classes', path: '/teacher/classes', icon: BookOpen },
        { label: 'Mark Attendance', path: '/teacher/attendance', icon: CalendarCheck },
        { label: 'Enter Exam Marks', path: '/teacher/marks', icon: Award },
        { label: 'Academic Reports', path: '/teacher/reports', icon: BarChart3 },
      ];
    }

    if (isGuardian) {
      return [
        { label: 'Guardian Dashboard', path: '/guardian/dashboard', icon: LayoutDashboard },
        { label: 'Linked Students', path: '/guardian/students', icon: GraduationCap },
        { label: 'Attendance Records', path: '/guardian/attendance', icon: CalendarCheck },
        { label: 'Report Cards', path: '/guardian/report-cards', icon: Award },
        { label: 'Fee Invoices', path: '/guardian/fees', icon: CreditCard },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const roleBadgeVariant = isAdmin ? 'purple' : isTeacher ? 'primary' : 'success';

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out shadow-xs ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header with Collapsed Guard */}
        <div
          className={`flex items-center h-16 border-b border-slate-100 transition-all ${
            collapsed ? 'justify-center px-2 relative' : 'justify-between px-4'
          }`}
        >
          {/* Logo never clips: show icon only when collapsed */}
          <Logo
            size={collapsed ? 'sm' : 'md'}
            showText={!collapsed}
            textVariant="dark"
            subtitle="Academy OS"
          />

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex items-center justify-center transition-all ${
              collapsed
                ? 'absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-indigo-600 hover:scale-110 z-30 cursor-pointer'
                : 'p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className={`border-b border-slate-100 ${collapsed ? 'p-2' : 'p-3'}`}>
          <div
            className={`flex items-center gap-3 rounded-2xl bg-slate-50/80 border border-slate-100 ${
              collapsed ? 'justify-center p-1.5' : 'p-2.5'
            }`}
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'scholaverse'}`
              }
              alt="Avatar"
              className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
            />
            {!collapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant={roleBadgeVariant} size="xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 overflow-y-auto space-y-1 ${collapsed ? 'p-2' : 'p-3'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                } ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className={`border-t border-slate-100 ${collapsed ? 'p-2' : 'p-3'}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition ${
              collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
            }`}
            title="Log out of session"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                Academic Portal
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                ScholaVerse • Term 2026-2027
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Connected
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block">{user?.name}</span>
              <span className="text-[11px] text-slate-400 block font-mono">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
