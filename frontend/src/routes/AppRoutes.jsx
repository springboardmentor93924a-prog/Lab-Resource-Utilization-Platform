import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Maintenance from "../pages/Maintenance";
import Dashboard from "../pages/Dashboard";
import Equipment from "../pages/Equipment";
import Reservations from "../pages/Reservations";
import Reports from "../pages/Reports";
import User from "../pages/User";
import Waitlist from "../pages/Waitlist";
import ResourceSharing from "../pages/ResourceSharing";
import DemandAnalysis from "../pages/DemandAnalysis";

// Task 2
import Utilization from "../pages/Utilization";
import Heatmap from "../pages/Heatmap";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard - all roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
              "LAB_TECHNICIAN",
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Equipment */}
      <Route
        path="/equipment"
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
              "LAB_TECHNICIAN",
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Equipment />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Bookings */}
      <Route
        path="/reservations"
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Reservations />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Waitlist - Task 6 */}
      <Route
        path="/waitlist"
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Waitlist />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Resource Sharing - Task 3 */}
      <Route
        path="/resource-sharing"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <ResourceSharing />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Maintenance */}
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_TECHNICIAN",
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Maintenance />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          UTILIZATION - TASK 2
          ===================================================== */}
      <Route
        path="/utilization"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Utilization />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          HEATMAP - TASK 2
          ===================================================== */}
      <Route
        path="/heatmap"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Heatmap />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
        <Route
  path="/demand-analysis"
  element={
    <ProtectedRoute
      allowedRoles={[
        "LAB_MANAGER",
        "DEPARTMENT_HEAD",
        "INSTITUTION_ADMIN",
        "SYSTEM_ADMIN"
      ]}
    >
      <MainLayout>
        <DemandAnalysis />
      </MainLayout>
    </ProtectedRoute>
  }
/>

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Users */}
      <Route
        path="/users"
        element={
          <ProtectedRoute
            allowedRoles={[
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <User />
            </MainLayout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default AppRoutes;