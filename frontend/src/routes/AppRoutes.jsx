import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Equipment from "../pages/Equipment";
import Reservations from "../pages/Reservations";
import Reports from "../pages/Reports";
import User from "../pages/User";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login - Public */}
        <Route path="/" element={<Login />} />

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

        {/* Equipment - Admin, Faculty, Student, Lab Technician */}
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

        {/* Reservations - Admin, Faculty, Student */}
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

        {/* Reports - Admin, Faculty, Lab Technician */}
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

        {/* User Management - Admin only */}
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
    </BrowserRouter>
  );
}

export default AppRoutes;
