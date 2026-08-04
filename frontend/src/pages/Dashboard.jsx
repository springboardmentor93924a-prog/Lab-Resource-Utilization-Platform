import "./Dashboard.css";
import { useEffect, useState } from "react";

function Dashboard() {
console.log("DASHBOARD COMPONENT LOADED");
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/equipment", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Equipment request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEquipment(data);
      })
      .catch((error) => {
        console.error("Equipment error:", error);
      });


    fetch("http://localhost:8080/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Users request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Users error:", error);
      });

  }, []);


  const totalEquipment = equipment.length;

  const availableEquipment = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const reservedEquipment = equipment.filter(
    (item) => item.status === "Reserved"
  ).length;


  return (
    <div className="dashboard">

      <h2>Dashboard</h2>

      <div className="cards">

        <div className="card">
          <h3>Total Equipment</h3>
          <p>{totalEquipment}</p>
        </div>

        <div className="card">
          <h3>Available</h3>
          <p>{availableEquipment}</p>
        </div>

        <div className="card">
          <h3>Reserved</h3>
          <p>{reservedEquipment}</p>
        </div>

        <div className="card">
          <h3>Users</h3>
          <p>{users.length}</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
