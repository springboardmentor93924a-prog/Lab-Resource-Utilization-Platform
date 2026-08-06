import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Equipment from "./pages/Equipment";
import Bookings from "./pages/Bookings";
import Institutions from "./pages/Institutions";
import Departments from "./pages/Departments";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import EquipmentTracking from "./pages/EquipmentTracking";
import UtilizationDashboard from "./pages/UtilizationDashboard";
import ResourceSharing from "./pages/ResourceSharing";
import ExternalBooking from "./pages/ExternalBooking";
import DemandAnalysis from "./pages/DemandAnalysis";
import Waitlist from "./pages/Waitlist";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Common Pages */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
            <Route path="/equipment-tracking" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}><EquipmentTracking /></ProtectedRoute>} />

            {/* Super Admin Pages */}
            <Route path="/institutions" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><Institutions /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><Departments /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><Categories /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><Settings /></ProtectedRoute>} />
            <Route path="/utilization-dashboard" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><UtilizationDashboard /></ProtectedRoute>} />
            <Route path="/demand-analysis" element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]}><DemandAnalysis /></ProtectedRoute>} />

            {/* Admin Pages */}
            <Route path="/equipment" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Equipment /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Bookings /></ProtectedRoute>} />
            <Route path="/resource-sharing" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}><ResourceSharing /></ProtectedRoute>} />
            <Route path="/external-booking" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}><ExternalBooking /></ProtectedRoute>} />
            <Route path="/waitlist" element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}><Waitlist /></ProtectedRoute>} />
          </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;