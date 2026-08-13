import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OutgoingShareRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchOutgoingRequests();
  }, []);

  const fetchOutgoingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/resource-sharing/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching outgoing requests:', error);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3>Outgoing Sharing Requests Status</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>ID</th>
            <th>Equipment</th>
            <th>Sender Institution</th>
            <th>Receiver Institution</th>
            <th>Current Status</th>
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
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No outgoing requests tracked.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}