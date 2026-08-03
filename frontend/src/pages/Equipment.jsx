 import { useState, useEffect } from "react";
import axios from "axios";
import "./Equipment.css";

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Fetch equipment function defined inside useEffect to avoid synchronous state warnings
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/equipment", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEquipmentList(response.data);
      } catch (error) {
        console.error("Failed to fetch equipment data", error);
      }
    };

    fetchEquipment();
  }, []);

  return (
    <div className="container">
      <h2>Equipment Management</h2>

      <div className="top-bar">
        <input
          className="search-box"
          type="text"
          placeholder="Search equipment..."
        />

        {/* Show Add Equipment button only for Admin */}
        {userRole === "ROLE_ADMIN" && (
          <button className="add-btn">
            Add Equipment
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Status</th>
            {userRole === "ROLE_ADMIN" && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {equipmentList.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.status}</td>

              {/* Show Edit and Delete buttons only for Admin */}
              {userRole === "ROLE_ADMIN" && (
                <td>
                  <button className="edit-btn">
                    Edit
                  </button>

                  <button className="delete-btn">
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}