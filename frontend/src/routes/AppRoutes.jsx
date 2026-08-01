import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Equipment from "../pages/Equipment";
import Reservations from "../pages/Reservations";
import Reports from "../pages/Reports";
import User from "../pages/User";

import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page (No Layout) */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        {/* Equipment */}
        <Route
          path="/equipment"
          element={
            <MainLayout>
              <Equipment />
            </MainLayout>
          }
        />

        {/* Reservations */}
        <Route
          path="/reservations"
          element={
            <MainLayout>
              <Reservations />
            </MainLayout>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <MainLayout>
              <Reports />
            </MainLayout>
          }
        />

        {/* User */}
        <Route
          path="/user"
          element={
            <MainLayout>
              <User />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;