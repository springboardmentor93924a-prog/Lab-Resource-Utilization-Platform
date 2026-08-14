import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function IncomingShareRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/resource-sharing/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching incoming requests:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8080/api/resource-sharing/requests/${id}/status?status=${status}`);
      fetchIncomingRequests();
      alert(`Request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update request status.');
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
      <h3>Incoming Sharing Requests</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>ID</th>
            <th>Equipment</th>
            <th>Sender Institution</th>
            <th>Receiver Institution</th>
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
                      <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="approve-btn" style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', marginRight: '5px', cursor: 'pointer', borderRadius: '4px' }}>Approve</button>
                      <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="reject-btn" style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No incoming requests found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}