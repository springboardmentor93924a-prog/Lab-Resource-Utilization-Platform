import { useState } from "react";
import { Camera, Eye, Download, Calendar, Clock, FileText } from "lucide-react";
import { ViewHeader } from "../../common/ViewHeader.jsx";
import { Field, inputClass } from "../../common/Field.jsx";
import { StatusBadge } from "../../common/StatusBadge.jsx";
import { Modal } from "../../common/Modal.jsx";

/* ================================================================== */
/*  Researcher -> Issue Report -> Report Issue                         */
/* ================================================================== */
export default function ReportIssue({ equipment, myBookings = [], myReports = [], equipmentById, prefillEquipmentId, onSubmit }) {
  // Extract unique equipment IDs that the user has booked
  const bookedEquipmentIds = new Set(
    myBookings.map((b) => Number(b.equipmentId) || b.equipmentId)
  );

  // Filter equipment catalog to ONLY show instruments booked by the student
  const bookedEquipment = equipment.filter(
    (e) => bookedEquipmentIds.has(e.id) || bookedEquipmentIds.has(Number(e.id))
  );

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().slice(0, 5);

  const [equipmentId, setEquipmentId] = useState(prefillEquipmentId || "");
  const [issueType, setIssueType] = useState("Mechanical Fault");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [incidentDate, setIncidentDate] = useState(todayStr);
  const [incidentTime, setIncidentTime] = useState(timeStr);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);

  const locked = Boolean(prefillEquipmentId);

  const submit = () => {
    const e = {};
    if (bookedEquipment.length === 0 && !locked) return;
    if (!equipmentId) e.equipmentId = "Select the equipment with an issue.";
    if (!description.trim()) e.description = "Please describe the problem.";
    if (!incidentDate) e.incidentDate = "Select the date of incident.";
    if (!incidentTime) e.incidentTime = "Select the time of incident.";
    setErrors(e);
    if (Object.keys(e).length) return;

    onSubmit({
      equipmentId,
      issueType,
      description,
      priority,
      date: incidentDate,
      time: incidentTime,
      attachment: fileName || "None",
    });

    setDescription("");
    setFileName("");
  };

  const downloadReport = (report) => {
    const eq = equipmentById[report.equipmentId] || {};
    const content = `
================================================================
                    LABFLOW PRO - ISSUE REPORT
================================================================
Report Reference ID : ${report.id}
Status              : ${report.status || "OPEN"}
Reported Date       : ${report.date || todayStr}
Reported Time       : ${report.time || timeStr}
Priority            : ${report.priority || "MEDIUM"}
Issue Type          : ${report.issueType || "Equipment Fault"}

----------------------------------------------------------------
EQUIPMENT DETAILS
----------------------------------------------------------------
Equipment Name     : ${eq.name || "Booked Equipment"}
Category           : ${eq.category || "General"}
Department         : ${eq.department || eq.departmentName || "Engineering"}
Laboratory         : ${eq.labName || "—"}
Location           : ${eq.location || "—"}
Serial Number      : ${eq.serialNumber || "N/A"}

----------------------------------------------------------------
PROBLEM DESCRIPTION & NOTES
----------------------------------------------------------------
${report.description || "No description provided."}

Attachment         : ${report.attachment || "None"}
Reported By        : You (Researcher / Student)
Generated On       : ${new Date().toLocaleString()}
================================================================
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Issue_Report_${report.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <ViewHeader title="Report Issue" subtitle="Flag a problem with laboratory equipment you have booked, view status, and download reports." />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          {bookedEquipment.length === 0 && !locked ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
              <p className="font-bold text-amber-900 text-sm">No Booked Equipment Available</p>
              <p className="text-xs text-amber-700">
                You can only report issues for equipment that you have booked. Once you book an instrument, it will appear here for issue reporting.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Booked Equipment" required error={errors.equipmentId}>
                {locked ? (
                  <input readOnly value={equipmentById[equipmentId]?.name || ""} className={`${inputClass()} bg-slate-50 text-slate-500`} />
                ) : (
                  <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className={inputClass(errors.equipmentId)}>
                    <option value="">Select your booked equipment…</option>
                    {bookedEquipment.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.department || e.location || "Lab"})
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Issue Type">
                  <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={inputClass()}>
                    {["Mechanical Fault", "Electrical Fault", "Software Issue", "Calibration Issue", "Other"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass()}>
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Date & Time of Incident */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Date of Incident" required error={errors.incidentDate}>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className={inputClass(errors.incidentDate)}
                  />
                </Field>
                <Field label="Time of Incident" required error={errors.incidentTime}>
                  <input
                    type="time"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className={inputClass(errors.incidentTime)}
                  />
                </Field>
              </div>

              <Field label="Problem Description" required error={errors.description}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what happened with your booked equipment…"
                  className={inputClass(errors.description)}
                />
              </Field>

              <Field label="Attachment">
                <label className="w-full rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 transition-colors py-5 flex flex-col items-center justify-center gap-1 text-slate-500 cursor-pointer">
                  <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
                  <Camera size={18} className="text-blue-600" />
                  <span className="text-xs">{fileName || "Attach a photo or document"}</span>
                </label>
              </Field>

              <button onClick={submit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Submit Damage Report
              </button>
            </div>
          )}
        </div>

        {/* Sidebar: Reported Issues List with View Details & Download */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Your Reported Issues</span>
              <span className="text-xs font-semibold text-slate-500">({myReports.length})</span>
            </h3>

            {myReports.length === 0 ? (
              <p className="text-xs text-slate-400">You haven't reported any issues yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {myReports.map((m) => {
                  const eq = equipmentById[m.equipmentId] || {};
                  return (
                    <div key={m.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2 hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-700">{m.id}</span>
                        <StatusBadge status={m.status || "OPEN"} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate">{eq.name || "Booked Equipment"}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {m.date || todayStr}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {m.time || timeStr}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => setSelectedReport(m)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold py-1.5 text-xs transition-colors shadow-2xs"
                        >
                          <Eye size={13} className="text-blue-600" /> View Details
                        </button>
                        <button
                          onClick={() => downloadReport(m)}
                          className="flex items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1.5 text-xs transition-colors"
                          title="Download Issue Report"
                        >
                          <Download size={13} /> Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedReport && (
        <Modal
          title="Issue Report Details"
          subtitle={`Reference ID: ${selectedReport.id}`}
          onClose={() => setSelectedReport(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                <div className="mt-1"><StatusBadge status={selectedReport.status || "OPEN"} /></div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</p>
                <p className="text-xs font-extrabold text-red-600 mt-1">{selectedReport.priority || "MEDIUM"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div>
                <p className="font-semibold text-slate-400 uppercase text-[10px]">Equipment Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{equipmentById[selectedReport.equipmentId]?.name || "Booked Equipment"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase text-[10px]">Issue Type</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedReport.issueType || "Mechanical Fault"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase text-[10px]">Date of Incident</p>
                <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" /> {selectedReport.date || todayStr}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase text-[10px]">Time of Incident</p>
                <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" /> {selectedReport.time || timeStr}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-400 uppercase text-[10px]">Problem Description</p>
              <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                {selectedReport.description}
              </p>
            </div>

            {selectedReport.attachment && selectedReport.attachment !== "None" && (
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-400 uppercase text-[10px]">Attachment</p>
                <p className="font-medium text-blue-600 flex items-center gap-1">
                  <Camera size={13} /> {selectedReport.attachment}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => downloadReport(selectedReport)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 transition-colors shadow-sm"
              >
                <Download size={14} /> Download Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
