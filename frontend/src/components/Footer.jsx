import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h2>Lab Resource Utilization Platform</h2>

          <p>
            A smart platform for efficient laboratory resource management,
            equipment booking, and utilization monitoring.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>

          <ul>
            <li>Home</li>
            <li>Resources</li>
            <li>Dashboard</li>
            <li>Booking</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p>📧 support@labresource.com</p>
          <p>📍 Panimalar Engineering College</p>
        </div>

      </div>

      <hr />

      <p className="copyright">
        © 2026 Lab Resource Utilization Platform | All Rights Reserved
      </p>

    </footer>
  );
}

export default Footer;