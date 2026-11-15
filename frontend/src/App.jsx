import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsPage } from './pages/admin/StudentsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { AcademicsPage } from './pages/admin/AcademicsPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { ExaminationsPage } from './pages/admin/ExaminationsPage';
import { FeesPage } from './pages/admin/FeesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Teacher pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherMarksPage } from './pages/teacher/TeacherMarksPage';
import { TeacherReportsPage } from './pages/teacher/TeacherReportsPage';

// Guardian pages
import { GuardianDashboard } from './pages/guardian/GuardianDashboard';
import { GuardianStudentsPage } from './pages/guardian/GuardianStudentsPage';
import { GuardianAttendancePage } from './pages/guardian/GuardianAttendancePage';
import { GuardianReportCardsPage } from './pages/guardian/GuardianReportCardsPage';
import { GuardianFeesPage } from './pages/guardian/GuardianFeesPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Portal Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="academics" element={<AcademicsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="exams" element={<ExaminationsPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* Teacher Portal Protected Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['TEACHER']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<TeacherClassesPage />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="marks" element={<TeacherMarksPage />} />
              <Route path="reports" element={<TeacherReportsPage />} />
            </Route>

            {/* Guardian & Student Portal Protected Routes */}
            <Route
              path="/guardian"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={['GUARDIAN']}>
                    <DashboardLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/guardian/dashboard" replace />} />
              <Route path="dashboard" element={<GuardianDashboard />} />
              <Route path="students" element={<GuardianStudentsPage />} />
              <Route path="attendance" element={<GuardianAttendancePage />} />
              <Route path="report-cards" element={<GuardianReportCardsPage />} />
              <Route path="fees" element={<GuardianFeesPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
