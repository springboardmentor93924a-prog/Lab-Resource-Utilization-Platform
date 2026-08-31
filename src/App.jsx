import { useState } from 'react'
import './App.css'
import Institutions from './pages/Institutions'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Equipment from './pages/Equipment'
import Departments from './pages/Departments'
import Categories from './pages/Categories'
import Bookings from './pages/Bookings'
import Users from './pages/Users'
import Reports from './pages/Reports'
import UtilizationPage from './pages/Utilization'
import Heatmap from './pages/Heatmap'
import ResourceSharing from './pages/ResourceSharing'
import ExternalBooking from './pages/ExternalBooking'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import DemandAnalysis from './pages/DemandAnalysis'
import Waitlist from './pages/Waitlist'
import ResearcherEquipment from './pages/ResearcherEquipment'
import ManagerWaitlist from './pages/ManagerWaitlist'
import MaintenancePage from './pages/MaintenancePage'
import TechnicianTasksPage from './pages/TechnicianTasksPage'
import CalibrationPage from './pages/CalibrationPage'
import CostManagementPage from './pages/CostManagementPage'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'
import Toast from './components/Toast'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token')
  )
  const [userRole, setUserRole] = useState(
    localStorage.getItem('selectedRole') || 'RESEARCHER'
  )
  const [page, setPage] = useState('dashboard')

  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  if (page === 'register') {
    return <Register onLogin={() => setPage('dashboard')} />
  }

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
        onRegister={() => setPage('register')}
      />
    )
  }

  return (
    <DashboardLayout
      role={userRole}
      currentPage={page}
      setPage={setPage}
      onLogout={() => {
        localStorage.clear()
        setIsLoggedIn(false)
        setPage('dashboard')
      }}
    >
      {page === 'dashboard' && (
        <Dashboard role={userRole} />
      )}

      {page === 'institutions' && (
        <Institutions />
      )}

      {page === 'departments' && (
        <Departments />
      )}

      {page === 'equipment' && userRole === 'RESEARCHER' && (
        <ResearcherEquipment />
      )}

      {page === 'equipment' && userRole !== 'RESEARCHER' && (
        <Equipment />
      )}

      {page === 'categories' && (
        <Categories />
      )}

      {page === 'bookings' && userRole === 'RESEARCHER' && (
        <MyBookings showToast={showToast} />
      )}

      {page === 'bookings' && userRole !== 'RESEARCHER' && (
        <Bookings showToast={showToast} />
      )}

      {page === 'users' && (
        <Users />
      )}

      {page === 'reports' && (
        <Reports />
      )}

      {page === 'utilization' && (
        <UtilizationPage />
      )}

      {page === 'heatmap' && (
        <Heatmap />
      )}

      {page === 'resource-sharing' && (
        <ResourceSharing />
      )}

      {page === 'external-booking' && (
        <ExternalBooking showToast={showToast} />
      )}

      {page === 'demand-analysis' && (
        <DemandAnalysis />
      )}

      {page === 'waitlist' && userRole === 'RESEARCHER' && (
        <Waitlist showToast={showToast} />
      )}

      {page === 'waitlist' && userRole !== 'RESEARCHER' && (
        <ManagerWaitlist showToast={showToast} />
      )}

      {page === 'maintenance' && (
        <MaintenancePage userRole={userRole} showToast={showToast} />
      )}

      {page === 'technician-tasks' && (
        <TechnicianTasksPage />
      )}

      {page === 'calibration' && (
        <CalibrationPage />
      )}

      {page === 'cost' && (
        <CostManagementPage userRole={userRole} />
      )}

      {(page === 'analytics' || page === 'heatmap') && (
        <Analytics userRole={userRole} />
      )}

      {page === 'notifications' && (
        <Notifications userRole={userRole} showToast={showToast} />
      )}

      {page === 'profile' && (
        <Profile userRole={userRole} showToast={showToast} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  )
}

export default App