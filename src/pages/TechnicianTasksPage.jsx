import React, { useState } from 'react';
import './MaintenancePage.css';

export default function TechnicianTasksPage() {
  // Technician's assigned tasks state
  const [tasks, setTasks] = useState([
    {
      id: 'WO-201',
      equipment: 'Centrifuge X200',
      priority: 'HIGH',
      scheduledTime: '2026-08-25 10:00 AM',
      status: 'ASSIGNED',
    },
    {
      id: 'WO-202',
      equipment: 'HPLC System',
      priority: 'MEDIUM',
      scheduledTime: '2026-08-25 02:00 PM',
      status: 'IN_PROGRESS',
    },
    {
      id: 'WO-203',
      equipment: 'Spectrophotometer',
      priority: 'LOW',
      scheduledTime: '2026-08-24 09:00 AM',
      status: 'COMPLETED',
    },
  ]);

  // Handle Work Order Transition (ASSIGNED -> IN_PROGRESS)
  const handleStartWork = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: 'IN_PROGRESS' } : task
      )
    );
  };

  // Handle Work Order Transition (IN_PROGRESS -> COMPLETED)
  const handleCompleteWork = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: 'COMPLETED' } : task
      )
    );
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-header">
        <div>
          <div className="eyebrow">LAB TECHNICIAN VIEW</div>
          <h1>My Maintenance Tasks</h1>
          <p>View and manage assigned work orders.</p>
        </div>
      </div>

      <div className="maintenance-panel">
        <div className="table-responsive">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Work Order</th>
                <th>Equipment</th>
                <th>Priority</th>
                <th>Scheduled Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const canStart = task.status === 'ASSIGNED';
                const canComplete = task.status === 'IN_PROGRESS';

                return (
                  <tr key={task.id}>
                    <td><strong>{task.id}</strong></td>
                    <td>{task.equipment}</td>
                    <td>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{task.scheduledTime}</td>
                    <td>
                      <span className={`badge status-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="action-btn primary-btn-sm"
                          disabled={!canStart}
                          style={{ opacity: canStart ? 1 : 0.4, cursor: canStart ? 'pointer' : 'not-allowed' }}
                          onClick={() => handleStartWork(task.id)}
                        >
                          Start Work
                        </button>

                        <button
                          className="action-btn success-btn"
                          disabled={!canComplete}
                          style={{ opacity: canComplete ? 1 : 0.4, cursor: canComplete ? 'pointer' : 'not-allowed' }}
                          onClick={() => handleCompleteWork(task.id)}
                        >
                          Complete Work
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}