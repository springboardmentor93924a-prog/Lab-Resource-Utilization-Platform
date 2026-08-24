import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./AnalyticsDashboard.css";

const API_BASE_URL = "http://localhost:8080/api";

const STATUS_COLORS = {
  Completed: "#22c55e",
  Confirmed: "#0ea5e9",
  "Pending Approval": "#f59e0b",
  Cancelled: "#ef4444",
  Rejected: "#94a3b8",
};

const FALLBACK_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  const fetchAnalytics = useCallback(async () => {
    try {
      setError("");

      const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to load analytics dashboard.");
      }

      setData(await res.json());
    } catch (err) {
      console.error(err);
      setError(
        "Could not load the analytics dashboard. Please try again shortly."
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="analytics-container">
        <p>Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="analytics-container">
        <div className="analytics-banner">{error}</div>
      </div>
    );
  }

  const bookingStatusData = data.bookingStatusBreakdown
    ? Object.entries(data.bookingStatusBreakdown).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2 className="analytics-title">Analytics Dashboard</h2>
        <p className="analytics-subtitle">
          Utilization, cost and booking trends combined - built on Tasks 1,
          2 and 3.
        </p>
      </div>

      {error && <div className="analytics-banner">{error}</div>}

      <div className="analytics-highlights">
        <span className="analytics-highlight-pill">
          Most requested: {data.mostRequestedEquipment || "N/A"}
        </span>
        <span className="analytics-highlight-pill">
          Highest utilization: {data.highestUtilizationEquipment || "N/A"}
        </span>
        <span className="analytics-highlight-pill">
          Most expensive: {data.mostExpensiveEquipment || "N/A"}
        </span>
      </div>

      <div className="analytics-cards">
        <div className="analytics-card util">
          <span className="analytics-card-label">Avg Utilization</span>
          <p className="analytics-card-value">
            {Number(data.averageUtilization || 0).toFixed(1)}%
          </p>
          <div className="analytics-card-sub">
            Across {data.totalEquipment} equipment
          </div>
        </div>

        <div className="analytics-card booking">
          <span className="analytics-card-label">Total Bookings</span>
          <p className="analytics-card-value">{data.totalBookings}</p>
        </div>

        <div className="analytics-card cost">
          <span className="analytics-card-label">Total Cost</span>
          <p className="analytics-card-value">
            {formatCurrency(data.totalCost)}
          </p>
        </div>

        <div className="analytics-card pending">
          <span className="analytics-card-label">Pending Cost</span>
          <p className="analytics-card-value">
            {formatCurrency(data.pendingCost)}
          </p>
          <div className="analytics-card-sub">
            Paid: {formatCurrency(data.paidCost)}
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Top utilized equipment */}
        <div className="analytics-section">
          <h3>Top Utilized Equipment</h3>
          <p className="analytics-section-desc">
            Highest utilization percentage over the last 7 days.
          </p>

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.topUtilizedEquipment || []}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="equipmentName"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}%`,
                    "Utilization",
                  ]}
                />
                <Bar dataKey="utilizationPercentage" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top equipment by cost */}
        <div className="analytics-section">
          <h3>Top Equipment by Cost</h3>
          <p className="analytics-section-desc">
            Total billed cost so far, highest first.
          </p>

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.topEquipmentByCost || []}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="equipmentName"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), "Cost"]} />
                <Bar dataKey="totalCost" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly cost trend */}
        <div className="analytics-section">
          <h3>Monthly Cost Trend</h3>
          <p className="analytics-section-desc">
            Total billed cost per month.
          </p>

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={data.monthlyCostTrend || []}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), "Cost"]} />
                <Line
                  type="monotone"
                  dataKey="totalCost"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly booking trend */}
        <div className="analytics-section">
          <h3>Monthly Booking Trend</h3>
          <p className="analytics-section-desc">
            Total vs completed bookings per month.
          </p>

          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={data.monthlyBookingTrend || []}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalBookings"
                  name="Total"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completedBookings"
                  name="Completed"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking status breakdown */}
        <div className="analytics-section">
          <h3>Booking Status Breakdown</h3>
          <p className="analytics-section-desc">
            Share of bookings by current status.
          </p>

          <div className="analytics-chart-container">
            {bookingStatusData.length === 0 ? (
              <div className="analytics-empty-state">
                No booking data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          STATUS_COLORS[entry.name] ||
                          FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cost by department table */}
        <div className="analytics-section">
          <h3>Cost by Department</h3>
          <p className="analytics-section-desc">
            Allocated equipment usage cost by department.
          </p>

          <table className="analytics-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Allocations</th>
                <th>Total Allocated</th>
              </tr>
            </thead>
            <tbody>
              {!data.costByDepartment || data.costByDepartment.length === 0 ? (
                <tr>
                  <td colSpan="3" className="analytics-empty-state">
                    No department cost data yet.
                  </td>
                </tr>
              ) : (
                data.costByDepartment.map((item) => (
                  <tr key={item.departmentId}>
                    <td>{item.departmentName}</td>
                    <td>{item.allocationCount}</td>
                    <td>{formatCurrency(item.totalAllocatedCost)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
