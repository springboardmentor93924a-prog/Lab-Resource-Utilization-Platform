import { Routes, Route } from "react-router-dom";

import UtilizationDashboard from "./pages/UtilizationDashboard";
import UtilizationHeatmap from "./pages/UtilizationHeatmap";
import BookingApproval from "./pages/BookingApproval";

function App() {
    return (
        <Routes>
          <Route path="/utilization" element={<UtilizationDashboard />} />
          <Route path="/heatmap" element={<UtilizationHeatmap />} />
          <Route path="/booking-approval" element={<BookingApproval />} />
        </Routes>
        );
}

export default App;