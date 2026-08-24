import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Feedback.css";

const API_BASE_URL = "http://localhost:8080/api";

// Structured reason chips instead of free text — matches the button-first
// UX used across the rest of the app. Selecting one fills the description;
// the student can still edit it afterward.
const REASON_OPTIONS = [
  "Not functioning properly",
  "Improper / inaccurate results",
  "Physical damage",
  "Missing accessory or part",
  "Unusual noise or overheating",
  "Other",
];

function Feedback() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("feedbackId");

  const [feedbackList, setFeedbackList] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: "",
    description: "",
    urgency: "NORMAL",
  });

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  const canReview = ["LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN"].includes(role);
  const isStudent = role === "STUDENT";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const requests = [fetch(`${API_BASE_URL}/equipment`, { headers: getHeaders() })];

      // EDGE CASE: students can't GET /equipment-feedback (backend restricts
      // it to tech+), so only fetch the list for roles that can see it.
      if (!isStudent) {
        requests.push(fetch(`${API_BASE_URL}/equipment-feedback`, { headers: getHeaders() }));
      }

      const results = await Promise.all(requests);
      for (const r of results) {
        if (!r.ok) throw new Error(`Failed to load: ${r.status}`);
      }

      setEquipment(await results[0].json());
      if (!isStudent) setFeedbackList(await results[1].json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReasonClick = (reason) => {
    setFormData({ ...formData, description: reason === "Other" ? "" : reason });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // EDGE CASE: don't let "Other" go through with an empty description
    if (!formData.description.trim()) {
      setError("Please select or describe the issue.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/equipment-feedback`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          equipment: { equipmentId: Number(formData.equipmentId) },
          description: formData.description,
          urgency: formData.urgency,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to submit feedback");
      }

      setShowForm(false);
      setFormData({ equipmentId: "", description: "", urgency: "NORMAL" });
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/equipment-feedback/${id}/status?status=${status}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "RESOLVED") return "badge badge-completed";
    if (status === "REVIEWED") return "badge badge-blocking";
    return "badge badge-cancelled";
  };

  return (
    <div className="feedback-page">
      {error && <div className="feedback-error">{error}</div>}

      <div className="feedback-toolbar">
        <button className="primary-btn" onClick={() => setShowForm(true)}>+ Report an Issue</button>
      </div>

      {/* EDGE CASE: students don't have a list view (backend doesn't expose
          GET /equipment-feedback to them) — show a simple confirmation state instead */}
      {isStudent ? (
        <div className="feedback-empty">
          Submitted issues are reviewed by lab staff — you'll get a notification when there's an update.
        </div>
      ) : loading ? (
        <p>Loading...</p>
      ) : feedbackList.length === 0 ? (
        <div className="feedback-empty">No feedback reported yet.</div>
      ) : (
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Description</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Reported By</th>
              {canReview && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {feedbackList.map((f) => (
              <tr key={f.feedbackId} className={String(f.feedbackId) === highlightId ? "row-highlight" : ""}>
                <td>{f.equipment?.equipmentName || "—"}</td>
                <td>{f.description}</td>
                <td><span className={f.urgency === "URGENT" ? "badge badge-cancelled" : "badge badge-blocking"}>{f.urgency}</span></td>
                <td><span className={statusBadgeClass(f.status)}>{f.status}</span></td>
                <td>{f.reportedBy?.fullName || "—"}</td>
                {canReview && (
                  <td className="feedback-actions">
                    {f.status === "PENDING" && (
                      <button className="link-btn" onClick={() => updateStatus(f.feedbackId, "REVIEWED")}>Mark Reviewed</button>
                    )}
                    {f.status !== "RESOLVED" && (
                      <button className="primary-btn small" onClick={() => updateStatus(f.feedbackId, "RESOLVED")}>Solve / Resolve</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <h3>Report an Issue</h3>

            <form onSubmit={handleSubmit}>
              <label>Equipment</label>
              <select
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                required
              >
                <option value="">Select equipment</option>
                {equipment.map((eq) => (
                  <option key={eq.equipmentId} value={eq.equipmentId}>{eq.equipmentName}</option>
                ))}
              </select>

              <label>What's wrong?</label>
              <div className="reason-btn-group">
                {REASON_OPTIONS.map((reason) => (
                  <button
                    type="button"
                    key={reason}
                    className={formData.description === reason ? "reason-btn active" : "reason-btn"}
                    onClick={() => handleReasonClick(reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Add more detail if needed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <label>Urgency</label>
              <div className="status-btn-group">
                <button
                  type="button"
                  className={formData.urgency === "NORMAL" ? "status-btn active" : "status-btn"}
                  onClick={() => setFormData({ ...formData, urgency: "NORMAL" })}
                >
                  Normal
                </button>
                <button
                  type="button"
                  className={formData.urgency === "URGENT" ? "status-btn active urgent" : "status-btn"}
                  onClick={() => setFormData({ ...formData, urgency: "URGENT" })}
                >
                  Urgent
                </button>
              </div>

              <div className="feedback-modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedback;