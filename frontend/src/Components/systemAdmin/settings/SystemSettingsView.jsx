import React, { useState, useEffect } from "react";
import { Settings, RefreshCw, Save, ShieldAlert, CheckCircle2, Building2, UserPlus, AlertOctagon, Info } from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function SystemSettingsView({ toast }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [instRegEnabled, setInstRegEnabled] = useState(true);
  const [researcherRegEnabled, setResearcherRegEnabled] = useState(true);
  const [maintMode, setMaintMode] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await authApi.getSystemSettings();
      setSettings(data);
      if (data) {
        setInstRegEnabled(Boolean(data.institutionRegistrationEnabled));
        setResearcherRegEnabled(Boolean(data.researcherRegistrationEnabled));
        setMaintMode(Boolean(data.maintenanceMode));
      }
    } catch (err) {
      toast?.(err.message || "Failed to load system settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authApi.updateSystemSettings({
        institutionRegistrationEnabled: instRegEnabled,
        researcherRegistrationEnabled: researcherRegEnabled,
        maintenanceMode: maintMode,
      });
      setSettings(updated);
      toast?.("System settings successfully persisted to database.", "success");
    } catch (err) {
      toast?.(err.message || "Failed to save system settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">System Settings & Governance</h1>
          <p className="text-sm text-slate-600">Configure platform-wide registration workflows, access controls, and maintenance windows.</p>
        </div>
        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Reload
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Onboarding & Registration Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" /> Registration & Onboarding Controls
            </h2>
            <p className="text-xs text-slate-500">Manage external registration entry points across the network.</p>
          </div>

          <div className="space-y-6">
            {/* Institution Registration Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Institution Registration Requests</p>
                <p className="text-xs text-slate-600 max-w-xl">
                  When enabled, new colleges and universities can submit registration applications. When disabled, the registration endpoint throws a 403 Forbidden error.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={instRegEnabled}
                  onChange={(e) => setInstRegEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Researcher Self-Registration Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Researcher & Student Self-Registration</p>
                <p className="text-xs text-slate-600 max-w-xl">
                  When enabled, scholars and students can submit new account requests. When disabled, self-registration is blocked by the backend authentication service.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={researcherRegEnabled}
                  onChange={(e) => setResearcherRegEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Maintenance Mode Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon size={20} className="text-amber-600" /> Platform Maintenance & Access Lock
            </h2>
            <p className="text-xs text-slate-500">Control system-wide availability during scheduled updates.</p>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Scheduled Maintenance Mode
                {maintMode && (
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                    ACTIVE
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-600 max-w-xl">
                When Maintenance Mode is ACTIVE, non-System Admin logins are rejected by the backend with a 503 Service Unavailable notice. Only System Administrators retain full platform access.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={maintMode}
                onChange={(e) => setMaintMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:translate-x-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>

        {/* Last Persisted Details & Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 space-y-0.5">
            {settings?.updatedAt && (
              <p>Last saved on: <span className="font-mono text-slate-700">{new Date(settings.updatedAt).toLocaleString()}</span></p>
            )}
            {settings?.updatedBy && (
              <p>Modified by: <span className="font-mono text-slate-700">User #{settings.updatedBy}</span></p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Persisting Settings..." : "Save System Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
