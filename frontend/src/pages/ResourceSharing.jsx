import { useState } from "react";
import ShareCard from "../components/ShareCard";
import "../styles/resourcesharing.css";

function ResourceSharing() {

  const [search, setSearch] = useState("");

  const [institutionFilter, setInstitutionFilter] = useState("All");

  const shareableEquipment = [
    {
      id: 1,
      name: "Projector",
      institution: "ABC Engineering College",
      status: "Available",
    },
    {
      id: 2,
      name: "Arduino Kit",
      institution: "XYZ University",
      status: "Available",
    },
    {
      id: 3,
      name: "3D Printer",
      institution: "National Engineering College",
      status: "Available",
    },
    {
      id: 4,
      name: "Oscilloscope",
      institution: "ABC Engineering College",
      status: "Available",
    },
  ];

  const receivedRequests = [
    {
      id: 1,
      institution: "XYZ University",
      equipment: "Projector",
      status: "Pending",
    },
    {
      id: 2,
      institution: "ABC Engineering College",
      equipment: "Oscilloscope",
      status: "Approved",
    },
    {
      id: 3,
      institution: "National Engineering College",
      equipment: "Arduino Kit",
      status: "Rejected",
    },
  ];

  const filteredEquipment = shareableEquipment.filter((item) => {

    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase());

    const matchInstitution =
      institutionFilter === "All" ||
      item.institution === institutionFilter;

    return matchSearch && matchInstitution;
  });

  return (
    <div className="sharing-container">

      <h1>Inter-Institution Resource Sharing</h1>

      <p>
        Share laboratory equipment between institutions and manage requests.
      </p>

      <div className="sharing-controls">

        <input
          type="text"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={institutionFilter}
          onChange={(e) => setInstitutionFilter(e.target.value)}
        >

          <option value="All">All Institutions</option>

          <option value="ABC Engineering College">
            ABC Engineering College
          </option>

          <option value="XYZ University">
            XYZ University
          </option>

          <option value="National Engineering College">
            National Engineering College
          </option>

        </select>

      </div>

      <h2 className="section-title">
        Shareable Equipment
      </h2>

      <div className="share-grid">

        {filteredEquipment.map((item) => (

          <ShareCard
            key={item.id}
            equipment={item}
          />

        ))}

      </div>

      <h2 className="section-title">
        Received Sharing Requests
      </h2>

      <div className="request-table">

        <table>

          <thead>

            <tr>
              <th>Institution</th>
              <th>Equipment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {receivedRequests.map((req) => (

              <tr key={req.id}>

                <td>{req.institution}</td>

                <td>{req.equipment}</td>

                <td>

                  <span
                    className={`status-badge ${req.status.toLowerCase()}`}
                  >
                    {req.status}
                  </span>

                </td>

                <td>

                  {req.status === "Pending" ? (

                    <div className="action-buttons">

                      <button className="approve-btn">
                        Approve
                      </button>

                      <button className="reject-btn">
                        Reject
                      </button>

                    </div>

                  ) : (

                    <span className="completed">
                      Completed
                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ResourceSharing;