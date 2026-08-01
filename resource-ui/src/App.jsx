import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Equipment from "./pages/Equipment";
import Bookings from "./pages/Bookings";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {

  return (
    <BrowserRouter>

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
            element={<Dashboard />}
          />

          <Route
            path="/users"
            element={<Users />}
          />

          <Route
            path="/equipment"
            element={<Equipment />}
          />

          <Route
            path="/bookings"
            element={<Bookings />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;