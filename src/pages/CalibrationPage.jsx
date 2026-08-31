import React, { useState } from 'react';
import './CalibrationPage.css';

export default function CalibrationPage() {
  const [filter, setFilter] = useState('ALL');

  const [calibrationList] = useState([
    {
      id: 1,
      equipment: 'Oscilloscope',
      lastCalibration: '10 Jun 2026',
      nextCalibration: '10 Dec 2026',
      certificate: 'ISO-1234',
      expiry: '10 Dec 2026',
      status: 'VALID',
    },
    {
      id: 2,
      equipment: 'Centrifuge X200',
      lastCalibration: '15 Aug 2025',
      nextCalibration: '15 Aug 2026',
      certificate: 'CERT-8842',
      expiry: '15 Aug 2026',
      status: 'EXPIRED',
    },
    {
      id: 3,
      equipment: 'HPLC System',
      lastCalibration: '01 Sep 2025',
      nextCalibration: '01 Sep 2026',
      certificate: 'CERT-9102',
      expiry: '01 Sep 2026',
      status: 'DUE_SOON',
    },
  ]);

  const filteredData = calibrationList.filter((item) => {
    if (filter === 'DUE_SOON') return item.status === 'DUE_SOON';
    if (filter === 'EXPIRED') return item.status === 'EXPIRED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VALID':
        return <span className="badge badge-valid">Valid</span>;
      case 'DUE_SOON':
        return <span className="badge badge-due">Due Soon</span>;
      case 'EXPIRED':
        return <span className="badge badge-expired">Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <span className="eyebrow">LAB MANAGER DASHBOARD</span>
        <h1>Calibration & Certification</h1>
        <p>Manage and review equipment calibration history and compliance certifications.</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({calibrationList.length})
        </button>
        <button
          className={`tab-btn ${filter === 'DUE_SOON' ? 'active' : ''}`}
          onClick={() => setFilter('DUE_SOON')}
        >
          Due Soon ({calibrationList.filter((i) => i.status === 'DUE_SOON').length})
        </button>
        <button
          className={`tab-btn ${filter === 'EXPIRED' ? 'active' : ''}`}
          onClick={() => setFilter('EXPIRED')}
        >
          Expired ({calibrationList.filter((i) => i.status === 'EXPIRED').length})
        </button>
      </div>

      <div className="table-card">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Last Calibration</th>
              <th>Next Calibration</th>
              <th>Certification</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.equipment}</strong></td>
                <td>{item.lastCalibration}</td>
                <td>{item.nextCalibration}</td>
                <td>
                  <span className="cert-code">📄 {item.certificate}</span>
                </td>
                <td>{item.expiry}</td>
                <td>{getStatusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}