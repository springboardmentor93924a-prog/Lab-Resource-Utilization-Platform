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
        (eq) => eq.institutionId !== meData.institutionId
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
        <h4 style={{ marginBottom: "8px" }}>Inter-institution sharing</h4>
        <p style={{ color: "#ffffff", marginBottom: "25px" }}>
          Your institution: <strong>{me?.institutionName || "—"}</strong>
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
          <h6 style={{ marginBottom: "15px" }}>Equipments from other Institutions</h6>
          <div className="equipment-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {otherInstitutionEquipment.length === 0 && <p>No equipment from other institutions found.</p>}
            {otherInstitutionEquipment.map((eq) => {
              const status = getRequestStatusFor(eq.id);
              return (
                <div key={eq.id} className="equipment-card" style={{ background: "#fff", borderRadius: "12px", padding: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                  <img src={eq.imageUrl} alt={eq.equipmentName} style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "8px" }} />
                  <h6 style={{ marginTop: "10px" }}>{eq.equipmentName}</h6>
                  <p style={{ fontSize: "13px", color: "#666" }}>{eq.institutionName}</p>

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
                        value={reasonDrafts[eq.id] || ""}
                        onChange={(e) =>
                          setReasonDrafts((prev) => ({ ...prev, [eq.id]: e.target.value }))
                        }
                        style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
                        rows={2}
                      />
                      <button
                        className="btn btn-dark w-100 mt-2"
                        onClick={() => handleRequestAccess(eq.id)}
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
          <h6 style={{ marginBottom: "20px" }}>My requests</h6>
          <div style={{ background: "#26bb49", borderRadius: "12px", padding: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
            {myRequests.length === 0 && <p style={{ padding: "15px" }}>You haven't requested access to anything yet.</p>}
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