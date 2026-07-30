export default function MaintenancePage() {
  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Maintenance center</h2>
        <p>Tickets, preventive maintenance, lubrication schedules, work orders, and service history.</p>
        <div className="table-card">
          <div className="table-row"><strong>Asset</strong><strong>Priority</strong><strong>Status</strong></div>
          <div className="table-row"><span>Spectrometer</span><span>High</span><span>In Progress</span></div>
          <div className="table-row"><span>Air Handler</span><span>Medium</span><span>Scheduled</span></div>
        </div>
      </div>
    </div>
  );
}
