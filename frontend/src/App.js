import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import EquipmentList from './pages/EquipmentList'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Placeholder from './pages/Placeholder'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/bookings" element={<Placeholder title="Bookings" />} />
          <Route path="/maintenance" element={<Placeholder title="Maintenance" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
