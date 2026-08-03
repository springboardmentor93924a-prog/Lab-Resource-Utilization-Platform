 import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Equipment from "../pages/Equipment";
import Reservations from "../pages/Reservations";
import Reports from "../pages/Reports";
import User from "../pages/User";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute"; // ProtectedRoute को इम्पोर्ट किया

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Page */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_STUDENT"]}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Protected Equipment Route */}
        <Route 
          path="/equipment" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_STUDENT"]}>
              <MainLayout>
                <Equipment />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Protected Reservations Route */}
        <Route 
          path="/reservations" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_STUDENT"]}>
              <MainLayout>
                <Reservations />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Protected Reports Route (Example: Admin only or both) */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_STUDENT"]}>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Protected User Route */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_STUDENT"]}>
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