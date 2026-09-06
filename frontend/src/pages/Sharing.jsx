import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAllEquipment } from "../services/equipmentService";

import {
  getCurrentUserInfo,
  createAccessRequest,
  getMyAccessRequests,
  getPendingAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from "../services/sharingService";
import { isAdmin } from "../utils/auth";
import "./Sharing.css";

export default function Sharing() {
  const [me, setMe] = useState(null);
  const [otherInstitutionEquipment, setOtherInstitutionEquipment] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [reasonDrafts, setReasonDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const userIsAdmin = isAdmin();

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const meData = await getCurrentUserInfo();
      setMe(meData);

      const allEquipment = await getAllEquipment();
      const outside = allEquipment.filter(
        (eq) => eq.institution?.institutionId !== meData.institutionId
      );
      setOtherInstitutionEquipment(outside);

      const myReqs = await getMyAccessRequests();
      setMyRequests(myReqs);

      if (userIsAdmin) {
        try {
          const pending = await getPendingAccessRequests();
          setPendingRequests(pending);
        } catch {
          setPendingRequests([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getRequestStatusFor(equipmentId) {
    const req = myRequests.find((r) => r.equipmentId === equipmentId);
    return req ? req.status : null;
  }

  async function handleRequestAccess(equipmentId) {
    const reason = reasonDrafts[equipmentId] || "";
    if (reason.trim() === "") {
      alert("Please enter a reason for your request.");
      return;
    }
    try {
      await createAccessRequest({ equipmentId, reason });
      alert("Access request submitted.");
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request.");
    }
  }

  async function handleApprove(id) {
    try {
      await approveAccessRequest(id);
      alert("Request approved.");
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve request.");
    }
  }

  async function handleReject(id) {
    try {
      await rejectAccessRequest(id);
      alert("Request rejected.");
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request.");
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside className="sidebar">
          <Sidebar />
        </aside>
        <main style={{ flex: 1, padding: "30px" }}>
          <p>Loading sharing data...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="sharing-wrapper">
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <main style={{ flex: 1, padding: "30px" }}>
        <h2 style={{ marginBottom: "6px", fontSize: "24px", fontWeight: 700, color: "#fff" }}>
          Inter-institution sharing
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "28px", fontSize: "14px" }}>
          Your institution: <strong style={{ color: "#fff" }}>{me?.institutionName || "—"}</strong>
        </p>

        {userIsAdmin && (
          <section style={{ marginBottom: "35px" }}>
            <h5 style={{ marginBottom: "15px" }}>Pending requests to review</h5>
            <div style={{ background: "#2fd158", borderRadius: "12px", padding: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
              {pendingRequests.length === 0 && <p style={{ padding: "15px" }}>No pending requests.</p>}
              {pendingRequests.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div>
                    <strong>{r.requestingUserName}</strong> wants access to{" "}
                    <strong>{r.equipmentName}</strong>
                    <div style={{ fontSize: "13px", color: "#999" }}>{r.reason}</div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn btn-dark" onClick={() => handleApprove(r.id)}>
                      Approve
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => handleReject(r.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: "35px" }}>
          <h3 style={{ marginBottom: "16px", fontSize: "15px", fontWeight: 600, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Equipment from other institutions
          </h3>
          <div className="equipment-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {otherInstitutionEquipment.length === 0 && <p style={{ color: "#94a3b8" }}>No equipment from other institutions found.</p>}
            {otherInstitutionEquipment.map((eq) => {
              const status = getRequestStatusFor(eq.equipmentId);
              return (
                <div key={eq.equipmentId} className="sharing-equipment-card" style={{ background: "#111827", borderRadius: "12px", padding: "18px", border: "1px solid #1f2937" }}>
                  <h6 style={{ marginTop: "0", color: "#fff", fontSize: "16px" }}>{eq.name}</h6>
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>{eq.institution?.institutionName}</p>

                  {status === "APPROVED" && (
                    <span className="badge bg-success rounded-pill">Access granted</span>
                  )}
                  {status === "PENDING" && (
                    <span className="badge bg-warning rounded-pill">Request pending</span>
                  )}
                  {status === "REJECTED" && (
                    <span className="badge bg-secondary rounded-pill">Request rejected</span>
                  )}

                  {!status && (
                    <>
                      <textarea
                        placeholder="Reason for access request"
                        value={reasonDrafts[eq.equipmentId] || ""}
                        onChange={(e) =>
                          setReasonDrafts((prev) => ({ ...prev, [eq.equipmentId]: e.target.value }))
                        }
                        style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
                        rows={2}
                      />
                      <button
                        className="btn btn-dark w-100 mt-2"
                        onClick={() => handleRequestAccess(eq.equipmentId)}
                      >
                        Request access
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

       <section>
          <h3 style={{ marginBottom: "16px", fontSize: "15px", fontWeight: 600, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            My requests
          </h3>
          <div style={{ background: "#111827", borderRadius: "12px", padding: "6px", border: "1px solid #1f2937" }}>
            {myRequests.length === 0 && <p style={{ padding: "15px", color: "#94a3b8" }}>You haven't requested access to anything yet.</p>}
            {myRequests.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <strong>{r.equipmentName}</strong>
                  <div style={{ fontSize: "13px", color: "#999" }}>{r.owningInstitutionName}</div>
                </div>
                <span
                  className="badge rounded-pill"
                  style={{
                    background:
                      r.status === "APPROVED" ? "#22c55e" : r.status === "REJECTED" ? "#94a3b8" : "#f59e0b",
                    color: "#fff",
                    padding: "6px 14px",
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
