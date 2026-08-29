import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CalendarView from './components/CalendarView';
import Login from './pages/Login';
import Register from './pages/Register';
import ResearcherPortal from './pages/ResearcherPortal';
import LabManagerDashboard from './pages/LabManagerDashboard';
import DepartmentHodDashboard from './pages/DepartmentHodDashboard';
import InstitutionAdminConsole from './pages/InstitutionAdminConsole';
import MaintenanceBoard from './pages/MaintenanceBoard';
import AccessDenied from './pages/AccessDenied';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return children;
};

function MainLayout() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {user && <Navbar />}
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/403" element={<AccessDenied />} />

          {/* 1. Everyone with Verified Email */}
          <Route path="/" element={<ProtectedRoute><ResearcherPortal /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><div className="max-w-7xl mx-auto p-6"><CalendarView /></div></ProtectedRoute>} />

          {/* 2. Lab Manager & Admin */}
          <Route path="/manager" element={
            <ProtectedRoute allowedRoles={['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN']}>
              <LabManagerDashboard />
            </ProtectedRoute>
          } />

          {/* 3. Department HOD & Admin */}
          <Route path="/hod" element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD', 'INSTITUTION_ADMIN']}>
              <DepartmentHodDashboard />
            </ProtectedRoute>
          } />

          {/* 4. Institutional Admin Only */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['INSTITUTION_ADMIN']}>
              <InstitutionAdminConsole />
            </ProtectedRoute>
          } />

          {/* 5. Technician, Manager, HOD, Admin */}
          <Route path="/maintenance" element={
            <ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN']}>
              <MaintenanceBoard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}