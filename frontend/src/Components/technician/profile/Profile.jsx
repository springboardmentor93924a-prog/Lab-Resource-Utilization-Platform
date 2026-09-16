import { useState, useEffect } from "react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { Field, inputClass } from "../../common/Field.jsx";

/* ================================================================== */
/*  Technician -> Profile                                              */
/* ================================================================== */
export default function Profile({ user, tasks, toast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || user.phoneNumber });

  useEffect(() => {
    setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || user.phoneNumber });
  }, [user]);

  const resolved = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div>
      <ViewHeader title="Profile" subtitle="Manage your technician account details." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
              {user.firstName?.[0] || "T"}{user.lastName?.[0] || "S"}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                  {user.role || "Lab Technician"}
                </span>
              </div>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <input disabled={!editing} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Last Name">
              <input disabled={!editing} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Email"><input disabled value={user.email} className={`${inputClass()} bg-slate-50 text-slate-500`} /></Field>
            <Field label="Phone">
              <input disabled={!editing} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={`${inputClass()} ${!editing ? "bg-slate-50 text-slate-500" : ""}`} />
            </Field>
            <Field label="Account Role">
              <input disabled value={user.role || "Lab Technician"} className={`${inputClass()} bg-slate-100/80 text-slate-800 font-bold`} />
            </Field>
            <Field label="Department"><input disabled value={user.department || "Computer Science and Engineering"} className={`${inputClass()} bg-slate-50 text-slate-500`} /></Field>
          </div>
          <div className="mt-6 flex gap-3">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); toast("Profile updated.", "success"); }} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">Save Changes</button>
                <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors">Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors">Edit Profile</button>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Work Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
              <span className="text-xs font-semibold text-slate-500">Assigned Tasks</span>
              <span className="text-sm font-extrabold text-blue-600">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
              <span className="text-xs font-semibold text-slate-500">Resolved</span>
              <span className="text-sm font-extrabold text-emerald-600">{resolved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
