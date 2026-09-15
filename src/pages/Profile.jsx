import { useState } from "react";
import { updateUser } from "../api/userApi";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../utils/constants";
import { page, headerRow, h1Style, subStyle, card, labelStyle, inputStyle, primaryBtn, errorText } from "../styles/shared";

function Profile({ showToast }) {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div style={page}>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await updateUser(user.email, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        departmentId: user.department?.departId || null,
      });
      await refreshUser();
      showToast?.("Profile updated.", "success");
      setEditing(false);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to update profile."));
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>My Profile</h1>
          <p style={subStyle}>Your account details</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}

      <div style={{ ...card, padding: 26, maxWidth: 560 }}>
        {!editing ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
              <div style={avatarStyle}>{(user.firstName || "?").charAt(0)}{(user.lastName || "").charAt(0)}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>{user.firstName} {user.lastName}</h2>
                <p style={{ margin: "4px 0 0", color: "#718096", fontSize: 13 }}>{ROLE_LABELS[user.role] || user.role}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13, color: "#334155" }}>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Phone:</strong> {user.phone || "-"}</div>
              <div><strong>Institution:</strong> {user.institution?.institutionName || "-"}</div>
              <div><strong>Department:</strong> {user.department?.departmentName || "-"}</div>
              <div><strong>Account Status:</strong> {user.isActive ? "Active" : "Pending approval"}</div>
            </div>
            <button onClick={() => setEditing(true)} style={{ ...primaryBtn, marginTop: 22 }}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>First Name</label>
              <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Last Name</label>
              <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button type="button" onClick={() => setEditing(false)} style={{ padding: "9px 16px", borderRadius: 6, border: "1px solid #d8dee8", background: "white", color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button type="submit" style={primaryBtn}>Save Changes</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const avatarStyle = { width: 56, height: 56, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 };

export default Profile;
