import React, { useState, useEffect } from "react";
import { ScrollText, RefreshCw, Search, Filter, ShieldAlert, FileText, Clock, User } from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function AuditLogsView({ toast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null); // Modal for full payload details

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await authApi.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      toast?.(err.message || "Failed to load platform audit logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search.trim() ||
      (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.entityType || "").toLowerCase().includes(search.toLowerCase()) ||
      String(log.userId || "").includes(search) ||
      String(log.entityId || "").includes(search);

    const matchesEntity =
      entityFilter === "ALL" ||
      (log.entityType || "").toUpperCase() === entityFilter.toUpperCase();

    return matchesSearch && matchesEntity;
  });

  const uniqueEntityTypes = Array.from(
    new Set(logs.map((l) => (l.entityType || "").toUpperCase()).filter(Boolean))
  );

  const actionBadge = (actionStr) => {
    const act = (actionStr || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("REGISTER") || act.includes("APPROVE")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (act.includes("REJECT") || act.includes("DEACTIVATE") || act.includes("DELETE") || act.includes("CANCEL")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (act.includes("UPDATE") || act.includes("TOGGLE")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading platform audit logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Audit Trail</h1>
          <p className="text-sm text-slate-600">Immutable audit logs of administrative actions, user toggles, and institution approvals.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, entity type, user ID, or entity ID..."
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <label className="text-xs font-bold text-slate-500 uppercase">Entity:</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-auto"
          >
            <option value="ALL">All Entity Types</option>
            {uniqueEntityTypes.map((et) => (
              <option key={et} value={et}>{et}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500">Showing {filteredLogs.length} audit log entry{filteredLogs.length === 1 ? "" : "ies"}</p>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Log ID & Timestamp</th>
                <th className="px-5 py-3">User ID</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Entity Type & ID</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <ScrollText size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">No Audit Logs Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">No platform audit events match your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.auditId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-bold text-slate-900">#{log.auditId}</p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        User #{log.userId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${actionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{log.entityType}</p>
                      <p className="text-[11px] font-mono text-slate-500">Entity ID: {log.entityId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors"
                      >
                        <FileText size={14} /> View State
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Log Payload */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Audit Log Payload #{selectedLog.auditId}</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Action:</span>
                  <p className="font-bold text-slate-900">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">User ID:</span>
                  <p className="font-bold text-slate-900">#{selectedLog.userId}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Entity Type:</span>
                  <p className="font-bold text-slate-900">{selectedLog.entityType}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Entity ID:</span>
                  <p className="font-bold text-slate-900">#{selectedLog.entityId}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Old State Value</h4>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.oldValue ? JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2) : "null"}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">New State Value</h4>
                <pre className="bg-slate-900 text-sky-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.newValue ? JSON.stringify(JSON.parse(selectedLog.newValue), null, 2) : "null"}
                </pre>
              </div>
            </div>

            <div className="pt-2 text-right border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
