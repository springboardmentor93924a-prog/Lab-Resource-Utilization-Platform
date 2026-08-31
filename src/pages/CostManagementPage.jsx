import React, { useState } from 'react';
import './CostManagementPage.css';

export default function CostManagementPage({ userRole = 'LAB_MANAGER' }) {
  const [activeTab, setActiveTab] = useState('EQUIPMENT');
  const [showModal, setShowModal] = useState(false);

  // Form State for New Invoice
  const [newInvoice, setNewInvoice] = useState({
    equipment: '',
    requestingInstitution: '',
    hoursUsed: '',
    rate: ''
  });

  const [equipmentCosts, setEquipmentCosts] = useState([
    { id: 'EQ-101', equipment: 'Centrifuge X200', department: 'Biochemistry', rate: 150, hours: 42, totalCost: 6300 },
    { id: 'EQ-102', equipment: 'HPLC System', department: 'Analytical Chem', rate: 300, hours: 28, totalCost: 8400 },
    { id: 'EQ-103', equipment: 'Spectrophotometer', department: 'Biochemistry', rate: 100, hours: 15, totalCost: 1500 },
  ]);

  const [billingLogs, setBillingLogs] = useState([
    {
      id: 'INV-301',
      equipment: 'HPLC System',
      ownerInstitution: 'National Institute of Tech',
      requestingInstitution: 'Indian Institute of Science',
      hoursUsed: 12,
      rate: 300,
      totalAmount: 3600,
      status: 'PENDING',
    },
    {
      id: 'INV-302',
      equipment: 'Centrifuge X200',
      ownerInstitution: 'National Institute of Tech',
      requestingInstitution: 'Central University',
      hoursUsed: 20,
      rate: 150,
      totalAmount: 3000,
      status: 'PAID',
    },
  ]);

  // Handle Creating a New Bill (Connects to Spring Boot POST API later)
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const totalAmount = Number(newInvoice.hoursUsed) * Number(newInvoice.rate);
    const invoiceObj = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      equipment: newInvoice.equipment,
      ownerInstitution: 'National Institute of Tech',
      requestingInstitution: newInvoice.requestingInstitution,
      hoursUsed: Number(newInvoice.hoursUsed),
      rate: Number(newInvoice.rate),
      totalAmount: totalAmount,
      status: 'PENDING'
    };

    setBillingLogs([invoiceObj, ...billingLogs]);
    setShowModal(false);
    setNewInvoice({ equipment: '', requestingInstitution: '', hoursUsed: '', rate: '' });
  };

  return (
    <div className="cost-container">
      <div className="cost-header-flex">
        <div>
          <span className="eyebrow">{userRole} DASHBOARD</span>
          <h1>Cost Management & Billing</h1>
          <p>Track hourly equipment usage costs, department expenditure, and inter-institution billing logs.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Generate Inter-Inst Bill
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`tab-btn ${activeTab === 'EQUIPMENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('EQUIPMENT')}
        >
          Equipment Usage Cost
        </button>
        <button
          className={`tab-btn ${activeTab === 'BILLING' ? 'active' : ''}`}
          onClick={() => setActiveTab('BILLING')}
        >
          Inter-Institution Billing
        </button>
      </div>

      {/* Equipment Usage View */}
      {activeTab === 'EQUIPMENT' && (
        <div className="table-card">
          <table className="cost-table">
            <thead>
              <tr>
                <th>Equipment ID</th>
                <th>Equipment Name</th>
                <th>Department</th>
                <th>Hourly Rate (₹)</th>
                <th>Usage Hours</th>
                <th>Total Usage Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {equipmentCosts.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td>{item.equipment}</td>
                  <td>{item.department}</td>
                  <td>₹{item.rate}/hr</td>
                  <td>{item.hours} hrs</td>
                  <td className="cost-highlight">₹{item.totalCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inter-Institution Billing View */}
      {activeTab === 'BILLING' && (
        <div className="table-card">
          <table className="cost-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Equipment</th>
                <th>Owner Inst.</th>
                <th>Requesting Inst.</th>
                <th>Hours</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {billingLogs.map((bill) => (
                <tr key={bill.id}>
                  <td><strong>{bill.id}</strong></td>
                  <td>{bill.equipment}</td>
                  <td>{bill.ownerInstitution}</td>
                  <td>{bill.requestingInstitution}</td>
                  <td>{bill.hoursUsed} hrs</td>
                  <td className="cost-highlight">₹{bill.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${bill.status.toLowerCase()}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    <button 
                           className="btn-action" 
                             onClick={() => handleDownloadPDF(bill.id)}>
                             Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Generate New Invoice</h3>
            <form onSubmit={handleCreateInvoice}>
              <div className="form-group">
                <label>Equipment Name</label>
                <input
                  type="text"
                  required
                  value={newInvoice.equipment}
                  onChange={(e) => setNewInvoice({ ...newInvoice, equipment: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Requesting Institution</label>
                <input
                  type="text"
                  required
                  value={newInvoice.requestingInstitution}
                  onChange={(e) => setNewInvoice({ ...newInvoice, requestingInstitution: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hours Used</label>
                <input
                  type="number"
                  required
                  value={newInvoice.hoursUsed}
                  onChange={(e) => setNewInvoice({ ...newInvoice, hoursUsed: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={newInvoice.rate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, rate: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}