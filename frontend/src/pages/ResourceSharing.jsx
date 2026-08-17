import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Register.css';

export default function ResourceSharing() {
  const [requests, setRequests] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [senderInstitutionId, setSenderInstitutionId] = useState('');
  const [receiverInstitutionId, setReceiverInstitutionId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');

  const token = localStorage.getItem('token');
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchRequests();
    fetchInstitutions();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/resource-sharing/requests',
        { headers: authHeader }
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching sharing requests:', error);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/institutions');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8080/api/resource-sharing/requests',
        {
          equipment: { equipmentId: Number(equipmentId) },
          senderInstitution: { institutionId: Number(senderInstitutionId) },
          receiverInstitution: { institutionId: Number(receiverInstitutionId) },
        },
        { headers: authHeader }
      );
      setSenderInstitutionId('');
      setReceiverInstitutionId('');
      setEquipmentId('');
      fetchRequests();
      alert('Resource sharing request sent successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Error sending request';
      alert(message);
      console.error('Error sending request:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8080/api/resource-sharing/requests/${id}/status?status=${status}`,
        {},
        { headers: authHeader }
      );
      fetchRequests();
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating status';
      alert(message);
      console.error('Error updating status:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Inter-Institution Resource Sharing</h2>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '500px' }}>
        <h3>Send Sharing Request</h3>
        <form onSubmit={handleSendRequest}>
          <div style={{ marginBottom: '10px' }}>
            <label>Equipment ID: </label><br/>
            <input type="number" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Sender Institution (must be the equipment's owning institution): </label><br/>
            <select value={senderInstitutionId} onChange={(e) => setSenderInstitutionId(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
              <option value="">-- Select Institution --</option>
              {institutions.map((inst) => (
                <option key={inst.institutionId} value={inst.institutionId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Receiver Institution: </label><br/>
            <select value={receiverInstitutionId} onChange={(e) => setReceiverInstitutionId(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
              <option value="">-- Select Institution --</option>
              {institutions.map((inst) => (
                <option key={inst.institutionId} value={inst.institutionId}>
                  {inst.institutionName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ background: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send Request</button>
        </form>
      </div>

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
                <td>{req.senderInstitution?.institutionName}</td>
                <td>{req.receiverInstitution?.institutionName}</td>
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