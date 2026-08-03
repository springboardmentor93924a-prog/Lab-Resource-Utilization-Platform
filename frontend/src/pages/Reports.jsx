 import { useState, useEffect } from "react";
import axios from "axios";

export default function Reports() {
  const [reportsData, setReportsData] = useState([]);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Fetch reports data only if the user is an Admin
    const fetchReports = async () => {
      if (userRole === "ROLE_ADMIN") {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:8080/api/reports", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setReportsData(response.data);
        } catch (error) {
          console.error("Failed to fetch reports data", error);
        }
      }
    };

    fetchReports();
  }, [userRole]);

  // If a student tries to access this page, show an access denied message
  if (userRole !== "ROLE_ADMIN") {
    return (
      <div className="container" style={{ padding: "20px", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>System Reports & Analytics</h2>
      
      {/* Admin View: Display reports data */}
      <div style={{ marginTop: "20px" }}>
        <p>Here is the utilization summary of lab resources and equipment.</p>
        
        <div style={{ background: "#f4f4f4", padding: "15px", borderRadius: "5px", marginTop: "15px" }}>
          <h3>Utilization Overview</h3>
          
          {/* Render reportsData here to avoid unused variable warning */}
          {reportsData.length > 0 ? (
            <ul>
              {reportsData.map((report, index) => (
                <li key={index}>{JSON.stringify(report)}</li>
              ))}
            </ul>
          ) : (
            <p>No reports data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}