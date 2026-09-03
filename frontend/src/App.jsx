import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Equipment from "./pages/Equipment";
import Bookings from "./pages/Bookings";
import Waitlist from "./pages/Waitlist";
import Utilization from "./pages/Utilization";
import Sharing from "./pages/Sharing";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Maintenance from "./pages/Maintenance";
import Calibration from "./pages/Calibration";
import ExternalBookings from "./pages/ExternalBookings";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/Layout";
import RequestActivityIndicator from "./components/RequestActivityIndicator";

// Role groups based on AuthContext mappings
const ALL_ROLES = ["RESEARCHER", "STUDENT", "TECHNICIAN", "LAB_MANAGER", "DEPARTMENT_HEAD", "FACULTY", "INSTITUTION_ADMIN", "SYSTEM_ADMIN", "SUPER_ADMIN"];
const BOOKING_ROLES = ["RESEARCHER", "STUDENT", "LAB_MANAGER", "DEPARTMENT_HEAD", "FACULTY", "INSTITUTION_ADMIN", "SYSTEM_ADMIN", "SUPER_ADMIN"];
const MANAGER_ADMIN_ROLES = ["LAB_MANAGER", "DEPARTMENT_HEAD", "FACULTY", "INSTITUTION_ADMIN", "SYSTEM_ADMIN", "SUPER_ADMIN"];
const ADMIN_ROLES = ["INSTITUTION_ADMIN", "SYSTEM_ADMIN", "SUPER_ADMIN"];
const TECHNICIAN_ROLES = ["TECHNICIAN", "LAB_MANAGER", "INSTITUTION_ADMIN", "SYSTEM_ADMIN", "SUPER_ADMIN"];

function App() {

  return (
    <BrowserRouter>

      <RequestActivityIndicator />

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* PROTECTED ROUTES */}

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/"
            element={<RoleRoute allowedRoles={ALL_ROLES}><Dashboard /></RoleRoute>}
          />

          <Route
            path="/users"
            element={<RoleRoute allowedRoles={ADMIN_ROLES}><Users /></RoleRoute>}
          />

          <Route
            path="/equipment"
            element={<RoleRoute allowedRoles={ALL_ROLES}><Equipment /></RoleRoute>}
          />

          <Route
            path="/bookings"
            element={<RoleRoute allowedRoles={BOOKING_ROLES}><Bookings /></RoleRoute>}
          />

          <Route
            path="/booking-history"
            element={<RoleRoute allowedRoles={BOOKING_ROLES}><Bookings /></RoleRoute>}
          />

          <Route
            path="/departments"
            element={<RoleRoute allowedRoles={ADMIN_ROLES}><Users /></RoleRoute>}
          />

          <Route
            path="/waitlist"
            element={<RoleRoute allowedRoles={ALL_ROLES}><Waitlist /></RoleRoute>}
          />

          <Route
            path="/utilization"
            element={<RoleRoute allowedRoles={MANAGER_ADMIN_ROLES}><Utilization /></RoleRoute>}
          />

          <Route
            path="/sharing"
            element={<RoleRoute allowedRoles={MANAGER_ADMIN_ROLES}><Sharing /></RoleRoute>}
          />

          <Route
            path="/maintenance"
            element={<RoleRoute allowedRoles={TECHNICIAN_ROLES}><Maintenance /></RoleRoute>}
          />

          <Route
            path="/calibration"
            element={<RoleRoute allowedRoles={TECHNICIAN_ROLES}><Calibration /></RoleRoute>}
          />

          <Route
            path="/external-bookings"
            element={<RoleRoute allowedRoles={BOOKING_ROLES}><ExternalBookings /></RoleRoute>}
          />

          <Route
            path="/analytics"
            element={<RoleRoute allowedRoles={ADMIN_ROLES}><Analytics /></RoleRoute>}
          />

          <Route
            path="/reports"
            element={<RoleRoute allowedRoles={MANAGER_ADMIN_ROLES}><Reports /></RoleRoute>}
          />

          <Route
            path="/settings"
            element={<RoleRoute allowedRoles={ALL_ROLES}><Settings /></RoleRoute>}
          />

          <Route
            path="/profile"
            element={<RoleRoute allowedRoles={ALL_ROLES}><Profile /></RoleRoute>}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
