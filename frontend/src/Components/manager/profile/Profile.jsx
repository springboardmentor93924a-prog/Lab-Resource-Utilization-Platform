import { useState, useEffect } from "react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { Field, inputClass } from "../../common/Field.jsx";

/* ================================================================== */
/*  Manager -> Profile                                                  */
/* ================================================================== */
export default function Profile({ user, toast }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || user.phoneNumber });

  useEffect(() => {
    setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || user.phoneNumber });
  }, [user]);

  return (
    <div>
      <ViewHeader title="Profile" subtitle="Manage your Lab Manager account details." />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
            {user.firstName?.[0] || "N"}{user.lastName?.[0] || "S"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-slate-900">{user.firstName} {user.lastName}</p>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                {user.role || "Lab Manager"}
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
            <input disabled value={user.role || "Lab Manager"} className={`${inputClass()} bg-blue-50/60 text-blue-700 font-bold`} />
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
    </div>
  );
}
