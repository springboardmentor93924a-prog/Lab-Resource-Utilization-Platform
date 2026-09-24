import { useEffect, useState } from "react";

// "My profile" - available to every logged-in role.
// You can change your name, phone and password. Email, role, institution
// and department can only be changed by an administrator.

const API = import.meta.env.VITE_API_BASE_URL;

const prettyRole = (roleName) =>
  (roleName || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

function Profile() {
  const token = sessionStorage.getItem("token");
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/profile`, { headers: authHeaders })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load your profile"))))
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName || "");
        setPhone(data.phone || "");
      })
      .catch((err) => setProfileMessage({ type: "error", text: err.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readError = async (res, fallback) => {
    const data = await res.json().catch(() => null);
    return data?.message || fallback;
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ fullName, phone }),
      });

      if (!res.ok) throw new Error(await readError(res, "Could not save your profile"));

      const data = await res.json();
      setProfile(data);
      sessionStorage.setItem("fullName", data.fullName);
      setProfileMessage({ type: "ok", text: "Profile saved." });
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "The new passwords do not match." });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch(`${API}/api/profile/password`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) throw new Error(await readError(res, "Could not change your password"));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "ok", text: "Password changed." });
    } catch (err) {
      setPasswordMessage({ type: "error", text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const card = { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "18px", marginBottom: "16px" };
  const label = { display: "block", fontSize: "13px", color: "#475569", margin: "10px 0 4px" };
  const input = { width: "100%", maxWidth: "380px", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", boxSizing: "border-box" };
  const btn = { marginTop: "14px", padding: "8px 16px", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };
  const readonlyRow = { display: "flex", gap: "10px", padding: "6px 0", fontSize: "14px" };

  const showMessage = (m) =>
    m.text && (
      <p style={{ color: m.type === "ok" ? "#166534" : "#b91c1c", margin: "10px 0 0" }}>{m.text}</p>
    );

  return (
    <div style={{ padding: "24px", maxWidth: "720px" }}>
      <h2 style={{ margin: 0 }}>My Profile</h2>
      <p style={{ color: "#64748b", marginTop: "6px" }}>
        Update your name, phone number and password.
      </p>

      {profile && (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Account</h3>
          <div style={readonlyRow}><strong style={{ width: "120px" }}>Email</strong>{profile.email}</div>
          <div style={readonlyRow}><strong style={{ width: "120px" }}>Role</strong>{prettyRole(profile.role)}</div>
          {profile.institutionName && (
            <div style={readonlyRow}><strong style={{ width: "120px" }}>Institution</strong>{profile.institutionName}</div>
          )}
          {profile.departmentName && (
            <div style={readonlyRow}><strong style={{ width: "120px" }}>Department</strong>{profile.departmentName}</div>
          )}
          <p style={{ color: "#94a3b8", fontSize: "12px", margin: "8px 0 0" }}>
            Email, role, institution and department can only be changed by an administrator.
          </p>
        </div>
      )}

      <form style={card} onSubmit={saveProfile}>
        <h3 style={{ marginTop: 0 }}>Personal details</h3>

        <label style={label}>Full name</label>
        <input style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} required />

        <label style={label}>Phone number</label>
        <input
          style={input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          maxLength={20}
        />

        <button style={btn} type="submit" disabled={savingProfile}>
          {savingProfile ? "Saving..." : "Save changes"}
        </button>
        {showMessage(profileMessage)}
      </form>

      <form style={card} onSubmit={savePassword}>
        <h3 style={{ marginTop: 0 }}>Change password</h3>

        <label style={label}>Current password</label>
        <input style={input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

        <label style={label}>New password (at least 6 characters)</label>
        <input style={input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />

        <label style={label}>Confirm new password</label>
        <input style={input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />

        <button style={btn} type="submit" disabled={savingPassword}>
          {savingPassword ? "Changing..." : "Change password"}
        </button>
        {showMessage(passwordMessage)}
      </form>
    </div>
  );
}

export default Profile;