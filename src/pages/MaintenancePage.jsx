import React, { useState } from 'react';
import MaintenanceHistory from '../components/MaintenanceHistory';
import './MaintenancePage.css';

export default function MaintenancePage({ userRole = 'LAB_MANAGER', showToast }) {
  const isManager = userRole === 'LAB_MANAGER';

  // State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    equipment: '',
    description: '',
    technician: '',
    scheduledTime: '',
  });

  const [workOrders, setWorkOrders] = useState([
    {
      id: 'WO-201',
      equipment: 'Centrifuge X200',
      description: 'Replace motor bearings & rebalance rotor',
      technician: 'Ravi Kumar',
      scheduledTime: '2026-08-25 10:00 AM',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      actualStart: '2026-08-25 10:15 AM',
      actualEnd: '-',
    },
    {
      id: 'WO-202',
      equipment: 'HPLC System',
      description: 'Quarterly pump calibration',
      technician: 'Suresh Patel',
      scheduledTime: '2026-08-26 02:00 PM',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      actualStart: '-',
      actualEnd: '-',
    },
  ]);

  const [requests, setRequests] = useState([
    {
      id: 'REQ-101',
      equipment: 'Centrifuge X200',
      reason: 'Motor vibration noise',
      priority: 'HIGH',
      duration: '4 hrs',
      requestedBy: 'Dr. Smith',
      status: 'PENDING',
    },
  ]);

  // Handlers
  const handleStartWorkOrder = (id) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: 'IN_PROGRESS', actualStart: now } : wo))
    );

    if (showToast) {
      showToast(`Work order ${id} marked as In Progress.`, 'info');
    }
  };

  const handleCompleteWorkOrder = (id) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: 'COMPLETED', actualEnd: now } : wo))
    );

    if (showToast) {
      showToast(`Work order ${id} completed successfully!`, 'success');
    }
  };

  const handleRequestStatus = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );

    if (showToast) {
      if (newStatus === 'APPROVED') {
        showToast(`Request ${id} approved successfully!`, 'success');
      } else if (newStatus === 'REJECTED') {
        showToast(`Request ${id} rejected.`, 'warning');
      }
    }
  };

  const handleCreateWorkOrder = (e) => {
    e.preventDefault();
    const newWO = {
      id: `WO-${Math.floor(100 + Math.random() * 900)}`,
      equipment: formData.equipment,
      description: formData.description,
      technician: formData.technician || 'Unassigned',
      scheduledTime: formData.scheduledTime || 'TBD',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      actualStart: '-',
      actualEnd: '-',
    };
    setWorkOrders([newWO, ...workOrders]);

    if (showToast) {
      showToast(`Work Order ${newWO.id} created for ${formData.equipment}!`, 'success');
    }

    setShowModal(false);
    setFormData({ equipment: '', description: '', technician: '', scheduledTime: '' });
  };

  // LAB TECHNICIAN VIEW
  if (!isManager) {
    return (
      <div className="maintenance-page">
        <div className="maintenance-header">
          <div>
            <div className="eyebrow">LAB TECHNICIAN VIEW</div>
            <h1>My Maintenance Tasks</h1>
            <p>View assigned work orders, update task status, and record progress.</p>
          </div>
        </div>

        <div className="maintenance-panel">
          <div className="panel-heading">
            <h2>My Maintenance Tasks</h2>
          </div>
          <div className="table-responsive">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Work Order</th>
                  <th>Priority</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((task) => (
                  <tr key={task.id}>
                    <td><strong>{task.equipment}</strong></td>
                    <td>{task.id}</td>
                    <td><span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                    <td>{task.scheduledTime}</td>
                    <td><span className={`badge status-${task.status.toLowerCase()}`}>{task.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {task.status === 'SCHEDULED' && (
                          <button className="action-btn primary-btn-sm" onClick={() => handleStartWorkOrder(task.id)}>Start Work</button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button className="action-btn success-btn" onClick={() => handleCompleteWorkOrder(task.id)}>Complete Work</button>
                        )}
                        {task.status === 'COMPLETED' && <span className="text-muted">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // LAB MANAGER VIEW
  return (
    <div className="maintenance-page">
      <div className="maintenance-header">
        <div>
          <div className="eyebrow">LAB MANAGER DASHBOARD</div>
          <h1>Maintenance Management</h1>
          <p>Schedule repairs, approve requests, and review downtime logs.</p>
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + Create Work Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="maintenance-stats">
        <div className="stat-card tone-warning">
          <div className="stat-content">
            <span className="stat-title">Pending</span>
            <span className="stat-value">{requests.filter((r) => r.status === 'PENDING').length}</span>
          </div>
        </div>
        <div className="stat-card tone-primary">
          <div className="stat-content">
            <span className="stat-title">Approved</span>
            <span className="stat-value">{requests.filter((r) => r.status === 'APPROVED').length}</span>
          </div>
        </div>
        <div className="stat-card tone-info">
          <div className="stat-content">
            <span className="stat-title">In Progress</span>
            <span className="stat-value">{workOrders.filter((w) => w.status === 'IN_PROGRESS').length}</span>
          </div>
        </div>
        <div className="stat-card tone-success">
          <div className="stat-content">
            <span className="stat-title">Completed</span>
            <span className="stat-value">{workOrders.filter((w) => w.status === 'COMPLETED').length}</span>
          </div>
        </div>
      </div>

      {/* Maintenance Requests Table */}
      <div className="maintenance-panel" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h2>Maintenance Requests</h2>
        </div>
        <div className="table-responsive">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Reason</th>
                <th>Priority</th>
                <th>Duration</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.equipment}</strong></td>
                  <td>{item.reason}</td>
                  <td><span className={`badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                  <td>{item.duration}</td>
                  <td>{item.requestedBy}</td>
                  <td><span className={`badge status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                  <td>
                    {item.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="action-btn success-btn" onClick={() => handleRequestStatus(item.id, 'APPROVED')}>Approve</button>
                        <button className="action-btn danger-btn" onClick={() => handleRequestStatus(item.id, 'REJECTED')}>Reject</button>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="maintenance-panel">
        <div className="panel-heading">
          <h2>Work Orders</h2>
        </div>
        <div className="table-responsive">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Work Order</th>
                <th>Equipment</th>
                <th>Description</th>
                <th>Technician</th>
                <th>Scheduled Time</th>
                <th>Status</th>
                <th>Actual Start</th>
                <th>Actual End</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((wo) => (
                <tr key={wo.id}>
                  <td><strong>{wo.id}</strong></td>
                  <td>{wo.equipment}</td>
                  <td>{wo.description}</td>
                  <td>{wo.technician}</td>
                  <td>{wo.scheduledTime}</td>
                  <td><span className={`badge status-${wo.status.toLowerCase()}`}>{wo.status}</span></td>
                  <td>{wo.actualStart}</td>
                  <td>{wo.actualEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE WORK ORDER MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="maintenance-panel" style={{ width: '450px', background: '#fff' }}>
            <h2>Create Work Order</h2>
            <form onSubmit={handleCreateWorkOrder} style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
              <div className="field-group">
                <label>Equipment Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Centrifuge X200"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label>Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details of repair work..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label>Assign Technician</label>
                <input
                  type="text"
                  placeholder="Technician Name"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label>Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="ghost-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Submit Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}