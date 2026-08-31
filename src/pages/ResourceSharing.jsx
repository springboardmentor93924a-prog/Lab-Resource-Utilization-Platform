import { useState } from "react";
import "./ResourceSharing.css";

function ResourceSharing() {
  const [activeTab, setActiveTab] = useState("requests");

  const [requests, setRequests] = useState([
    {
      id: "REQ001",
      equipment: "Scanning Electron Microscope",
      fromInstitution: "Mysuru Research Institute",
      requestedBy: "Dr. Rahul Kumar",
      date: "18 Aug 2026",
      duration: "3 Days",
      status: "Pending",
    },
    {
      id: "REQ002",
      equipment: "Advanced CNC Machine",
      fromInstitution: "National Engineering College",
      requestedBy: "Prof. Anitha Rao",
      date: "20 Aug 2026",
      duration: "2 Days",
      status: "Pending",
    },
    {
      id: "REQ003",
      equipment: "High Performance Spectrometer",
      fromInstitution: "Central Science University",
      requestedBy: "Dr. Kiran",
      date: "15 Aug 2026",
      duration: "1 Day",
      status: "Approved",
    },
    {
      id: "REQ004",
      equipment: "3D Metal Printer",
      fromInstitution: "Tech Research Centre",
      requestedBy: "Dr. Meena",
      date: "12 Aug 2026",
      duration: "2 Days",
      status: "Rejected",
    },
  ]);

  const sharedEquipment = [
    {
      name: "High Performance Spectrometer",
      owner: "Our Institution",
      sharedWith: "Central Science University",
      availability: "Available",
      status: "Active",
    },
    {
      name: "Scanning Electron Microscope",
      owner: "Mysuru Research Institute",
      sharedWith: "Our Institution",
      availability: "Booked",
      status: "Active",
    },
    {
      name: "Advanced CNC Machine",
      owner: "Our Institution",
      sharedWith: "National Engineering College",
      availability: "Available",
      status: "Active",
    },
  ];

  const updateRequest = (id, newStatus) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id
          ? { ...request, status: newStatus }
          : request
      )
    );
  };

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  return (
    <div className="sharing-page">

      {/* HEADER */}

      <div className="sharing-header">
        <div>
          <h1>Resource Sharing</h1>

          <p>
            Share laboratory equipment between institutions
            and manage access requests.
          </p>
        </div>

        <button className="sharing-primary-button">
          + Share Equipment
        </button>
      </div>


      {/* SUMMARY CARDS */}

      <div className="sharing-summary">

        <div className="sharing-summary-card">
          <div className="sharing-summary-icon blue">
            ⇄
          </div>

          <div>
            <span>Shared Equipment</span>
            <strong>{sharedEquipment.length}</strong>
          </div>
        </div>


        <div className="sharing-summary-card">
          <div className="sharing-summary-icon orange">
            !
          </div>

          <div>
            <span>Pending Requests</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>


        <div className="sharing-summary-card">
          <div className="sharing-summary-icon green">
            ✓
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>


        <div className="sharing-summary-card">
          <div className="sharing-summary-icon red">
            ×
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

      </div>


      {/* TABS */}

      <div className="sharing-tabs">

        <button
          className={
            activeTab === "requests" ? "active" : ""
          }
          onClick={() => setActiveTab("requests")}
        >
          Sharing Requests
        </button>

        <button
          className={
            activeTab === "equipment" ? "active" : ""
          }
          onClick={() => setActiveTab("equipment")}
        >
          Shared Equipment
        </button>

      </div>


      {/* REQUESTS */}

      {activeTab === "requests" && (

        <div className="sharing-card">

          <div className="sharing-card-header">
            <div>
              <h2>Incoming Sharing Requests</h2>

              <p>
                Review and manage equipment access requests
                from other institutions.
              </p>
            </div>
          </div>


          <div className="sharing-table">

            <div className="sharing-table-header">
              <span>Equipment</span>
              <span>Institution</span>
              <span>Requested By</span>
              <span>Date</span>
              <span>Duration</span>
              <span>Status</span>
              <span>Action</span>
            </div>


            {requests.map((request) => (

              <div
                className="sharing-table-row"
                key={request.id}
              >

                <div className="sharing-equipment">
                  <div className="sharing-equipment-icon">
                    {request.equipment.charAt(0)}
                  </div>

                  <div>
                    <strong>{request.equipment}</strong>

                    <small>
                      {request.id}
                    </small>
                  </div>
                </div>


                <span>
                  {request.fromInstitution}
                </span>


                <span>
                  {request.requestedBy}
                </span>


                <span>
                  {request.date}
                </span>


                <span>
                  {request.duration}
                </span>


                <StatusBadge
                  status={request.status}
                />


                <div className="request-actions">

                  {request.status === "Pending" ? (
                    <>
                      <button
                        className="approve-button"
                        onClick={() =>
                          updateRequest(
                            request.id,
                            "Approved"
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="reject-button"
                        onClick={() =>
                          updateRequest(
                            request.id,
                            "Rejected"
                          )
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="action-completed">
                      Completed
                    </span>
                  )}

                </div>

              </div>

            ))}

          </div>

        </div>

      )}


      {/* SHARED EQUIPMENT */}

      {activeTab === "equipment" && (

        <div className="sharing-card">

          <div className="sharing-card-header">
            <div>
              <h2>Shared Equipment</h2>

              <p>
                Equipment currently available through
                institutional resource sharing.
              </p>
            </div>
          </div>


          <div className="shared-equipment-list">

            {sharedEquipment.map((item) => (

              <div
                className="shared-equipment-item"
                key={item.name}
              >

                <div className="shared-equipment-icon">
                  {item.name.charAt(0)}
                </div>

                <div className="shared-equipment-info">

                  <strong>{item.name}</strong>

                  <p>
                    Owner: {item.owner}
                  </p>

                  <p>
                    Shared with: {item.sharedWith}
                  </p>

                </div>

                <div className="shared-equipment-right">

                  <span
                    className={`availability ${
                      item.availability
                        .toLowerCase()
                        .replace(" ", "-")
                    }`}
                  >
                    {item.availability}
                  </span>

                  <span className="active-sharing">
                    ● {item.status}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
}


/* STATUS BADGE */

function StatusBadge({ status }) {

  return (
    <span
      className={`sharing-status ${status
        .toLowerCase()}`}
    >
      <span></span>
      {status}
    </span>
  );
}


export default ResourceSharing;