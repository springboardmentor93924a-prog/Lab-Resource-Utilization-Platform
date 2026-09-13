import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getCostSummary, getBookingsWithCost, getMonthlyReport } from "../services/costService";

export default function CostBilling() {
   const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
                const [s, b, m] = await Promise.all([getCostSummary(), getBookingsWithCost(), getMonthlyReport()]);
        setSummary(s);
        setBookings(b);
        setMonthlyReport(m);
      } catch (err) {
        console.error(err);
        setError("Unable to load cost data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020b1c", color: "#fff" }}>
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
          Cost & billing
        </h2>

        {loading && <p>Loading cost data...</p>}
        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        {!loading && !error && summary && (
          <>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px", minWidth: "220px" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Total cost</p>
                <p style={{ fontSize: "26px", fontWeight: 700 }}>{"\u20B9"}{Number(summary.totalCost).toFixed(2)}</p>
              </div>
              <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px", minWidth: "220px" }}>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "6px" }}>Completed bookings</p>
                <p style={{ fontSize: "26px", fontWeight: 700 }}>{summary.completedBookings}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "300px", background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px" }}>
                <h4 style={{ marginBottom: "12px", fontSize: "15px" }}>Cost by department</h4>
                {Object.keys(summary.byDepartment).length === 0 && <p style={{ color: "#94a3b8" }}>No data yet.</p>}
                {Object.entries(summary.byDepartment).map(([dept, cost]) => (
                  <div key={dept} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
                    <span>{dept}</span>
                    <span>{"\u20B9"}{Number(cost).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, minWidth: "300px", background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px" }}>
                <h4 style={{ marginBottom: "12px", fontSize: "15px" }}>Cost by equipment</h4>
                {Object.keys(summary.byEquipment).length === 0 && <p style={{ color: "#94a3b8" }}>No data yet.</p>}
                {Object.entries(summary.byEquipment).map(([eq, cost]) => (
                  <div key={eq} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1f2937" }}>
                    <span>{eq}</span>
                    <span>{"\u20B9"}{Number(cost).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <h4 style={{ marginBottom: "12px", fontSize: "15px" }}>All booking costs</h4>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0F1B2D" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Equipment</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Department</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "16px", color: "#94a3b8" }}>No booking costs yet.</td></tr>
                  )}
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderTop: "1px solid #1f2937" }}>
                      <td style={{ padding: "12px 16px" }}>{b.id}</td>
                      <td style={{ padding: "12px 16px" }}>{b.equipmentName}</td>
                      <td style={{ padding: "12px 16px" }}>{b.departmentName || "-"}</td>
                      <td style={{ padding: "12px 16px" }}>{b.status}</td>
                      <td style={{ padding: "12px 16px" }}>{"\u20B9"}{Number(b.cost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                           </table>
            </div>

            <h4 style={{ marginBottom: "12px", marginTop: "30px", fontSize: "15px" }}>Monthly report</h4>
            {monthlyReport.length === 0 && <p style={{ color: "#94a3b8" }}>No monthly data yet.</p>}
            {monthlyReport.map((m) => (
              <div key={m.month} style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                  <h5 style={{ margin: 0 }}>{m.month}</h5>
                  <span style={{ color: "#94a3b8" }}>{m.equipmentBookedCount} equipment booked · Total: ₹{Number(m.totalCost).toFixed(2)}</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#0F1B2D" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>User</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Paid</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.byUser.map((u) => (
                      <tr key={u.userId} style={{ borderTop: "1px solid #1f2937" }}>
                        <td style={{ padding: "10px 14px" }}>{u.userName}</td>
                        <td style={{ padding: "10px 14px", color: "#22c55e" }}>₹{Number(u.paid).toFixed(2)}</td>
                        <td style={{ padding: "10px 14px", color: "#f59e0b" }}>₹{Number(u.pending).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: "flex", gap: "20px", marginTop: "18px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <h6 style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "13px" }}>By department</h6>
                    {Object.entries(m.byDepartment || {}).map(([dept, cost]) => (
                      <div key={dept} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1f2937", fontSize: "14px" }}>
                        <span>{dept}</span>
                        <span>₹{Number(cost).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <h6 style={{ marginBottom: "8px", color: "#94a3b8", fontSize: "13px" }}>By institution</h6>
                    {Object.entries(m.byInstitution || {}).map(([inst, cost]) => (
                      <div key={inst} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1f2937", fontSize: "14px" }}>
                        <span>{inst}</span>
                        <span>₹{Number(cost).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
         
