import { useEffect, useState } from "react";

function Equipment() {

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("http://localhost:8080/api/equipment", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch equipment");
        }

        return response.json();
      })
      .then((data) => {
        setEquipment(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Equipment error:", error);
        setLoading(false);
      });

  }, []);


  if (loading) {
    return <h2>Loading equipment...</h2>;
  }


  return (
    <div style={{ padding: "20px" }}>

      <h2>Equipment</h2>

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
            <th style={cellStyle}>Name</th>
            <th style={cellStyle}>Category</th>
            <th style={cellStyle}>Serial Number</th>
            <th style={cellStyle}>Location</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Purchase Date</th>
          </tr>

        </thead>


        <tbody>

          {equipment.map((item) => (

            <tr key={item.equipmentId}>

              <td style={cellStyle}>
                {item.equipmentId}
              </td>

              <td style={cellStyle}>
                {item.equipmentName}
              </td>

              <td style={cellStyle}>
                {item.category}
              </td>

              <td style={cellStyle}>
                {item.serialNumber}
              </td>

              <td style={cellStyle}>
                {item.location}
              </td>

              <td style={cellStyle}>
                {item.status}
              </td>

              <td style={cellStyle}>
                {item.purchaseDate}
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


export default Equipment;
