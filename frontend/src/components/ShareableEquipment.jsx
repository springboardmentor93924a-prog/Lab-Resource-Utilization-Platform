import React, { useState, useEffect } from "react";
import "./ResourceSharing.css"; // Optional styling

function ShareableEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [requestDays, setRequestDays] = useState(1);

  // Fetch shareable equipment from other institutions
  useEffect(() => {
    fetch("http://localhost:8080/api/resource-sharing/equipment", {
      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch shareable equipment.");
        return res.json();
      })
      .then((data) => {
        setEquipmentList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    try {
      const response = await fetch("http://localhost:8080/api/resource-sharing/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        },
        body: JSON.stringify({
          equipmentId: selectedEquipment.id,
          purpose: purpose,
          durationDays: Number(requestDays)
        })
      });

      if (!response.ok) throw new Error("Failed to send sharing request.");

      alert("Resource sharing request sent successfully!");
      setSelectedEquipment(null);
      setPurpose("");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading shareable equipment...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="shareable-equipment-container">
      <h2>Inter-Institution Shareable Equipment</h2>
      
      <div className="equipment-grid">
        {equipmentList.length === 0 ? (
          <p>No equipment currently available for sharing from other institutions.</p>
        ) : (
          equipmentList.map((item) => (
            <div key={item.id} className="equipment-card">
              <h3>{item.name}</h3>
              <p><strong>Institution:</strong> {item.institutionName}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <button 
                className="request-btn"
                onClick={() => setSelectedEquipment(item)}
              >
                Request Sharing
              </button>
            </div>
          ))
        )}
      </div>

      {/* Request Modal / Form */}
      {selectedEquipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Request Equipment: {selectedEquipment.name}</h3>
            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label>Purpose of Sharing</label>
                <textarea 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)} 
                  placeholder="Enter research or lab utility purpose..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (in Days)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={requestDays} 
                  onChange={(e) => setRequestDays(e.target.value)} 
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Submit Request</button>
                <button type="button" className="cancel-btn" onClick={() => setSelectedEquipment(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareableEquipment;