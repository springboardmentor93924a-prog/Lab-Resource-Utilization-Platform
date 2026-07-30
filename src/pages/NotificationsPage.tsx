export default function NotificationsPage() {
  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Notification center</h2>
        <p>Announcements, booking alerts, maintenance updates, and compliance notices.</p>
        <div className="table-card">
          <div className="table-row"><strong>Title</strong><strong>Type</strong><strong>Priority</strong></div>
          <div className="table-row"><span>Calibration due soon</span><span>Maintenance</span><span>High</span></div>
          <div className="table-row"><span>New booking approval required</span><span>Booking</span><span>Medium</span></div>
        </div>
      </div>
    </div>
  );
}
