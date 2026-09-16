import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Save,
  X,
  Loader2,
  Calendar,
  User,
  ExternalLink,
  RefreshCw,
  Landmark,
} from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { authApi } from "../../../api/authApi.js";
import { profileApi } from "../../../api/profileApi.js";

export default function Profile({ user: initialUser, toast }) {
  const [user, setUser] = useState(initialUser || null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Profile Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [editErrors, setEditErrors] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current user from /api/auth/me
      const userData = await authApi.me();
      setUser(userData);

      // 2. Fetch full institution details from /api/institutions/{id}
      if (userData?.institutionId) {
        const instData = await authApi.getInstitution(userData.institutionId);
        setInstitution(instData);
      }
    } catch (err) {
      console.error("Failed to load profile data:", err);
      setError(err?.message || "Unable to load profile information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenEdit = () => {
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!editForm.firstName.trim()) {
      errs.firstName = "First name is required.";
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const updated = await profileApi.update({
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phoneNumber: editForm.phoneNumber.trim() || undefined,
      });

      setUser((prev) => ({
        ...prev,
        ...updated,
      }));

      setIsEditOpen(false);
      toast?.("Administrator profile updated successfully.", "success");
    } catch (err) {
      toast?.(err?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Not provided";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Not provided";
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Not provided";
    }
  };

  // -------------------------------------------------------------
  // Loading Skeleton State
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <ViewHeader
          title="Profile"
          subtitle="Manage your Institution Administrator account and institution information."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 h-64 bg-slate-50/50" />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 h-64 bg-slate-50/50" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Error State with Retry
  // -------------------------------------------------------------
  if (error || !user) {
    return (
      <div className="space-y-6">
        <ViewHeader
          title="Profile"
          subtitle="Manage your Institution Administrator account and institution information."
        />
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Failed to Load Profile</h3>
          <p className="text-sm text-slate-600">{error || "Unable to retrieve real profile details from backend."}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || "A"}${user.lastName?.[0] || ""}`.toUpperCase();
  const instInitials = (institution?.name || user?.institutionName || "IN")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ViewHeader
          title="Profile"
          subtitle="Manage your Institution Administrator account and institution information."
        />
        <button
          onClick={handleOpenEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all self-start sm:self-auto"
        >
          <Edit3 size={16} /> Edit Profile
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ADMINISTRATOR IDENTITY HERO CARD                            */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Institution Logo / Avatar */}
          <div className="relative flex-shrink-0">
            {institution?.logoSecureUrl ? (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shadow-xs overflow-hidden">
                <img
                  src={institution.logoSecureUrl}
                  alt={`${institution.name || "Institution"} Logo`}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-2xl font-black shadow-xs">
                {instInitials || initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white ring-2 ring-white shadow-xs" title="Institution Administrator">
              <ShieldCheck size={16} />
            </div>
          </div>

          {/* User & Institution Title */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-0.5 text-xs font-bold text-purple-700">
                <ShieldCheck size={12} /> Institution Administrator
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 size={16} className="text-slate-400" />
              {institution?.name || user.institutionName || "Institution-wide Scope"}
              {institution?.code && (
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {institution.code}
                </span>
              )}
            </p>

            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Mail size={15} className="text-slate-400" />
              {user.email}
            </p>
          </div>

          {/* Key Status Indicators */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                user.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${user.isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              Account {user.isActive ? "Active" : "Inactive"}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                user.isEmailVerified
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {user.isEmailVerified ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              Email {user.isEmailVerified ? "Verified" : "Not Verified"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {user.isPhoneVerified ? <CheckCircle2 size={13} className="text-emerald-600" /> : <XCircle size={13} className="text-slate-400" />}
              Phone {user.isPhoneVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TWO-COLUMN DATA GRID (ADMIN DETAILS & INSTITUTION DETAILS)  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN: ADMINISTRATOR INFORMATION                   */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Administrator Information</h3>
                <p className="text-xs text-slate-500">Designated institutional administrator identity</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">First Name</label>
              <p className="mt-1 text-sm font-bold text-slate-900">{user.firstName || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Name</label>
              <p className="mt-1 text-sm font-bold text-slate-900">{user.lastName || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Email</label>
              <p className="mt-1 text-sm font-mono text-slate-800 truncate" title={user.email}>
                {user.email || "Not provided"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <p className="mt-1 text-sm text-slate-800">{user.phoneNumber || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Role</label>
              <p className="mt-1 text-sm font-bold text-purple-700">Institution Administrator</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department Scope</label>
              <p className="mt-1 text-sm font-semibold text-slate-700 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Institution-wide
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</label>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {user.isActive ? "Active (Authorized)" : "Inactive / Pending"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Since</label>
              <p className="mt-1 text-sm text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Role & Scope Notice:</p>
            <p>
              As an Institution Administrator, your permissions span across all departments, equipment laboratories, and research staff within your designated institution.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: INSTITUTION INFORMATION                     */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Landmark size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Institution Information</h3>
                <p className="text-xs text-slate-500">Official registered institution profile</p>
              </div>
            </div>

            {institution?.approvalStatus && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  institution.approvalStatus === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : institution.approvalStatus === "PENDING"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {institution.approvalStatus}
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Name</label>
              <p className="mt-1 text-sm font-bold text-slate-900">{institution?.name || user.institutionName || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Code</label>
              <p className="mt-1 text-sm font-mono font-bold text-blue-600">{institution?.code || user.institutionCode || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Type</label>
              <p className="mt-1 text-sm text-slate-800">{institution?.institutionType || "Autonomous Engineering College"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Official Email</label>
              <p className="mt-1 text-sm font-mono text-slate-800 truncate" title={institution?.contactEmail}>
                {institution?.contactEmail || "Not provided"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Official Phone</label>
              <p className="mt-1 text-sm text-slate-800">{institution?.contactPhone || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Website</label>
              {institution?.website ? (
                <a
                  href={institution.website.startsWith("http") ? institution.website : `https://${institution.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                >
                  <span className="truncate">{institution.website.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink size={13} className="opacity-60 group-hover:opacity-100 flex-shrink-0" />
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Not provided</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Overview</label>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              {institution?.description || "No detailed institutional description provided."}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CAMPUS LOCATION & SYSTEM AUDIT CARDS                       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Campus Location Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Location</h3>
              <p className="text-xs text-slate-500">Physical address registered with the platform</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</label>
              <p className="mt-1 text-slate-800 font-medium">{institution?.address || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
              <p className="mt-1 text-slate-800 font-medium">{institution?.city || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">State</label>
              <p className="mt-1 text-slate-800 font-medium">{institution?.state || "Not provided"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</label>
              <p className="mt-1 text-slate-800 font-medium">{institution?.country || "India"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Postal / Pincode</label>
              <p className="mt-1 text-slate-800 font-mono font-medium">{institution?.pincode || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* System & Audit Review Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Organization & Approval Status</h3>
              <p className="text-xs text-slate-500">Verification & platform authorization records</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Status</label>
              <p className="mt-1 font-bold text-emerald-700">{institution?.approvalStatus || "APPROVED"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operational Status</label>
              <p className="mt-1 font-bold text-slate-900">
                {institution?.isActive ? "Active Platform Participant" : "Inactive"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Date</label>
              <p className="mt-1 text-slate-700">{formatDate(institution?.createdAt || user.createdAt)}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review Records</label>
              <p className="mt-1 text-slate-700">
                {institution?.reviewedAt ? formatDate(institution.reviewedAt) : "Foundational Approved Institution"}
              </p>
            </div>
          </div>

          {institution?.rejectionReason && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <span className="font-bold">Rejection Note: </span> {institution.rejectionReason}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. EDIT PROFILE MODAL                                         */}
      {/* ------------------------------------------------------------- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Administrator Profile</h3>
                <p className="text-xs text-slate-500">Update your personal contact details</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" error={editErrors.firstName}>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => {
                      setEditForm((f) => ({ ...f, firstName: e.target.value }));
                      if (editErrors.firstName) setEditErrors((prev) => ({ ...prev, firstName: undefined }));
                    }}
                    className={inputClass(editErrors.firstName)}
                    placeholder="Enter first name"
                  />
                </Field>

                <Field label="Last Name">
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                    className={inputClass()}
                    placeholder="Enter last name"
                  />
                </Field>
              </div>

              <Field label="Phone Number">
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className={inputClass()}
                  placeholder="e.g. +91 98765 43210"
                />
              </Field>

              {/* Read-only System Fields Warning */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-700">Protected Account Fields (Read-Only):</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Work Email: <span className="font-mono font-medium text-slate-800">{user.email}</span></div>
                  <div>Account Role: <span className="font-semibold text-purple-700">Institution Administrator</span></div>
                  <div>Department: <span className="font-medium text-slate-800">Institution-wide</span></div>
                  <div>Institution: <span className="font-medium text-slate-800">{institution?.code || "Current"}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
