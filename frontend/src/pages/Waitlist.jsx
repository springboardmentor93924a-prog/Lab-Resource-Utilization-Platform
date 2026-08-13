import { useEffect, useState } from "react";

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
        throw new Error("Failed to join waitlist");
      }

      resetForm();
      fetchMyWaitlist();
    } catch (error) {
      console.error("Join waitlist error:", error);
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
        throw new Error("Failed to cancel waitlist entry");
      }

      fetchMyWaitlist();
    } catch (error) {
      console.error("Cancel waitlist error:", error);
    }
  };

  if (loading) return <p>Loading waitlist...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Waitlist</h2>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Join Waitlist"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ margin: "16px 0" }}>
          <div>
            <label>Equipment ID:</label>
            <input
              type="number"
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Requested Start Time:</label>
            <input
              type="datetime-local"
              name="requestedStartTime"
              value={formData.requestedStartTime}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Requested End Time:</label>
            <input
              type="datetime-local"
              name="requestedEndTime"
              value={formData.requestedEndTime}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      )}

      <table border="1" cellPadding="8" style={{ marginTop: "16px" }}>
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
              <td>{entry.equipment?.equipmentName}</td>
              <td>{entry.requestedStartTime}</td>
              <td>{entry.requestedEndTime}</td>
              <td>{entry.waitlistStatus}</td>
              <td>
                {entry.waitlistStatus === "WAITING" && (
                  <button onClick={() => handleCancel(entry.waitlistId)}>
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Waitlist;