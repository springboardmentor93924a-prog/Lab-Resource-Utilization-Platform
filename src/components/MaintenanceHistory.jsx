import React, { useState } from 'react';

export default function MaintenanceHistory() {
  const [history] = useState([
    {
      id: 201,
      equipment: 'Centrifuge X200',
      equipmentId: 'EQ002',
      type: 'CORRECTIVE',
      technician: 'Ravi Kumar',
      downtimeHours: 12,
      cost: 4500,
      completedDate: '2026-08-15',
      notes: 'Replaced worn-out motor bearings and recalibrated speed sensors.',
    },
    {
      id: 202,
      equipment: 'HPLC System',
      equipmentId: 'EQ003',
      type: 'PREVENTIVE',
      technician: 'Suresh Patel',
      downtimeHours: 4,
      cost: 1200,
      completedDate: '2026-08-10',
      notes: 'Routine pump seal replacement and fluidics flush.',
    },
  ]);

  const totalDowntime = history.reduce((acc, curr) => acc + (curr.downtimeHours || 0), 0);
  const totalCost = history.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  return (
    <div className="maintenance-panel">
      <div className="panel-heading">
        <div>
          <h2>Maintenance History & Downtime Log</h2>
          <p>Review past repair records, total downtime hours, and maintenance expenses.</p>
        </div>
      </div>

      <div className="maintenance-stats" style={{ marginBottom: '20px' }}>
        <div className="stat-card tone-neutral">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-title">Total Downtime</div>
            <div className="stat-value">{totalDowntime} hrs</div>
          </div>
        </div>
        <div className="stat-card tone-primary">
          <div className="stat-icon">₹</div>
          <div className="stat-content">
            <div className="stat-title">Total Repair Cost</div>
            <div className="stat-value">₹{totalCost.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card tone-success">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <div className="stat-title">Records Completed</div>
            <div className="stat-value">{history.length}</div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Equipment</th>
              <th>Type</th>
              <th>Technician</th>
              <th>Downtime</th>
              <th>Cost</th>
              <th>Completion Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td><strong>#LOG-{item.id}</strong></td>
                <td>
                  <div className="equipment-cell">
                    <span className="equipment-name">{item.equipment}</span>
                    <span className="equipment-id">{item.equipmentId}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${item.type === 'CORRECTIVE' ? 'priority-high' : 'priority-medium'}`}>
                    {item.type}
                  </span>
                </td>
                <td>{item.technician}</td>
                <td>{item.downtimeHours} hrs</td>
                <td>₹{item.cost}</td>
                <td>{item.completedDate}</td>
                <td style={{ maxWidth: '250px' }}>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}