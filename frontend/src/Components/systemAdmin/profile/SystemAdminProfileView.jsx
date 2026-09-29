import React, { useState, useEffect } from "react";
import { UserRound, Lock, Save, RefreshCw, CheckCircle2 } from "lucide-react";
import { profileApi } from "../../../api/profileApi";

export default function SystemAdminProfileView({ toast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileApi.getProfile();
      setProfile(data || {});
      setProfileForm({
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        phoneNumber: data?.phoneNumber || ""
      });
    } catch (err) {
      toast?.(err.message || "Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await profileApi.updateProfile(profileForm);
      setProfile((prev) => ({ ...prev, ...updated }));
      toast?.("Profile updated successfully!", "success");
    } catch (err) {
      toast?.(err.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast?.("New password and confirmation do not match.", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast?.("New password must be at least 6 characters.", "error");
      return;
    }

    setSavingPassword(true);
    try {
      await profileApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast?.("Password changed successfully!", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast?.(err.message || "Failed to change password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">System Admin Profile</h1>
        <p className="text-sm text-slate-600">Manage your platform administrator credentials and security.</p>
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleUpdateProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
          <UserRound size={16} className="text-blue-600" /> Personal Information
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Read Only)</label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={profileForm.phoneNumber}
              onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={14} /> {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
          <Lock size={16} className="text-blue-600" /> Security & Password
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Lock size={14} /> {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
