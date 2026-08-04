import { useEffect, useState } from "react";

function Reservations() {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("http://localhost:8080/api/bookings", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  }, []);


  if (loading) {
    return <h2>Loading reservations...</h2>;
  }


  return (
    <div style={{ padding: "20px" }}>

      <h2>Reservations</h2>

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
            <th style={cellStyle}>Booking Date</th>
            <th style={cellStyle}>Start Time</th>
            <th style={cellStyle}>End Time</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Purpose</th>
          </tr>
        </thead>

        <tbody>

          {bookings.map((booking) => (

            <tr key={booking.bookingId}>

              <td style={cellStyle}>
                {booking.bookingId}
              </td>

              <td style={cellStyle}>
                {booking.user?.fullName}
              </td>

              <td style={cellStyle}>
                {booking.equipment?.equipmentName}
              </td>

              <td style={cellStyle}>
                {booking.bookingDate}
              </td>

              <td style={cellStyle}>
                {booking.startTime}
              </td>

              <td style={cellStyle}>
                {booking.endTime}
              </td>

              <td style={cellStyle}>
                {booking.bookingStatus}
              </td>

              <td style={cellStyle}>
                {booking.purpose}
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


export default Reservations;
