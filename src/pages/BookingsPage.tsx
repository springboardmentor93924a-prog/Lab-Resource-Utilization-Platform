export default function BookingsPage() {
  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Booking workflow</h2>
        <p>Approval queue, waitlist handling, recurring reservations, and booking timeline.</p>
        <div className="table-card">
          <div className="table-row"><strong>Resource</strong><strong>Requestor</strong><strong>State</strong></div>
          <div className="table-row"><span>Microscope Bay 2</span><span>Dr. Rao</span><span>Approved</span></div>
          <div className="table-row"><span>Autoclave</span><span>Ms. Iyer</span><span>Pending</span></div>
          <div className="table-row"><span>Cold Room</span><span>Team Bio</span><span>Waitlist</span></div>
        </div>
      </div>
    </div>
  );
}
