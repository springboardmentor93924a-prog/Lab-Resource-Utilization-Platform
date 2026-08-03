import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import InventoryPage from './pages/InventoryPage';
import BookingsPage from './pages/BookingsPage';
import MaintenancePage from './pages/MaintenancePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AuditTrailPage from './pages/AuditTrailPage';
import StatusPage from './pages/StatusPage';
import DeletedItemsPage from './pages/DeletedItemsPage';
import SearchPage from './pages/SearchPage';
import PreferencesPage from './pages/PreferencesPage';
import OnboardingPage from './pages/OnboardingPage';
import InsightsPage from './pages/InsightsPage';
import TenancyPage from './pages/TenancyPage';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/manager/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
      <Route path="/equipment" element={<ProtectedRoute><Layout><EquipmentPage /></Layout></ProtectedRoute>} />
      <Route path="/equipment/:id" element={<ProtectedRoute><Layout><EquipmentDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Layout><InventoryPage /></Layout></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Layout><BookingsPage /></Layout></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><Layout><MyBookingsPage /></Layout></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><Layout><MaintenancePage /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Layout><UsersPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Layout><HelpPage /></Layout></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><Layout><AuditTrailPage /></Layout></ProtectedRoute>} />
      <Route path="/status" element={<ProtectedRoute><Layout><StatusPage /></Layout></ProtectedRoute>} />
      <Route path="/deleted" element={<ProtectedRoute><Layout><DeletedItemsPage /></Layout></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Layout><SearchPage /></Layout></ProtectedRoute>} />
      <Route path="/preferences" element={<ProtectedRoute><Layout><PreferencesPage /></Layout></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><Layout><OnboardingPage /></Layout></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><Layout><InsightsPage /></Layout></ProtectedRoute>} />
      <Route path="/tenancy" element={<ProtectedRoute><Layout><TenancyPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
