import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
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

      {/* Login - Public */}
      <Route path="/" element={<Login />} />

      {/* Register - Public */}
      <Route path="/register" element={<Register />} />

      {/* Dashboard - All logged-in users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
              "FACULTY",
              "STUDENT",
              "LAB_TECHNICIAN"
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
              "ADMIN",
              "FACULTY",
              "STUDENT",
              "LAB_TECHNICIAN"
            ]}
          >
            <MainLayout>
              <Equipment />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Reservations */}
      <Route
        path="/reservations"
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
              "FACULTY",
              "STUDENT"
            ]}
          >
            <MainLayout>
              <Reservations />
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
              "ADMIN",
              "FACULTY",
              "LAB_TECHNICIAN"
            ]}
          >
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* User Management */}
      <Route
        path="/user"
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN"]}
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
