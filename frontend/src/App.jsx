import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ManageLabs from "./pages/ManageLabs";
import ManageEquipment from "./pages/ManageEquipment";

import "./App.css";

function App() {
  const location = useLocation();

  const dashboardPages = [
    "/dashboard",
    "/resources",
    "/booking",
    "/mybookings",
    "/profile",
  ];

  const showLayout = !dashboardPages.includes(location.pathname);

  return (
    <>
      {showLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage-labs" element={<ManageLabs />} />
        <Route path="/manage-equipment" element={<ManageEquipment />} />
      </Routes>

      {showLayout && <Footer />}
    </>
  );
}

export default App;