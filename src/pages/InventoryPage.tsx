export default function InventoryPage() {
  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Inventory dashboard</h2>
        <p>Equipment list, availability, vendors, calibration status, and maintenance history.</p>
        <div className="table-card">
          <div className="table-row"><strong>Equipment</strong><strong>Status</strong><strong>Location</strong></div>
          <div className="table-row"><span>PCR Thermal Cycler</span><span>Available</span><span>Lab A</span></div>
          <div className="table-row"><span>Confocal Microscope</span><span>Booked</span><span>Lab C</span></div>
          <div className="table-row"><span>HPLC System</span><span>Maintenance</span><span>Lab B</span></div>
        </div>
      </div>
    </div>
  );
}
