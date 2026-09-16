import { useState, useEffect } from "react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { Modal } from "../../common/Modal.jsx";

/* ================================================================== */
/*  Researcher -> Profile                                              */
/* ================================================================== */
export default function Profile({ user = {}, bookings = [], toast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName || "Nivetha",
    lastName: user.lastName || "S",
    phone: user.phone || user.phoneNumber || "7530086674",
  });
  const [pwModal, setPwModal] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || (user.name ? user.name.split(" ")[0] : "Nivetha"),
        lastName: user.lastName || (user.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : "S"),
        phone: user.phone || user.phoneNumber || "7530086674",
      });
    }
  }, [user]);

  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    noShow: bookings.filter((b) => b.status === "NO_SHOW").length,
  };

  const save = () => {
    setEditing(false);
    toast("Profile updated.", "success");
  };

  const firstNameDisplay = form.firstName || user.firstName || user.name?.split(" ")[0] || "";
  const lastNameDisplay = form.lastName || user.lastName || user.name?.split(" ").slice(1).join(" ") || "";
  const emailDisplay = user.email || "Not provided";
  const phoneDisplay = form.phone || user.phone || user.phoneNumber || "Not provided";
  const instDisplay = user.institutionName || user.institution || "Not assigned";
  const deptDisplay = user.departmentName || user.department || "Not assigned";

  return (
    <div>
      <ViewHeader title="Profile" subtitle="Manage your account details and view your usage summary." />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
              {firstNameDisplay[0]}{lastNameDisplay[0] || ""}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-slate-900">{firstNameDisplay} {lastNameDisplay}</p>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  {user.role || "Student / Researcher"}
                </span>
              </div>
              <p className="text-sm text-slate-500">{emailDisplay}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <input disabled={!editing} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Last Name">
              <input disabled={!editing} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Email"><input disabled value={emailDisplay} className={`${inputClass()} bg-slate-50 text-slate-500`} /></Field>
            <Field label="Phone">
              <input disabled={!editing} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Account Role">
              <input disabled value={user.role || "Student / Researcher"} className={`${inputClass()} bg-emerald-50/60 text-emerald-700 font-bold`} />
            </Field>
            <Field label="Institution"><input disabled value={instDisplay} className={`${inputClass()} bg-slate-50 text-slate-500`} /></Field>
            <Field label="Department"><input disabled value={deptDisplay} className={`${inputClass()} bg-slate-50 text-slate-500`} /></Field>
          </div>

          <div className="mt-6 flex gap-3">
            {editing ? (
              <>
                <button onClick={save} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">Save Changes</button>
                <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">Edit Profile</button>
                <button onClick={() => setPwModal(true)} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors">Change Password</button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Usage Stats</h3>
          <div className="space-y-3">
            {[
              { label: "Total Bookings", value: stats.total, tone: "text-blue-600" },
              { label: "Completed", value: stats.completed, tone: "text-emerald-600" },
              { label: "Cancelled", value: stats.cancelled, tone: "text-slate-500" },
              { label: "No Show", value: stats.noShow, tone: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <span className={`text-sm font-extrabold ${s.tone}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pwModal && (
        <Modal title="Change Password" onClose={() => setPwModal(false)}>
          <div className="space-y-3">
            <Field label="Current Password"><input type="password" className={inputClass()} placeholder="••••••••" /></Field>
            <Field label="New Password"><input type="password" className={inputClass()} placeholder="••••••••" /></Field>
            <button
              onClick={() => { setPwModal(false); toast("Password updated.", "success"); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
