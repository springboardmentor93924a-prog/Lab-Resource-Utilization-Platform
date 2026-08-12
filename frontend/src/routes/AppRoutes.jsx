import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Maintenance from "../pages/Maintenance";
import Dashboard from "../pages/Dashboard";
import Equipment from "../pages/Equipment";
import Reservations from "../pages/Reservations";
import Reports from "../pages/Reports";
import User from "../pages/User";

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
{/* =====================================================
                MAINTENANCE
                LAB TECHNICIAN + MANAGEMENT ROLES
            ====================================================== */}
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
      {/* Utilization - Task 2 */}
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
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Heatmap - Task 2 */}
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
              <Dashboard />
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