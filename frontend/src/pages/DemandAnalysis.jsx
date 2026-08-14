import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList
} from "recharts"; 
 
 
 import { useEffect, useMemo, useState } from "react";
import "./DemandAnalysis.css";

function DemandAnalysis() {
  const [summary, setSummary] = useState(null);
  const [utilizationData, setUtilizationData] = useState([]);

  useEffect(() => {
  fetch("http://localhost:8080/api/utilization", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then((response) => response.json())
    .then((data) => setUtilizationData(data))
    .catch((error) => console.error(error));
}, []);


  useEffect(() => {
    fetch("http://localhost:8080/api/utilization/summary", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setSummary(data))
      .catch((error) => console.error(error));
  }, []);

  const topRequestedEquipment = useMemo(() => {
  return [...utilizationData]
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 5);
}, [utilizationData]);

  return (
    <div className="da-page">

      <div className="da-header">
        <h1 className="da-title">Demand Analysis</h1>

        <p className="da-subtitle">
          Analyze equipment demand, utilization trends and resource planning.
        </p>
      </div>

      {summary && (
        <div className="da-summary-grid">

          <div className="da-summary-card">
            <div className="da-card-icon">📦</div>
            <span className="da-card-label">Total Equipment</span>
            <span className="da-card-value">
              {summary.totalEquipment}
            </span>
          </div>

          <div className="da-summary-card">
            <div className="da-card-icon">📈</div>
            <span className="da-card-label">Average Utilization</span>
            <span className="da-card-value">
              {summary.averageUtilization}%
            </span>
          </div>

          <div className="da-summary-card">
            <div className="da-card-icon">🔥</div>
            <span className="da-card-label">Most Requested</span>
            <span className="da-card-value">
              {summary.mostRequestedEquipment}
            </span>
          </div>

          <div className="da-summary-card">
            <div className="da-card-icon">🟢</div>
            <span className="da-card-label">Highest Utilization</span>
            <span className="da-card-value">
              {summary.highestUtilizationEquipment}
            </span>
          </div>

          <div className="da-summary-card">
            <div className="da-card-icon">🔴</div>
            <span className="da-card-label">Lowest Utilization</span>
            <span className="da-card-value">
              {summary.lowestUtilizationEquipment}
            </span>
          </div>

        </div>
      )}

      <div className="da-table-section">

      <div className="da-recommendation-section">

  <h2 className="da-section-title">
    Smart Recommendations
  </h2>

  <div className="da-recommendation-grid">

    <div className="da-recommendation-card high">
      <h3>🔥 High Demand Equipment</h3>
      <p>
        {summary?.mostRequestedEquipment || "N/A"}
      </p>
    </div>

    <div className="da-recommendation-card warning">
      <h3>⚠️ Underutilized Equipment</h3>
      <p>
        {summary?.lowestUtilizationEquipment || "N/A"}
      </p>
    </div>

    <div className="da-recommendation-card info">
      <h3>💡 Resource Sharing</h3>
      <p>
        Consider sharing underutilized equipment
        with other institutions.
      </p>
    </div>

  </div>

</div>

  <h2 className="da-section-title">
    Equipment Demand Overview
  </h2>

  <div className="da-table-card">

    <table className="da-table">

      <thead>
        <tr>
          <th>Equipment</th>
          <th>Bookings</th>
          <th>Utilization</th>
          <th>Demand</th>
          <th>Recommendation</th>
        </tr>
      </thead>

      <tbody>

        {utilizationData.map((item, index) => {

          let demand = "Low";
          let recommendation = "Normal";

          if (item.bookingCount >= 10) {
            demand = "High";
            recommendation = "Purchase More Units";
          } else if (item.bookingCount >= 5) {
            demand = "Medium";
            recommendation = "Monitor Usage";
          }

          return (
            <tr key={index}>

              <td>{item.equipmentName}</td>

              <td>{item.bookingCount}</td>

              <td>{item.utilizationPercentage}%</td>

              <td>
                <span
                  className={`da-demand-badge ${demand.toLowerCase()}`}
                >
                  {demand}
                </span>
              </td>

              <td>{recommendation}</td>

            </tr>
          );
        })}

      </tbody>

    </table>

  </div>

</div>

        <p style={{ marginTop: "30px", fontWeight: "bold" }}>
  Total Records: {utilizationData.length}
</p>

<div className="da-chart-section">

  <h2 className="da-section-title">
    Top 5 Frequently Requested Equipment
  </h2>

  <div className="da-chart-card">
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={topRequestedEquipment}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="equipmentName" />

        <YAxis allowDecimals={false} />

        <Tooltip
  cursor={{ fill: "#f1f5f9" }}
  contentStyle={{
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
  }}
/>

        <Bar
         
  dataKey="bookingCount"
  radius={[10, 10, 0, 0]}
>
  {topRequestedEquipment.map((entry, index) => {
    const colors = [
        "#ef4444",
      "#f97316",
      "#facc15",
      "#22c55e",
      "#3b82f6"
    ];

    return (
      <Cell
        key={index}
        fill={colors[index % colors.length]}
      />
    );
  })}
    

   <LabelList
    dataKey="bookingCount"
    position="top"
    style={{
      fill: "#1e293b",
      fontWeight: 600,
      fontSize: 12
    }}
  />

</Bar>
        
      </BarChart>
    </ResponsiveContainer>
  </div>

</div>

<p style={{ fontWeight: "bold" }}>
  Top Requested: {topRequestedEquipment.length}
</p>

    </div>
  );
}

export default DemandAnalysis;