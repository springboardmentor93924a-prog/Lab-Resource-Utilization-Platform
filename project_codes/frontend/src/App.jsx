import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EquipmentCatalog from './pages/EquipmentCatalog'
import Bookings from './pages/Bookings'
import Maintenance from './pages/Maintenance'
import Sharing from './pages/Sharing'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/equipment" element={<ProtectedRoute><EquipmentCatalog /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/maintenance" element={
        <ProtectedRoute roles={['LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN']}>
          <Maintenance />
        </ProtectedRoute>
      } />
      <Route path="/sharing" element={
        <ProtectedRoute roles={['LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN']}>
          <Sharing />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute roles={['LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN']}>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
