import { useState, useMemo } from "react";
import { ClipboardList, Eye, Play, Send, Clock, RefreshCw } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { EmptyState } from "../../common/EmptyState.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { formatDate } from "../../../utils/formatters.js";

/* ================================================================== */
/*  Technician -> Maintenance -> Assigned Tasks (Work Orders list)     */
/* ================================================================== */
export default function MaintenanceRequests({ tasks, equipmentById, onOpen }) {
  const [filterTab, setFilterTab] = useState("ALL");

  const counts = useMemo(() => {
    return {
      ALL: tasks.length,
      ACTION_REQUIRED: tasks.filter((t) => t.status === "ASSIGNED").length,
      WAITING_MANAGER: tasks.filter((t) => t.status === "PENDING_MANAGER_REVIEW").length,
      READY_TO_START: tasks.filter((t) => t.status === "ACCEPTED" || t.status === "FINALIZED").length,
      IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      AWAITING_VERIFICATION: tasks.filter((t) => t.status === "PENDING_VERIFICATION").length,
      REWORK_REQUIRED: tasks.filter((t) => t.status === "REJECTED").length,
      COMPLETED: tasks.filter((t) => t.status === "COMPLETED").length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    switch (filterTab) {
      case "ACTION_REQUIRED":
        return tasks.filter((t) => t.status === "ASSIGNED");
      case "WAITING_MANAGER":
        return tasks.filter((t) => t.status === "PENDING_MANAGER_REVIEW");
      case "READY_TO_START":
        return tasks.filter((t) => t.status === "ACCEPTED" || t.status === "FINALIZED");
      case "IN_PROGRESS":
        return tasks.filter((t) => t.status === "IN_PROGRESS");
      case "AWAITING_VERIFICATION":
        return tasks.filter((t) => t.status === "PENDING_VERIFICATION");
      case "REWORK_REQUIRED":
        return tasks.filter((t) => t.status === "REJECTED");
      case "COMPLETED":
        return tasks.filter((t) => t.status === "COMPLETED");
      default:
        return tasks;
    }
  }, [tasks, filterTab]);

  const getActionButton = (task) => {
    const s = task.status;
    if (s === "ASSIGNED") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(task.id); }}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Clock size={13} /> Respond to Schedule
        </button>
      );
    }
    if (s === "ACCEPTED" || s === "FINALIZED") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(task.id); }}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Play size={13} /> Start Work
        </button>
      );
    }
    if (s === "IN_PROGRESS") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(task.id); }}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Send size={13} /> Submit Completion
        </button>
      );
    }
    if (s === "REJECTED") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(task.id); }}
          className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} /> Address Rework
        </button>
      );
    }
    if (s === "PENDING_MANAGER_REVIEW") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(task.id); }}
          className="rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Clock size={13} /> Waiting for Manager
        </button>
      );
    }
    if (s === "PENDING_VERIFICATION") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(task.id); }}
          className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Clock size={13} /> Under Verification
        </button>
      );
    }
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onOpen(task.id); }}
        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Eye size={13} /> View Details
      </button>
    );
  };

  const tabs = [
    { id: "ALL", label: "All Tasks", count: counts.ALL },
    { id: "ACTION_REQUIRED", label: "Respond to Schedule", count: counts.ACTION_REQUIRED, alert: counts.ACTION_REQUIRED > 0 },
    { id: "WAITING_MANAGER", label: "Waiting for Manager", count: counts.WAITING_MANAGER },
    { id: "READY_TO_START", label: "Ready to Start", count: counts.READY_TO_START, highlight: counts.READY_TO_START > 0 },
    { id: "IN_PROGRESS", label: "In Progress", count: counts.IN_PROGRESS },
    { id: "AWAITING_VERIFICATION", label: "Awaiting Verification", count: counts.AWAITING_VERIFICATION },
    { id: "REWORK_REQUIRED", label: "Rework Required", count: counts.REWORK_REQUIRED, alert: counts.REWORK_REQUIRED > 0 },
    { id: "COMPLETED", label: "Completed", count: counts.COMPLETED },
  ];

  return (
    <div className="w-full space-y-4">
      <ViewHeader title="Assigned Tasks" subtitle="Work orders assigned to you by the Lab Manager." />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                filterTab === tab.id
                  ? "bg-slate-800 text-white"
                  : tab.alert
                  ? "bg-red-500 text-white"
                  : tab.highlight
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No tasks in this category" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-xs">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">Request ID</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">Equipment</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">Issue Type</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">Priority</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">Status</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap">Schedule / Target</th>
                <th className="px-5 py-3 font-semibold text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <tr key={t.id} onClick={() => onOpen(t.id)} className="cursor-pointer hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-blue-600 whitespace-nowrap">{t.maintenanceCode || t.id}</td>
                  <td className="px-5 py-3.5 text-slate-900 font-semibold max-w-[220px] truncate">
                    {equipmentById[t.equipmentId]?.name || t.equipmentName || "Lab Equipment"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate">{t.issueType}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={t.priority} /></td>
                  <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3.5 text-slate-900 font-semibold text-xs whitespace-nowrap">
                    {t.finalStartDatetime
                      ? new Date(t.finalStartDatetime).toLocaleDateString()
                      : t.managerTargetStartDatetime
                      ? new Date(t.managerTargetStartDatetime).toLocaleDateString()
                      : t.targetEndDate || formatDate(t.dueDate) || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {getActionButton(t)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
