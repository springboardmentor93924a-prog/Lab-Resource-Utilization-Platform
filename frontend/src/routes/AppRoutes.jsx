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
import CostManagement from "../pages/CostManagement";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";

// Task 2
import Utilization from "../pages/Utilization";
import Heatmap from "../pages/Heatmap";
import Calibration from "../pages/Calibration";
import Certification from "../pages/Certification";

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

      {/* Bookings. Per PDF Section 11, only Lab Manager and Department
          Head have this — Lab Technician and Institution Admin don't. */}
      <Route
        path="/reservations"
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Reservations />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Waitlist - Task 6. Per PDF Section 11, only Researcher/Student
          gets this. */}
      <Route
        path="/waitlist"
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
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

      {/* Maintenance. Per PDF Section 11, only Lab Technician and Lab
          Manager have this — Department Head and Institution Admin don't. */}
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_TECHNICIAN",
              "LAB_MANAGER",
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
          CALIBRATION - TASK 2 (NEW)
          ===================================================== */}
      {/* Calibration. Per PDF Section 11, only Lab Technician has this. */}
      <Route
        path="/calibration"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_TECHNICIAN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <Calibration />
            </MainLayout>
          </ProtectedRoute>
        }
      />
{/* The standalone /feedback page/route has been removed. Students submit
    inline from My Bookings (Reservations.jsx) within 1 hour of a booking
    completing; staff (Lab Technician / Lab Manager / Department Head /
    Institution Admin / System Admin) now work the same Equipment Issue
    Reports queue from inside the existing /maintenance page instead
    (Maintenance.jsx). Both flows call the same /api/equipment-feedback
    endpoints, so no backend changes were needed for this move. */}

<Route
  path="/certification"
  element={
    <ProtectedRoute allowedRoles={["LAB_TECHNICIAN","LAB_MANAGER","SYSTEM_ADMIN"]}>
      <MainLayout><Certification /></MainLayout>
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
      {/* Per PDF Section 11, Heatmap has no Institution Admin entry. */}
      <Route
        path="/heatmap"
        element={
          <ProtectedRoute
            allowedRoles={[
              "LAB_MANAGER",
              "DEPARTMENT_HEAD",
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
    // Per PDF Section 11, Demand Analysis has no Institution Admin entry.
    <ProtectedRoute
      allowedRoles={[
        "LAB_MANAGER",
        "DEPARTMENT_HEAD",
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

      {/* =====================================================
          COST MANAGEMENT - TASK 3
          ===================================================== */}
      {/* Cost Management ("Cost Analysis" in the PDF) — Section 11 lists
          this only under Institution Administrator. */}
      <Route
        path="/cost-management"
        element={
          <ProtectedRoute
            allowedRoles={[
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <CostManagement />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ANALYTICS DASHBOARD - TASK 4
          ===================================================== */}
      {/* Analytics — Section 11 lists this only under Institution
          Administrator. */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute
            allowedRoles={[
              "INSTITUTION_ADMIN",
              "SYSTEM_ADMIN"
            ]}
          >
            <MainLayout>
              <AnalyticsDashboard />
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