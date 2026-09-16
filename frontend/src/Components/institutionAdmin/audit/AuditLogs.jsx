import { useState, useEffect } from "react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { API_BASE_URL } from "../../../api/client.js";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("labflow_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_BASE_URL}/audit-logs`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLogs(data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <ViewHeader title="Audit Logs" subtitle="A record of institution-level administrative actions." />
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading audit logs…</div>
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs recorded for your institution" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-sm">
          {logs.map((log) => {
            const logId = log.auditId || log.id;
            const actionText = log.action ? `${log.action} on ${log.entityType || "entity"} (ID: ${log.entityId || "N/A"})` : "System action";
            const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleString() : "Recently";
            return (
              <div key={logId} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{actionText}</p>
                  <p className="text-xs text-slate-500 mt-0.5">User ID: {log.userId || "System"}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{timeStr}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
