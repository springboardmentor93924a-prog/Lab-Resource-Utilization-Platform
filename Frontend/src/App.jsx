import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import RoleProtectedRoute from "./components/RoleProtectedRoute";

import {
  ALL_ROLES,
  MANAGEMENT_ROLES,
  ADMIN_ROLES,
  COST_MANAGEMENT_ROLES,
  MAINTENANCE_ROLES,
  CALIBRATION_ROLES,
  BOOKING_APPROVAL_ROLES,
  EXTERNAL_ACCESS_ROLES,
  WAITLIST_MANAGEMENT_ROLES,
  REPORT_ROLES,
} from "./config/rolePermissions";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import EquipmentCatalog from "./pages/EquipmentCatalog";
import EquipmentDetails from "./pages/EquipmentDetails";

import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import BookingApproval from "./pages/BookingApproval";

import MyWaitlist from "./pages/MyWaitlist";
import AdminWaitlist from "./pages/AdminWaitlist";

import EquipmentCalendar from "./pages/EquipmentCalendar";

import UtilizationDashboard from "./pages/UtilizationDashboard";
import UtilizationAnalytics from "./pages/UtilizationAnalytics";

import SharedEquipment from "./pages/SharedEquipment";
import MyAccessRequests from "./pages/MyAccessRequests";
import AccessRequests from "./pages/AccessRequests";
import RequestAccess from "./pages/RequestAccess";
import AdminSharedEquipment from "./pages/AdminSharedEquipment";

import ExternalBooking from "./pages/ExternalBooking";
import ExternalBookings from "./pages/ExternalBookings";
import ExternalBookingApproval from "./pages/ExternalBookingApproval";
import ExternalAccess from "./pages/ExternalAccess";

import RoleBasedAnalyticsDashboard from "./pages/RoleBasedAnalyticsDashboard";

import Maintenance from "./pages/Maintenance";
import MaintenanceHistory from "./pages/MaintenanceHistory";
import WorkOrders from "./pages/WorkOrders";
import MaintenanceRequests from "./components/MaintenanceRequests";

import Calibration from "./pages/Calibration";
import CalibrationManagement from "./pages/CalibrationManagement";

import CostDashboard from "./pages/CostDashboard";
import EquipmentUsageCost from "./pages/EquipmentUsageCost";
import DepartmentCostAllocation from "./pages/DepartmentCostAllocation";
import CostRecovery from "./pages/CostRecovery";
import InterInstitutionBilling from "./pages/InterInstitutionBilling";
import BudgetUtilization from "./pages/BudgetUtilization";

import ReportsDashboard from "./pages/ReportsDashboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";


// =========================================================
// PROTECTED LAYOUT
// =========================================================

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
);


// =========================================================
// APP
// =========================================================

function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <Routes>


          {/* ================================================= */}
          {/* PUBLIC ROUTES */}
          {/* ================================================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

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
            path="/reset-password"
            element={<ResetPassword />}
          />


          {/* ================================================= */}
          {/* DASHBOARD */}
          {/* ================================================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <Dashboard />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* EQUIPMENT */}
          {/* ================================================= */}

          <Route
            path="/equipment"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <EquipmentCatalog />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/equipment/:id"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <EquipmentDetails />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* SHARED EQUIPMENT */}
          {/* ================================================= */}

          <Route
            path="/shared-equipment"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <SharedEquipment />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/request-access/:id"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <RequestAccess />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/my-access-requests"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <MyAccessRequests />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/access-requests"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={MANAGEMENT_ROLES}
                >
                  <AccessRequests />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/admin-shared-equipment"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ADMIN_ROLES}
                >
                  <AdminSharedEquipment />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* BOOKINGS */}
          {/* ================================================= */}

          <Route
            path="/booking"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <Booking />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <MyBookings />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/booking-approval"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={BOOKING_APPROVAL_ROLES}
                >
                  <BookingApproval />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <EquipmentCalendar />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* WAITLIST */}
          {/* ================================================= */}

          <Route
            path="/my-waitlist"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <MyWaitlist />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/admin-waitlists"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={WAITLIST_MANAGEMENT_ROLES}
                >
                  <AdminWaitlist />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* UTILIZATION */}
          {/* ================================================= */}

          <Route
            path="/utilization"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <UtilizationDashboard />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={MANAGEMENT_ROLES}
                >
                  <UtilizationAnalytics />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/analytics-dashboard"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={MANAGEMENT_ROLES}
                >
                  <RoleBasedAnalyticsDashboard />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* EXTERNAL BOOKING */}
          {/* ================================================= */}

          <Route
            path="/external-booking"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <ExternalBooking />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/external-bookings"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={EXTERNAL_ACCESS_ROLES}
                >
                  <ExternalBookings />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/external-booking-approval"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={EXTERNAL_ACCESS_ROLES}
                >
                  <ExternalBookingApproval />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/external-access"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={EXTERNAL_ACCESS_ROLES}
                >
                  <ExternalAccess />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* MAINTENANCE */}
          {/* ================================================= */}

          <Route
            path="/maintenance"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={MAINTENANCE_ROLES}
                >
                  <Maintenance />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/maintenance/requests"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={MAINTENANCE_ROLES}
                >
                  <MaintenanceRequests />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/work-orders"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={MAINTENANCE_ROLES}
                >
                  <WorkOrders />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/maintenance-history"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={MAINTENANCE_ROLES}
                >
                  <MaintenanceHistory />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* CALIBRATION */}
          {/* ================================================= */}

          <Route
            path="/calibration"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={CALIBRATION_ROLES}
                >
                  <Calibration />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/calibration-management"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={CALIBRATION_ROLES}
                >
                  <CalibrationManagement />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* COST MANAGEMENT */}
          {/* ================================================= */}

          <Route
            path="/cost-dashboard"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={COST_MANAGEMENT_ROLES}
                >
                  <CostDashboard />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/equipment-usage-cost"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={COST_MANAGEMENT_ROLES}
                >
                  <EquipmentUsageCost />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/department-cost-allocation"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={COST_MANAGEMENT_ROLES}
                >
                  <DepartmentCostAllocation />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/cost-recovery"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={COST_MANAGEMENT_ROLES}
                >
                  <CostRecovery />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/inter-institution-billing"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={COST_MANAGEMENT_ROLES}
                >
                  <InterInstitutionBilling />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/budget-utilization"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={COST_MANAGEMENT_ROLES}
                >
                  <BudgetUtilization />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* REPORTS */}
          {/* ================================================= */}

          <Route
            path="/reports"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={REPORT_ROLES}
                >
                  <ReportsDashboard />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* USER */}
          {/* ================================================= */}

          <Route
            path="/notifications"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <Notifications />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedLayout>

                <RoleProtectedRoute
                  allowedRoles={ALL_ROLES}
                >
                  <Profile />
                </RoleProtectedRoute>

              </ProtectedLayout>
            }
          />


          {/* ================================================= */}
          {/* FALLBACK */}
          {/* ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;