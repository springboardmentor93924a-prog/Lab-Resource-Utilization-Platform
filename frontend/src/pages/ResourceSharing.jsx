import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Register.css'; // You can use common or create a specific CSS if needed

export default function ResourceSharing() {
  const [requests, setRequests] = useState([]);
  const [equipmentName, setEquipmentName] = useState('');
  const [senderInstitution, setSenderInstitution] = useState('');
  const [receiverInstitution, setReceiverInstitution] = useState('');
  const [equipmentId, setEquipmentId] = useState('');

  // Fetch all sharing requests on load
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/resource-sharing/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching sharing requests:', error);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/resource-sharing/requests', {
        equipmentId: parseInt(equipmentId),
        equipmentName,
        senderInstitution,
        receiverInstitution
      });
      setEquipmentName('');
      setSenderInstitution('');
      setReceiverInstitution('');
      setEquipmentId('');
      fetchRequests();
      alert('Resource sharing request sent successfully!');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/api/resource-sharing/requests/${id}/status?status=${status}`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Inter-Institution Resource Sharing</h2>

      {/* Request Form */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '500px' }}>
        <h3>Send Sharing Request</h3>
        <form onSubmit={handleSendRequest}>
          <div style={{ marginBottom: '10px' }}>
            <label>Equipment ID: </label><br/>
            <input type="number" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Equipment Name: </label><br/>
            <input type="text" value={equipmentName} onChange={(e) => setEquipmentName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Sender Institution: </label><br/>
            <input type="text" value={senderInstitution} onChange={(e) => setSenderInstitution(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Receiver Institution: </label><br/>
            <input type="text" value={receiverInstitution} onChange={(e) => setReceiverInstitution(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ background: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send Request</button>
        </form>
      </div>

      {/* Requests Table */}
      <h3>Active Sharing Requests</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>ID</th>
            <th>Equipment</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.equipmentName} (ID: {req.equipmentId})</td>
                <td>{req.senderInstitution}</td>
                <td>{req.receiverInstitution}</td>
                <td>
                  <span style={{ fontWeight: 'bold', color: req.status === 'APPROVED' ? 'green' : req.status === 'REJECTED' ? 'red' : 'orange' }}>
                    {req.status}
                  </span>
                </td>
                <td>
                  {req.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} style={{ background: 'green', color: 'white', border: 'none', padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No sharing requests found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}