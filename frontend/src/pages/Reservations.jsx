import { useEffect, useState } from "react";

function Reservations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    equipmentId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  const token = localStorage.getItem("token");

  const fetchBookings = () => {
    fetch("http://localhost:8080/api/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        return response.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Booking error:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
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
      bookingDate: "",
      startTime: "",
      endTime: "",
      purpose: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      equipment: {
        equipmentId: Number(formData.equipmentId),
      },
      bookingDate: formData.bookingDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      bookingStatus: "Pending",
    };

    try {
      const url = editingId
        ? `http://localhost:8080/api/bookings/${editingId}`
        : "http://localhost:8080/api/bookings";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(
          editingId
            ? "Failed to update booking"
            : "Failed to create booking"
        );
      }

      alert(
        editingId
          ? "Booking updated successfully"
          : "Booking created successfully"
      );

      resetForm();
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking.bookingId);

    setFormData({
      equipmentId: booking.equipment?.equipmentId || "",
      bookingDate: booking.bookingDate || "",
      startTime: booking.startTime || "",
      endTime: booking.endTime || "",
      purpose: booking.purpose || "",
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("You are not allowed to delete this booking");
      }

      alert("Booking deleted successfully");
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("You are not allowed to approve this booking");
      }

      alert("Booking approved");
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("You are not allowed to reject this booking");
      }

      alert("Booking rejected");
      fetchBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Loading reservations...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reservations</h2>

      <button
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
        style={buttonStyle}
      >
        + New Booking
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <h3>{editingId ? "Update Booking" : "Create Booking"}</h3>

          <input
            type="number"
            name="equipmentId"
            placeholder="Equipment ID"
            value={formData.equipmentId}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label>Start Time</label>

          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label>End Time</label>

          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="purpose"
            placeholder="Purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            {editingId ? "Update Booking" : "Create Booking"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
        </form>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>User</th>
            <th style={cellStyle}>Equipment</th>
            <th style={cellStyle}>Date</th>
            <th style={cellStyle}>Start</th>
            <th style={cellStyle}>End</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Purpose</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings
            .filter((booking) => booking.bookingStatus !== "Completed")
            .map((booking) => (
              <tr key={booking.bookingId}>
                <td style={cellStyle}>
                  {booking.bookingId}
                </td>

                <td style={cellStyle}>
                  {booking.user?.fullName || "-"}
                </td>

                <td style={cellStyle}>
                  {booking.equipment?.equipmentName || "-"}
                </td>

                <td style={cellStyle}>
                  {booking.bookingDate || "-"}
                </td>

                <td style={cellStyle}>
                  {booking.startTime
                    ? booking.startTime.replace("T", " ")
                    : "-"}
                </td>

                <td style={cellStyle}>
                  {booking.endTime
                    ? booking.endTime.replace("T", " ")
                    : "-"}
                </td>

                <td style={cellStyle}>
                  <strong>
                    {booking.bookingStatus === "Pending" &&
                      "⏳ Pending"}

                    {booking.bookingStatus === "Confirmed" &&
                      "✅ Confirmed"}

                    {booking.bookingStatus === "Rejected" &&
                      "❌ Rejected"}
                  </strong>
                </td>

                <td style={cellStyle}>
                  {booking.purpose || "-"}
                </td>

                <td style={cellStyle}>
                  {booking.bookingStatus === "Pending" && (
                    <>
                      <button
                        onClick={() => handleEdit(booking)}
                        style={smallButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(booking.bookingId)
                        }
                        style={smallButtonStyle}
                      >
                        Delete
                      </button>

                      <button
                        onClick={() =>
                          handleApprove(booking.bookingId)
                        }
                        style={smallButtonStyle}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleReject(booking.bookingId)
                        }
                        style={smallButtonStyle}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};

const inputStyle = {
  display: "block",
  width: "100%",
  maxWidth: "400px",
  padding: "10px",
  margin: "8px 0",
  boxSizing: "border-box",
};

const formStyle = {
  marginTop: "20px",
  marginBottom: "20px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

const buttonStyle = {
  padding: "10px 15px",
  margin: "5px",
  cursor: "pointer",
};

const smallButtonStyle = {
  padding: "6px 8px",
  margin: "2px",
  cursor: "pointer",
};

const cancelButtonStyle = {
  padding: "10px 15px",
  margin: "5px",
  cursor: "pointer",
};

export default Reservations;
