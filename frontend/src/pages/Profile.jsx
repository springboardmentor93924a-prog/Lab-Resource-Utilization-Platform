import Sidebar from "../components/Sidebar";
import "../styles/profile.css";

function Profile() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings.</p>
        </div>

        <div className="profile-card">

          <div className="profile-avatar">
            👩
          </div>

          <div className="profile-details">

            <div className="profile-row">
              <span>Full Name</span>
              <strong>Harini Sri</strong>
            </div>

            <div className="profile-row">
              <span>Register Number</span>
              <strong>22AD001</strong>
            </div>

            <div className="profile-row">
              <span>Email</span>
              <strong>harini@example.com</strong>
            </div>

            <div className="profile-row">
              <span>Department</span>
              <strong>AI & DS</strong>
            </div>

            <div className="profile-row">
              <span>Phone</span>
              <strong>+91 9876543210</strong>
            </div>

          </div>

          <div className="profile-buttons">

            <button className="edit-btn">
              Edit Profile
            </button>

            <button className="password-btn">
              Change Password
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;