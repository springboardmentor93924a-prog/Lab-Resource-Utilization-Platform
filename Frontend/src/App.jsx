import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EquipmentCatalog from "./pages/EquipmentCatalog";
import EquipmentDetails from "./pages/EquipmentDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import BookingApproval from "./pages/BookingApproval";
import MyWaitlist from "./pages/MyWaitlist";
import EquipmentCalendar from "./pages/EquipmentCalendar";
import AdminWaitlist from "./pages/AdminWaitlist";
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
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import MaintenanceRequests from "./pages/MaintenanceRequests";
import MaintenanceHistory from "./pages/MaintenanceHistory";
import WorkOrders from "./pages/WorkOrders";
import CalibrationDashboard from "./pages/CalibrationDashboard";
import CalibrationManagement from "./pages/CalibrationManagement";
import Cost from "./pages/Cost";
import CostDashboard from "./pages/CostDashboard";
import EquipmentUsageCost from "./pages/EquipmentUsageCost";
import DepartmentCostAllocation from "./pages/DepartmentCostAllocation";
import InterInstitutionBilling from "./pages/InterInstitutionBilling";
import CostRecovery from "./pages/CostRecovery";

import Layout from "./components/Layout";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>

          {/* ================================================= */}
          {/* PUBLIC PAGES */}
          {/* ================================================= */}

          <Route
            path="/"
            element={<Navigate to="/login" />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* ================================================= */}
          {/* APPLICATION PAGES WITH SIDEBAR + TOPBAR */}
          {/* ================================================= */}

          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          <Route
            path="/equipment"
            element={
              <Layout>
                <EquipmentCatalog />
              </Layout>
            }
          />

          <Route
            path="/equipment/:id"
            element={
              <Layout>
                <EquipmentDetails />
              </Layout>
            }
          />

          <Route
            path="/shared-equipment"
            element={
              <Layout>
                <SharedEquipment />
              </Layout>
            }
          />

          <Route
            path="/request-access/:id"
            element={<RequestAccess />}
          />

          <Route
            path="/booking"
            element={
              <Layout>
                <Booking />
              </Layout>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <Layout>
                <MyBookings />
              </Layout>
            }
          />

          <Route
            path="/my-waitlist"
            element={<MyWaitlist />}
          />

          <Route
            path="/booking-approval"
            element={
              <Layout>
                <BookingApproval />
              </Layout>
            }
          />
          
          <Route
            path="/admin-waitlists"
            element={
              <Layout>
                <AdminWaitlist />
              </Layout>
            }
          />

          <Route 
            path="/utilization" 
            element={ 
              <Layout> 
                <UtilizationDashboard /> 
              </Layout> 
            } 
          />

          <Route
            path="/analytics"
            element={
              <Layout>
                <UtilizationAnalytics />
              </Layout>
            }
          />

          <Route
            path="/calendar"
            element={<EquipmentCalendar />}
          />

          <Route
            path="/my-access-requests"
            element={<MyAccessRequests />}
          />

          <Route
            path="/access-requests"
            element={<AccessRequests />}
          />

          <Route
            path="/admin-shared-equipment"
            element={<AdminSharedEquipment />}
          />

          <Route
            path="/external-booking"
            element={<Layout><ExternalBooking /></Layout>}
          />

          <Route
            path="/external-bookings"
            element={<ExternalBookings />}
          />

          <Route
            path="/external-booking-approval"
            element={<ExternalBookingApproval />}
          />

          <Route
            path="/external-access"
            element={<ExternalAccess />}
          />

          <Route
            path="/analytics-dashboard"
            element={<AnalyticsDashboard />}
          />

          /* <Route
            path="/maintenance-dashboard"
            element={<Layout><MaintenanceDashboard /></Layout>}
          />

          <Route
            path="/maintenance-requests"
            element={<Layout><MaintenanceRequests /></Layout>}
          /> 

          <Route
            path="/work-orders"
            element={<Layout><WorkOrders /></Layout>}
          />

          <Route 
            path="/maintenance-history" 
            element={<Layout><MaintenanceHistory /></Layout>} 
          />

          <Route
            path="/calibration"
            element={<Layout><CalibrationDashboard /></Layout>}
          />

          <Route
            path="/calibration-management"
            element={<Layout><CalibrationManagement /></Layout>}
          />

          <Route
            path="/cost"
            element={<Layout><Cost /></Layout>}
          />

          <Route
            path="/cost-dashboard"
            element={<Layout><CostDashboard /></Layout>}
          />

          <Route
            path="/equipment-usage-cost"
            element={<Layout><EquipmentUsageCost /></Layout>}
          />

          <Route
            path="/department-cost-allocation"
            element={<Layout><DepartmentCostAllocation /></Layout>}
          />

          <Route
            path="/inter-institution-billing"
            element={<Layout><InterInstitutionBilling /></Layout>}
          />

          <Route
            path="/cost-recovery"
            element={<Layout><CostRecovery /></Layout>}
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;