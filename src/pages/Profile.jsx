import React, { useState } from "react";

export default function Profile({ userRole = "RESEARCHER", showToast }) {
  const [profile, setProfile] = useState({
    fullName: "Alex Morgan",
    email: "alex.morgan@research.edu",
    phone: "+1 (555) 234-5678",
    department: "ECE",
    institution: "Mysuru Research Institute",
    role: userRole,
    location: "Lab 101",
    emailNotifications: true,
    smsNotifications: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (showToast) {
      showToast("Profile details updated successfully!", "success");
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      if (showToast) showToast("New passwords do not match.", "error");
      return;
    }
    if (!passwordData.currentPassword) {
      if (showToast) showToast("Please enter your current password.", "warning");
      return;
    }

    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    if (showToast) {
      showToast("Password updated successfully!", "success");
    }
  };

  return (
    <div style={{ padding: "30px 34px", background: "#f6f8fc", minHeight: "100%" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "26px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#172b4d" }}>
          User Profile & Settings
        </h1>
        <p style={{ margin: "7px 0 0", fontSize: "14px", color: "#718096" }}>
          Manage your account credentials, institutional role, and alert preferences
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* PERSONAL DETAILS CARD */}
        <div style={cardStyle}>
          <h2 style={cardHeaderStyle}>Personal Details</h2>
          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Role</label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  style={{ ...inputStyle, background: "#f1f5f9", cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={profile.department}
                  onChange={handleProfileChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <button type="submit" style={btnPrimary}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* SECURITY & NOTIFICATION PREFERENCES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* PASSWORD CARD */}
          <div style={cardStyle}>
            <h2 style={cardHeaderStyle}>Change Password</h2>
            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <button type="submit" style={btnSecondary}>
                Update Password
              </button>
            </form>
          </div>

          {/* NOTIFICATION PREFERENCES CARD */}
          <div style={cardStyle}>
            <h2 style={cardHeaderStyle}>Notification Preferences</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#334155" }}>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={profile.emailNotifications}
                  onChange={handleProfileChange}
                />
                Receive Email Notifications for booking updates
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#334155" }}>
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={profile.smsNotifications}
                  onChange={handleProfileChange}
                />
                Receive SMS Alerts for high-priority waitlist promotions
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #e4e8ef",
  boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
};

const cardHeaderStyle = {
  margin: "0 0 18px",
  fontSize: "18px",
  fontWeight: 600,
  color: "#1e293b",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  height: "38px",
  borderRadius: "7px",
  border: "1px solid #d9dfe8",
  padding: "0 12px",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const btnPrimary = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 18px",
  borderRadius: "7px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "10px",
};

const btnSecondary = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  padding: "10px 18px",
  borderRadius: "7px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "6px",
};