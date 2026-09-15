import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
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

function AuthedApp() {
  const { user, role, logout } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  const userRole = role || 'RESEARCHER'

  return (
    <DashboardLayout
      role={userRole}
      currentPage={page}
      setPage={setPage}
      onLogout={() => {
        logout()
        setPage('dashboard')
      }}
    >
      {page === 'dashboard' && <Dashboard role={userRole} user={user} showToast={showToast} />}

      {page === 'institutions' && <Institutions userRole={userRole} showToast={showToast} />}

      {page === 'departments' && <Departments userRole={userRole} showToast={showToast} />}

      {page === 'equipment' && userRole === 'RESEARCHER' && (
        <ResearcherEquipment showToast={showToast} />
      )}

      {page === 'equipment' && userRole !== 'RESEARCHER' && (
        <Equipment userRole={userRole} showToast={showToast} />
      )}

      {page === 'categories' && <Categories />}

      {page === 'bookings' && userRole === 'RESEARCHER' && (
        <MyBookings showToast={showToast} />
      )}

      {page === 'bookings' && userRole !== 'RESEARCHER' && (
        <Bookings userRole={userRole} showToast={showToast} />
      )}

      {page === 'users' && <Users userRole={userRole} showToast={showToast} />}

      {page === 'reports' && <Reports userRole={userRole} />}

      {page === 'utilization' && <UtilizationPage userRole={userRole} />}

      {page === 'heatmap' && <Heatmap userRole={userRole} />}

      {page === 'resource-sharing' && (
        <ResourceSharing userRole={userRole} showToast={showToast} />
      )}

      {page === 'external-booking' && <ExternalBooking userRole={userRole} showToast={showToast} />}

      {page === 'demand-analysis' && <DemandAnalysis userRole={userRole} />}

      {page === 'waitlist' && userRole === 'RESEARCHER' && (
        <Waitlist showToast={showToast} />
      )}

      {page === 'waitlist' && userRole !== 'RESEARCHER' && (
        <ManagerWaitlist showToast={showToast} />
      )}

      {page === 'maintenance' && userRole === 'LAB_TECHNICIAN' && (
        <TechnicianTasksPage showToast={showToast} />
      )}

      {page === 'maintenance' && userRole !== 'LAB_TECHNICIAN' && (
        <MaintenancePage userRole={userRole} showToast={showToast} />
      )}

      {page === 'calibration' && <CalibrationPage userRole={userRole} showToast={showToast} />}

      {page === 'cost' && <CostManagementPage userRole={userRole} />}

      {page === 'analytics' && <Analytics userRole={userRole} />}

      {page === 'notifications' && (
        <Notifications userRole={userRole} showToast={showToast} />
      )}

      {page === 'profile' && <Profile showToast={showToast} />}

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

function Gate() {
  const { isAuthenticated, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (showRegister) {
    return <Register onLogin={() => setShowRegister(false)} />
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={() => setShowRegister(false)}
        onRegister={() => setShowRegister(true)}
      />
    )
  }

  return <AuthedApp />
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

export default App
