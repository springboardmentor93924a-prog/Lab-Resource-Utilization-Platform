import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import EquipmentCatalog from "./pages/EquipmentCatalog";
import EquipmentDetail from "./pages/EquipmentDetail";
import BookEquipment from "./pages/BookEquipment";
import MyBookings from "./pages/MyBookings";
import AddEquipment from "./pages/AddEquipment";
import EquipmentCalendar from "./pages/EquipmentCalendar";
import EditEquipment from "./pages/EditEquipment";
import Sharing from "./pages/Sharing";
import UtilizationDashboard from "./pages/UtilizationDashboard";
import UtilizationHeatmap from "./pages/UtilizationHeatmap";
import BookingApproval from "./pages/BookingApproval";
import MyWaitlist from "./pages/MyWaitlist";
import Profile from "./pages/Profile";
import MyTasks from "./pages/MyTasks";
import Maintenance from "./pages/Maintenance";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Report";
import Notifications from "./pages/Notifications";
import OAuth2Callback from "./OAuth2Callback";
import GoogleRegister from "./pages/GoogleRegister";
import EquipmentFeedback from "./pages/EquipmentFeedback";



export default function App() {

  return (

    <AuthProvider>

      

        <BrowserRouter>

          {/* =================================================
              GLOBAL SETTINGS
              
              This appears on every authenticated page.
              ================================================= */}

          

          {/* =================================================
              ROUTES
              ================================================= */}

          <Routes>

            {/* =================================================
                AUTHENTICATION
            ================================================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/google-register"
              element={<GoogleRegister />}
            />

            <Route
              path="/oauth2/callback"
              element={<OAuth2Callback />}
            />


            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ResearcherDashboard />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                EQUIPMENT
            ================================================= */}

            <Route
              path="/equipment"
              element={
                <ProtectedRoute>
                  <EquipmentCatalog />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment/:id"
              element={
                <ProtectedRoute>
                  <EquipmentDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment/add"
              element={
                <ProtectedRoute>
                  <AddEquipment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment/:id/edit"
              element={
                <ProtectedRoute>
                  <EditEquipment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment/calendar"
              element={
                <ProtectedRoute>
                  <EquipmentCalendar />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipment-feedback"
              element={
                <ProtectedRoute>
                  <EquipmentFeedback />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                BOOKING
            ================================================= */}

            <Route
              path="/book/:id"
              element={
                <ProtectedRoute>
                  <BookEquipment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookEquipment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-waitlist"
              element={
                <ProtectedRoute>
                  <MyWaitlist />
                </ProtectedRoute>
              }
            />
           


            {/* =================================================
                SHARING
            ================================================= */}

            <Route
              path="/sharing"
              element={
                <ProtectedRoute>
                  <Sharing />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                UTILIZATION
            ================================================= */}

            <Route
              path="/utilization"
              element={
                <ProtectedRoute>
                  <UtilizationDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/heatmap"
              element={
                <ProtectedRoute>
                  <UtilizationHeatmap />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                APPROVAL
            ================================================= */}

            <Route
              path="/booking-approval"
              element={
                <ProtectedRoute>
                  <BookingApproval />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                MAINTENANCE
            ================================================= */}

            <Route
              path="/maintenance"
              element={
                <ProtectedRoute>
                  <Maintenance />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute>
                  <MyTasks />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                ANALYTICS / REPORTS / BILLING
            ================================================= */}

            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                PROFILE
            ================================================= */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                DEFAULT
            ================================================= */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

          </Routes>

        </BrowserRouter>

      

    </AuthProvider>
  );
}