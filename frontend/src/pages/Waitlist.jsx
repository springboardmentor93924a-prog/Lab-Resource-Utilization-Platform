import { useEffect, useState } from "react";
import "./Waitlist.css";

function Waitlist() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: "",
    requestedStartTime: "",
    requestedEndTime: "",
  });

  const token = localStorage.getItem("token");

  const fetchMyWaitlist = () => {
    fetch("http://localhost:8080/api/waitlist/my", {
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

  useEffect(() => {
    fetchMyWaitlist();
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

  const statusClass = (status) => {
    switch (status) {
      case "WAITING":
        return "waitlist-status pending";
      case "NOTIFIED":
        return "waitlist-status notified";
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
          <h2>My Waitlist</h2>
          <p>Track equipment you're waiting on, or join a new waitlist.</p>
        </div>
        <button
          className="add-waitlist-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Join Waitlist"}
        </button>
      </div>

      {showForm && (
        <div className="waitlist-form-card">
          <form onSubmit={handleSubmit} className="waitlist-form">
            <div className="waitlist-form-group">
              <label>Equipment ID</label>
              <input
                type="number"
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                required
              />
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
            You're not on any waitlists right now.
          </div>
        ) : (
          <table className="waitlist-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Requested Start</th>
                <th>Requested End</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.waitlistId}>
                  <td className="equipment-name">
                    {entry.equipment?.equipmentName}
                  </td>
                  <td>{entry.requestedStartTime?.replace("T", " ")}</td>
                  <td>{entry.requestedEndTime?.replace("T", " ")}</td>
                  <td>
                    <span className={statusClass(entry.waitlistStatus)}>
                      {entry.waitlistStatus}
                    </span>
                  </td>
                  <td>
                    {entry.waitlistStatus === "WAITING" && (
                      <button
                        className="cancel-waitlist-btn"
                        onClick={() => handleCancel(entry.waitlistId)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
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