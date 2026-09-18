import { useEffect, useState } from "react";
import {
  getAllSharingRequests,
  createSharingRequest,
  approveSharingRequest,
  rejectSharingRequest,
} from "../api/sharingApi";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import {
  page, headerRow, h1Style, subStyle, card, filterBar, selectStyle, thStyle, tdStyle,
  actionBtn, primaryBtn, cancelBtn, modalOverlay, modalCard, labelStyle, inputStyle,
  errorText, emptyText, pill,
} from "../styles/shared";

const CREATE_ROLES = ["RESEARCHER", "LAB_MANAGER", "DEPARTMENT_HEAD"];
const MANAGE_ROLES = ["LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN"];

function ResourceSharing({ userRole, showToast }) {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");

  const canManage = MANAGE_ROLES.includes(userRole);
  const canCreate = CREATE_ROLES.includes(userRole);

  const load = () => {
    if (!canManage) { setLoading(false); return; }
    setLoading(true);
    getAllSharingRequests()
      .then(setRequests)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load sharing requests.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getAllEquipment().then(setEquipment).catch(() => setEquipment([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = requests.filter((r) => statusFilter === "All" || r.status === statusFilter);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSharingRequest(Number(equipmentId));
      showToast?.("Sharing request submitted.", "success");
      setEquipmentId("");
      setShowForm(false);
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to submit sharing request."), "warning");
    }
  };

  const runAction = async (action, r, successMsg) => {
    try {
      await action(r.requestId);
      showToast?.(successMsg, "success");
      load();
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Action failed."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Cross-Institution Resource Sharing</h1>
          <p style={subStyle}>
            Request use of equipment that belongs to another institution
          </p>
        </div>
        {canCreate && <button onClick={() => setShowForm(true)} style={primaryBtn}>+ Request Equipment Access</button>}
      </div>

      {error && <p style={errorText}>{error}</p>}

      {canManage ? (
        <div style={card}>
          <div style={filterBar}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <p style={{ padding: 20 }}>Loading requests...</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Equipment</th>
                    <th style={thStyle}>Requesting Institution</th>
                    <th style={thStyle}>Requested By</th>
                    <th style={thStyle}>Requested At</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.requestId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                      <td style={tdStyle}>#{r.requestId}</td>
                      <td style={tdStyle}>{r.equipmentName}</td>
                      <td style={tdStyle}>{r.requestingInstitutionName}</td>
                      <td style={tdStyle}>#{r.requestedById}</td>
                      <td style={tdStyle}>{r.requestedAt ? new Date(r.requestedAt).toLocaleString() : "-"}</td>
                      <td style={tdStyle}>
                        <span style={r.status === "APPROVED" ? pill("#e8f7ee", "#16834b") : r.status === "REJECTED" ? pill("#fdecec", "#c0392b") : pill("#fff4df", "#b56a00")}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, display: "flex", gap: 6 }}>
                        {r.status === "PENDING" && (
                          <>
                            <button onClick={() => runAction(approveSharingRequest, r, `Request #${r.requestId} approved.`)} style={{ ...actionBtn, color: "#16834b" }}>Approve</button>
                            <button onClick={() => runAction(rejectSharingRequest, r, `Request #${r.requestId} rejected.`)} style={{ ...actionBtn, color: "#c0392b" }}>Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={emptyText}>No sharing requests found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div style={card}>
          <p style={emptyText}>
            You can submit new sharing requests above. Only Lab Managers, Department Heads,
            and Institution Admins can view and act on the full request list.
          </p>
        </div>
      )}

      {showForm && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>Request Equipment Access</h2>
              <button onClick={() => setShowForm(false)} style={{ border: "none", background: "none", fontSize: 19, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Equipment</label>
                <select required value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} style={inputStyle}>
                  <option value="">Select equipment</option>
                  {equipment.map((eq) => (
                    <option key={eq.equipmentId} value={eq.equipmentId}>
                      {eq.equipmentName} ({eq.institutionName})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20 }}>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" style={primaryBtn}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceSharing;
