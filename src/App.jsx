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
import Utilization from './pages/Utilization'
import Heatmap from "./pages/Heatmap";
import ResourceSharing from "./pages/ResourceSharing";
import ExternalBooking from './pages/ExternalBooking'
import MyBookings from './pages/MyBookings';
import DemandAnalysis from "./pages/DemandAnalysis";
import Waitlist from "./pages/Waitlist";
import ResearcherEquipment from "./pages/ResearcherEquipment";
import ManagerWaitlist from "./pages/ManagerWaitlist";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token')
  )
  const [userRole, setUserRole] = useState(
  localStorage.getItem('selectedRole') || 'RESEARCHER'
)
  const [page, setPage] = useState('dashboard')
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
     {page === "equipment" && userRole === "RESEARCHER" && (
  <ResearcherEquipment />
)}

{page === "equipment" && userRole !== "RESEARCHER" && (
  <Equipment />
)}
    
    {page === 'categories' && (
  <Categories />
)}

   {page === 'bookings' && userRole === 'RESEARCHER' && (
  <MyBookings />
)}

{page === 'bookings' && userRole === 'LAB_MANAGER' && (
  <Bookings />
)}

    {page === 'users' && (
  <Users />
)}

   {page === 'reports' && (
  <Reports />
)}
     {page === 'utilization' && (
  <Utilization />
)}
    {page === "heatmap" &&(
     <Heatmap />
)}

    {page === "resource-sharing" && (
  <ResourceSharing />
)}
     {page === 'external-booking' && (
  <ExternalBooking />
)}
    {page === "demand-analysis" && (
  <DemandAnalysis />
)}
    {page === "waitlist" && userRole === "RESEARCHER" && (
  <Waitlist />
)}

{page === "waitlist" && userRole === "LAB_MANAGER" && (
  <ManagerWaitlist />
)}
  </DashboardLayout>
)
}


export default App
  