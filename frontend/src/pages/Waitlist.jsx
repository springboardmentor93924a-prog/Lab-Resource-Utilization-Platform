import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Waitlist.css";

function Waitlist() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    equipmentId: "",
    requestedStartTime: "",
    requestedEndTime: "",
  });

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  // Lab Technician can view all waitlist entries (per the backend's
  // GET /api/waitlist) but is not permitted to join or cancel one — the
  // "my waitlist" endpoint below is only for roles that can actually
  // hold a waitlist entry themselves.
  const isTechnicianView = role === "LAB_TECHNICIAN";

  const fetchMyWaitlist = () => {
    const url = isTechnicianView
      ? "http://localhost:8080/api/waitlist"
      : "http://localhost:8080/api/waitlist/my";

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch waitlist entries");
        }
        return response.json();
      })
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Waitlist error:", error);
        setLoading(false);
      });
  };

  const fetchEquipmentList = () => {
    fetch("http://localhost:8080/api/equipment", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setEquipmentList)
      .catch((err) => console.error("Equipment list error:", err));
  };

  // replace:
useEffect(() => {
  fetchMyWaitlist();
  fetchEquipmentList();

  const interval = setInterval(fetchMyWaitlist, 15000);
  return () => clearInterval(interval);
}, []);

// with:
useEffect(() => {
  fetchMyWaitlist();
  fetchEquipmentList();

  const prefillId = searchParams.get("equipmentId");
  if (prefillId && !isTechnicianView) {
    setFormData((prev) => ({ ...prev, equipmentId: prefillId }));
    setShowForm(true);
  }

  const interval = setInterval(fetchMyWaitlist, 15000);
  return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      requestedStartTime: "",
      requestedEndTime: "",
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const waitlistData = {
      equipment: {
        equipmentId: Number(formData.equipmentId),
      },
      requestedStartTime: formData.requestedStartTime,
      requestedEndTime: formData.requestedEndTime,
    };

    try {
      const response = await fetch("http://localhost:8080/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(waitlistData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to join waitlist");
      }

      resetForm();
      fetchMyWaitlist();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/waitlist/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to cancel waitlist entry");
      }

      fetchMyWaitlist();
    } catch (error) {
      alert(error.message);
    }
  };

  // Handles the two-button response to the "couldn't allocate your
  // slot" notification (entry.waitlistStatus === "AWAITING_DECISION").
  // REBOOK closes this entry out and reopens the join-waitlist form,
  // prefilled for the same equipment, so the user can pick a fresh
  // time window. EXIT just closes the entry (CANCELLED) and refreshes.
  const handleDecision = async (entry, decision) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/waitlist/${entry.waitlistId}/decide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decision }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to record your decision");
      }

      if (decision === "REBOOK") {
        setFormData((prev) => ({
          ...prev,
          equipmentId: String(entry.equipment?.equipmentId || ""),
          requestedStartTime: "",
          requestedEndTime: "",
        }));
        setShowForm(true);
      }

      fetchMyWaitlist();
    } catch (error) {
      alert(error.message);
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "WAITING":
        return "waitlist-status pending";
      case "NOTIFIED":
        return "waitlist-status notified";
      case "AWAITING_DECISION":
        return "waitlist-status awaiting-decision";
      case "FULFILLED":
        return "waitlist-status confirmed";
      case "CANCELLED":
        return "waitlist-status cancelled";
      default:
        return "waitlist-status";
    }
  };

  if (loading) {
    return <div className="waitlist-container">Loading waitlist...</div>;
  }

  return (
    <div className="waitlist-container">
      <div className="waitlist-header">
        <div>
          <h2>{isTechnicianView ? "All Waitlist Entries" : "My Waitlist"}</h2>
          <p>
            {isTechnicianView
              ? "Every equipment waitlist entry across the platform."
              : "Track equipment you're waiting on, or join a new waitlist."}
          </p>
        </div>
        {!isTechnicianView && (
          <button
            className="add-waitlist-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Join Waitlist"}
          </button>
        )}
      </div>

      {showForm && !isTechnicianView && (
        <div className="waitlist-form-card">
          <form onSubmit={handleSubmit} className="waitlist-form">
            <div className="waitlist-form-group">
              <label>Equipment</label>
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Equipment --</option>
                {equipmentList.map((item) => (
                  <option key={item.equipmentId} value={item.equipmentId}>
                    {item.equipmentName} ({item.status})
                    {item.institution?.institutionName
                      ? ` — ${item.institution.institutionName}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="waitlist-form-group">
              <label>Requested Start Time</label>
              <input
                type="datetime-local"
                name="requestedStartTime"
                value={formData.requestedStartTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="waitlist-form-group">
              <label>Requested End Time</label>
              <input
                type="datetime-local"
                name="requestedEndTime"
                value={formData.requestedEndTime}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-waitlist-btn">
              Submit
            </button>
          </form>
        </div>
      )}

      <div className="waitlist-table-card">
        {entries.length === 0 ? (
          <div className="waitlist-empty">
            {isTechnicianView
              ? "No waitlist entries right now."
              : "You're not on any waitlists right now."}
          </div>
        ) : (
          <table className="waitlist-table">
            <thead>
              <tr>
                <th>Equipment</th>
                {isTechnicianView && <th>Requested By</th>}
                <th>Requested Start</th>
                <th>Requested End</th>
                <th>Status</th>
                {!isTechnicianView && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.waitlistId}>
                  <td className="equipment-name">
                    {entry.equipment?.equipmentName}
                  </td>
                  {isTechnicianView && (
                    <td>{entry.user?.fullName || "—"}</td>
                  )}
                  <td>{entry.requestedStartTime?.replace("T", " ")}</td>
                  <td>{entry.requestedEndTime?.replace("T", " ")}</td>
                  <td>
                    <span className={statusClass(entry.waitlistStatus)}>
                      {entry.waitlistStatus}
                    </span>
                  </td>
                  {!isTechnicianView && (
                    <td>
                      {entry.waitlistStatus === "WAITING" && (
                        <button
                          className="cancel-waitlist-btn"
                          onClick={() => handleCancel(entry.waitlistId)}
                        >
                          Cancel
                        </button>
                      )}
                      {entry.waitlistStatus === "AWAITING_DECISION" && (
                        <div className="decision-actions">
                          <p className="decision-note">
                            We couldn't allocate this slot — your requested
                            time already passed. Decide before{" "}
                            {entry.requestedEndTime?.replace("T", " ")}.
                          </p>
                          <button
                            className="rebook-btn"
                            onClick={() => handleDecision(entry, "REBOOK")}
                          >
                            Book Another Slot
                          </button>
                          <button
                            className="exit-waitlist-btn"
                            onClick={() => handleDecision(entry, "EXIT")}
                          >
                            Exit
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Waitlist;