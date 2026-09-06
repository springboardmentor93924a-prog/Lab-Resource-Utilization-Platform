import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Register.css';

export default function ResourceSharing() {
  const [requests, setRequests] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [senderInstitutionId, setSenderInstitutionId] = useState('');
  const [receiverInstitutionId, setReceiverInstitutionId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [activeTab, setActiveTab] = useState('INCOMING');

  const role = sessionStorage.getItem('role');
  const myInstitutionId = sessionStorage.getItem('institutionId');
  const isSystemAdmin = role === 'SYSTEM_ADMIN';

  // Only these roles can approve/reject, and only for requests where
  // their own institution is the equipment owner (sender) — System
  // Admin is the one platform-wide override. Institution Admin no
  // longer gets an action here (view-only), matching the backend.
  const canManage = ['LAB_MANAGER', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(role);

  const token = sessionStorage.getItem('token');
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchRequests();
    fetchInstitutions();
    fetchEquipment();
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

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/equipment', {
        headers: authHeader,
      });
      setEquipmentList(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  // Equipment picker only ever shows equipment belonging to the chosen
  // sender (owning) institution — never a raw ID the person has to know.
  const availableEquipment = useMemo(() => {
    if (!senderInstitutionId) return [];
    return equipmentList.filter(
      (eq) => String(eq.institution?.institutionId) === String(senderInstitutionId)
    );
  }, [equipmentList, senderInstitutionId]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8080/api/resource-sharing/requests',
        {
          equipment: { equipmentId: Number(equipmentId) },
          senderInstitution: { institutionId: Number(senderInstitutionId) },
          // Non-admins always request on behalf of their own institution;
          // the backend enforces this too, but we mirror it here so the
          // form doesn't even ask a Lab Manager/Dept Head a question
          // whose answer is fixed.
          receiverInstitution: {
            institutionId: Number(isSystemAdmin ? receiverInstitutionId : myInstitutionId),
          },
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

  // A request can be acted on by the current user only if they can
  // manage requests at all AND (they're System Admin, or their own
  // institution is the sender/owner of the equipment being asked for).
  const canActOn = (req) =>
    canManage &&
    (isSystemAdmin || String(req.senderInstitution?.institutionId) === String(myInstitutionId));

  const incoming = requests.filter(
    (r) => isSystemAdmin || String(r.senderInstitution?.institutionId) === String(myInstitutionId)
  );
  const outgoing = requests.filter(
    (r) => isSystemAdmin || String(r.receiverInstitution?.institutionId) === String(myInstitutionId)
  );
  const visibleRequests = activeTab === 'INCOMING' ? incoming : outgoing;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Inter-Institution Resource Sharing</h2>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '500px' }}>
        <h3>Send Sharing Request</h3>
        <form onSubmit={handleSendRequest}>
          <div style={{ marginBottom: '10px' }}>
            <label>Institution you're requesting equipment from: </label><br/>
            <select
              value={senderInstitutionId}
              onChange={(e) => {
                setSenderInstitutionId(e.target.value);
                setEquipmentId('');
              }}
              required
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">-- Select Institution --</option>
              {institutions
                .filter((inst) => isSystemAdmin || String(inst.institutionId) !== String(myInstitutionId))
                .map((inst) => (
                  <option key={inst.institutionId} value={inst.institutionId}>
                    {inst.institutionName}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Equipment: </label><br/>
            <select
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              required
              disabled={!senderInstitutionId}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">
                {senderInstitutionId ? '-- Select Equipment --' : 'Select an institution first'}
              </option>
              {availableEquipment.map((eq) => (
                <option key={eq.equipmentId} value={eq.equipmentId}>
                  {eq.equipmentName} ({eq.status})
                </option>
              ))}
            </select>
          </div>

          {isSystemAdmin && (
            <div style={{ marginBottom: '10px' }}>
              <label>Requesting Institution: </label><br/>
              <select
                value={receiverInstitutionId}
                onChange={(e) => setReceiverInstitutionId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">-- Select Institution --</option>
                {institutions
                  .filter((inst) => String(inst.institutionId) !== String(senderInstitutionId))
                  .map((inst) => (
                    <option key={inst.institutionId} value={inst.institutionId}>
                      {inst.institutionName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <button type="submit" style={{ background: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send Request</button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={() => setActiveTab('INCOMING')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: activeTab === 'INCOMING' ? '#007bff' : '#e5e7eb',
            color: activeTab === 'INCOMING' ? '#fff' : '#111',
          }}
        >
          Incoming Requests ({incoming.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTGOING')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: activeTab === 'OUTGOING' ? '#007bff' : '#e5e7eb',
            color: activeTab === 'OUTGOING' ? '#fff' : '#111',
          }}
        >
          Outgoing Requests ({outgoing.length})
        </button>
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>Equipment</th>
            <th>Sender Institution</th>
            <th>Receiver Institution</th>
            <th>Status</th>
            {activeTab === 'INCOMING' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {visibleRequests.length > 0 ? (
            visibleRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.equipment?.equipmentName}</td>
                <td>{req.senderInstitution?.institutionName}</td>
                <td>{req.receiverInstitution?.institutionName}</td>
                <td>
                  <span style={{ fontWeight: 'bold', color: req.status === 'APPROVED' ? 'green' : req.status === 'REJECTED' ? 'red' : 'orange' }}>
                    {req.status}
                  </span>
                </td>
                {activeTab === 'INCOMING' && (
                  <td>
                    {req.status === 'PENDING' && canActOn(req) && (
                      <>
                        <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} style={{ background: 'green', color: 'white', border: 'none', padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Reject</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={activeTab === 'INCOMING' ? 5 : 4} style={{ textAlign: 'center' }}>
                No {activeTab === 'INCOMING' ? 'incoming' : 'outgoing'} sharing requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}