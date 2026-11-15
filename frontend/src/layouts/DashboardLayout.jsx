import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
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
  School,
  UserCheck,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, roleProfile, logout, isAdmin, isTeacher, isGuardian } = useAuth();
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
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <School className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                  Schola<span className="text-indigo-600">Verse</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Academy OS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-3 border-b border-slate-100">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'scholaverse'}`
              }
              alt="Avatar"
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <Badge variant={roleBadgeVariant} size="xs" className="mt-0.5">
                  {user?.role}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition ${
              collapsed ? 'justify-center px-0' : ''
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
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Academic Portal
              </span>
              <span className="text-sm font-bold text-slate-800">
                ScholaVerse • Term 2026-2027
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Connected
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block">{user?.name}</span>
              <span className="text-[11px] text-slate-400 block">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/60">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
