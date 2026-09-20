import { useState } from "react";
import "../styles/equipment.css";

function Equipment() {

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const equipments = [
    {
      id: 1,
      name: "Computer-01",
      lab: "AI Laboratory",
      status: "Available",
    },
    {
      id: 2,
      name: "Projector",
      lab: "Cloud Lab",
      status: "Booked",
    },
    {
      id: 3,
      name: "Arduino Kit",
      lab: "IoT Lab",
      status: "In Use",
    },
    {
      id: 4,
      name: "3D Printer",
      lab: "Innovation Lab",
      status: "Maintenance",
    },
  ];

  const filteredEquipment = equipments.filter((item) => {

    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="equipment-container">

      <h1>Equipment Utilization</h1>

      <p>
        Monitor laboratory equipment availability in real time
      </p>

      <div className="equipment-controls">

        <input
          type="text"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Available</option>
          <option>Booked</option>
          <option>In Use</option>
          <option>Maintenance</option>
        </select>

      </div>

      <div className="equipment-grid">

        {filteredEquipment.map((item) => (

          <div className="equipment-card" key={item.id}>

            <h2>{item.name}</h2>

            <p>{item.lab}</p>

            <span
              className={`status ${item.status
                .replace(" ", "")
                .toLowerCase()}`}
            >
              {item.status}
            </span>

            <button>
              {item.status === "Available"
                ? "Book Now"
                : "Unavailable"}
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Equipment;