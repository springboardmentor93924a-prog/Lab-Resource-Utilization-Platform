import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Package, Search, RefreshCw, MapPin, Eye, Globe,
  ToggleLeft, ToggleRight, DollarSign, ChevronRight,
  AlertTriangle, CheckCircle, Clock, XCircle,
  Activity, Calendar, Wrench, Building2, X, Info,
  Filter, BarChart3, Zap, Shield
} from "lucide-react";
import { equipmentApi } from "../../../api/equipmentApi.js";
import { sharingApi } from "../../../api/sharingApi.js";

function computeExternalAvailability(agreements) {
  const now = new Date();
  const ag = (agreements || []).filter(a => a && (a.status||"").toUpperCase() === "ACTIVE");
  const buildDt = (date, time) => date ? new Date(`${date}T${time||"00:00:00"}`) : null;
  const active = ag.find(a => {
    const s = buildDt(a.startDate||a.start_date, a.availableStartTime||a.available_start_time);
    const e = buildDt(a.endDate||a.end_date, a.availableEndTime||a.available_end_time);
    return s && e && now >= s && now < e;
  });
  if (active) {
    const endDt = buildDt(active.endDate||active.end_date, active.availableEndTime||active.available_end_time||"23:59:59");
    return { state:"ACTIVE", agreement:active, endDt };
  }
  const upcoming = ag
    .filter(a => { const s = buildDt(a.startDate||a.start_date, a.availableStartTime||a.available_start_time); return s && s > now; })
    .sort((a,b) => buildDt(a.startDate||a.start_date, a.availableStartTime||a.available_start_time) - buildDt(b.startDate||b.start_date, b.availableStartTime||b.available_start_time))[0];
  if (upcoming) {
    const startDt = buildDt(upcoming.startDate||upcoming.start_date, upcoming.availableStartTime||upcoming.available_start_time);
    return { state:"UPCOMING", agreement:upcoming, startDt };
  }
  return { state:"NONE", agreement:null };
}

function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", { dateStyle:"medium", timeStyle:"short" });
}

function SharingPermissionBadge({ isShareable }) {
  return isShareable
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700"><Globe size={9}/> SHARING ENABLED</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-500"><Globe size={9}/> SHARING DISABLED</span>;
}

function ExternalAvailBadge({ avail }) {
  if (!avail || avail.state === "NONE") return null;
  return avail.state === "ACTIVE"
    ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold text-blue-700"><Zap size={9}/> EXT ACTIVE</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-700"><Clock size={9}/> UPCOMING</span>;
}

function StatusBadge({ status }) {
  const s = (status||"").toUpperCase();
  const map = {
    AVAILABLE:"bg-emerald-50 text-emerald-700 border-emerald-200",
    BOOKED:"bg-blue-50 text-blue-700 border-blue-200",
    IN_USE:"bg-blue-50 text-blue-700 border-blue-200",
    UNDER_MAINTENANCE:"bg-amber-50 text-amber-700 border-amber-200",
    MAINTENANCE:"bg-amber-50 text-amber-700 border-amber-200",
    OUT_OF_SERVICE:"bg-red-50 text-red-700 border-red-200",
    UNAVAILABLE:"bg-red-50 text-red-700 border-red-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${map[s]||"bg-slate-50 text-slate-600 border-slate-200"}`}>{s.replace(/_/g," ")}</span>;
}

function KpiStrip({ equipment, sharingEnabled, externalActive, pendingCount }) {
  const total = equipment.length;
  const avail = equipment.filter(e => (e.status||"").toUpperCase()==="AVAILABLE").length;
  const booked = equipment.filter(e => ["BOOKED","IN_USE"].includes((e.status||"").toUpperCase())).length;
  const maint = equipment.filter(e => ["UNDER_MAINTENANCE","MAINTENANCE","OUT_OF_SERVICE","UNAVAILABLE"].includes((e.status||"").toUpperCase())).length;
  const kpis = [
    {label:"Total",value:total,color:"text-slate-800",bg:"bg-slate-50",border:"border-slate-200"},
    {label:"Available",value:avail,color:"text-emerald-700",bg:"bg-emerald-50",border:"border-emerald-200"},
    {label:"Booked/In Use",value:booked,color:"text-blue-700",bg:"bg-blue-50",border:"border-blue-200"},
    {label:"Maint/OOS",value:maint,color:"text-amber-700",bg:"bg-amber-50",border:"border-amber-200"},
    {label:"Sharing ON",value:sharingEnabled,color:"text-purple-700",bg:"bg-purple-50",border:"border-purple-200"},
    {label:"Ext Active",value:externalActive,color:"text-blue-700",bg:"bg-blue-50",border:"border-blue-200"},
    {label:"Pending Req",value:pendingCount,color:pendingCount>0?"text-orange-700":"text-slate-600",bg:pendingCount>0?"bg-orange-50":"bg-slate-50",border:pendingCount>0?"border-orange-200":"border-slate-200"},
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-5">
      {kpis.map(k => (
        <div key={k.label} className={`rounded-xl border ${k.border} ${k.bg} px-3 py-2.5`}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
          <p className={`text-xl font-extrabold ${k.color}`}>{k.value}</p>
        </div>
      ))}
    </div>
  );
}

function EqImage({ src, name, size=56 }) {
  const [failed, setFailed] = useState(false);
  if (!failed && src && src.startsWith("http"))
    return <img src={src} alt={name} width={size} height={size} loading="lazy" onError={()=>setFailed(true)} style={{width:size,height:size,objectFit:"cover"}} className="rounded-xl shrink-0 border border-slate-100"/>;
  return <div style={{width:size,height:size}} className="shrink-0 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl">🔬</div>;
}

function SharingDrawer({ equipment: eq, agreements, onClose, onSaved }) {
  // Original values — used to detect dirty state and for Cancel restore
  const origShareable = !!eq.isShareable;
  const origRate = String(eq.externalHourlyRate ?? eq.externalRate ?? "");

  const [isShareable, setIsShareable] = useState(origShareable);
  const [rate, setRate] = useState(origRate);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const avail = useMemo(() => computeExternalAvailability(agreements), [agreements]);

  // Detect unsaved changes
  const isDirty = isShareable !== origShareable || String(rate) !== origRate;

  // Cancel — restore original values, no backend call
  const handleCancel = () => {
    setIsShareable(origShareable);
    setRate(origRate);
    setErr(null);
    onClose();
  };

  // Save — only fires on button click, exactly one PATCH request
  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    setErr(null);
    try {
      await equipmentApi.updateSharing(eq.id, {
        isShareable,
        externalHourlyRate: rate !== "" ? Number(rate) : null,
      });
      onSaved?.({ ...eq, isShareable, externalHourlyRate: rate !== "" ? Number(rate) : null });
      onClose();
    } catch (e) {
      // Keep drawer open, show real error from backend
      const msg = e?.message || "Failed to save.";
      setErr(msg.includes("403") ? "🚫 Permission denied — only Department Heads can update sharing settings." : `❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={handleCancel}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-purple-700 to-purple-900 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-200 uppercase tracking-widest">Department Head Decision Panel</p>
            <p className="text-base font-extrabold text-white mt-0.5">Inter-Institution Sharing Control</p>
          </div>
          <button onClick={handleCancel} className="text-purple-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5 text-xs">

          {/* Equipment identity card */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
            <EqImage src={eq.imageSecureUrl || eq.image} name={eq.name} size={52} />
            <div>
              <p className="font-extrabold text-slate-900 text-sm">{eq.name}</p>
              <p className="text-slate-500">{eq.category} · ID {eq.id}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {/* Show local (unsaved) sharing permission badge */}
                <SharingPermissionBadge isShareable={isShareable} />
                {/* External availability badge — based on REAL agreement data only */}
                <ExternalAvailBadge avail={avail} />
              </div>
              {isDirty && (
                <p className="text-[10px] text-amber-600 font-bold mt-1">● Unsaved changes</p>
              )}
            </div>
          </div>

          {/* ── Sharing Permission Toggle ─────────────────────── */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 space-y-3">
            <p className="text-[10px] font-extrabold text-purple-800 uppercase tracking-widest">
              Inter-Institution Sharing Permission
            </p>
            <p className="text-slate-600 leading-relaxed">
              When <strong>ON</strong>, other institutions are allowed to <strong>request</strong> this equipment.
              Enabling this does <strong>not</strong> make the equipment immediately available externally —
              an approved MOU agreement with a valid datetime window governs actual external access.
            </p>

            {/* Toggle — local state only, no backend call */}
            <button
              onClick={() => setIsShareable((v) => !v)}
              className={`flex items-center gap-2.5 w-full rounded-xl border px-4 py-3 font-bold text-sm transition-all ${
                isShareable
                  ? "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isShareable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              <span>{isShareable ? "ON — Sharing enabled" : "OFF — Sharing disabled"}</span>
            </button>

            {/* Eligibility sub-label — never says "SHARED" */}
            <p className={`text-[11px] font-semibold ${isShareable ? "text-emerald-700" : "text-slate-400"}`}>
              {isShareable
                ? "✅ Eligible for inter-institution sharing requests"
                : "Sharing requests from other institutions are blocked"}
            </p>

            <p className="text-[10px] text-slate-400 italic">
              ⚠ Only Department Heads and System Admins can change this setting.
              Lab Managers cannot override it.
            </p>
          </div>

          {/* ── External Hourly Rate ──────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              External Hourly Rate (₹/hr)
            </p>
            <p className="text-slate-500 leading-relaxed">
              Rate charged to the requesting institution per hour, as agreed in the MOU.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g. 750"
                className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ── External Availability (read-only, from real agreements) ── */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              External Availability
            </p>

            {avail.state === "ACTIVE" && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-extrabold text-emerald-700">EXTERNALLY ACTIVE</span>
                </div>
                <p className="text-slate-600">
                  Approved window ends: <strong>{fmtDate(avail.endDt)}</strong>
                  {avail.agreement?.hourlyRate ? ` · Agreed rate: ₹${avail.agreement.hourlyRate}/hr` : ""}
                </p>
              </div>
            )}

            {avail.state === "UPCOMING" && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-extrabold text-amber-700">UPCOMING</span>
                </div>
                <p className="text-slate-600">
                  Approved window starts: <strong>{fmtDate(avail.startDt)}</strong>
                </p>
              </div>
            )}

            {avail.state === "NONE" && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  <span className="font-extrabold text-slate-500">NOT ACTIVE</span>
                </div>
                <p className="text-slate-400 italic">No approved sharing agreement.</p>
              </div>
            )}

            <p className="text-[10px] text-slate-400 italic border-t border-slate-200 pt-2">
              Availability is determined by: currentDateTime ≥ approvedStartDateTime AND currentDateTime &lt; approvedEndDateTime.
              Manage agreements via the Sharing Requests workflow.
            </p>
          </div>

          {/* MOU Agreement History */}
          {agreements && agreements.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">MOU Agreement History</p>
              {agreements.slice(0, 3).map((ag, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {ag.requestingInstitutionName || ag.institutionName || "External Institution"}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      (ag.status || "").toUpperCase() === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>{ag.status}</span>
                  </div>
                  <p className="text-slate-500">
                    {ag.startDate || ag.start_date} → {ag.endDate || ag.end_date}
                    {ag.hourlyRate ? ` · ₹${ag.hourlyRate}/hr` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Error message — real backend error, drawer stays open */}
          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold p-3 text-xs">
              {err}
            </div>
          )}
        </div>

        {/* ── Footer: Cancel / Save Changes ──────────────────── */}
        <div className="border-t border-slate-200 p-4 flex gap-2.5 sticky bottom-0 bg-white">
          {/* Cancel — restores original values, no backend call */}
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold py-2.5 text-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Save Changes — disabled if no unsaved changes or already saving */}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsDrawer({ equipment:eq, agreements, onClose, onManageSharing }) {
  const avail = useMemo(() => computeExternalAvailability(agreements), [agreements]);
  let specsObj = null;
  try { specsObj = JSON.parse(eq.specifications||eq.specs||""); } catch {}

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm"/>
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equipment Details</p>
            <p className="text-base font-extrabold text-slate-900">{eq.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
        </div>
        <div className="flex-1 p-5 space-y-4 text-xs">
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
            <EqImage src={eq.imageSecureUrl||eq.image} name={eq.name} size={72}/>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 text-sm">{eq.name}</p>
              <p className="text-slate-500 truncate">{eq.category}</p>
              <p className="text-slate-400 font-mono">ID: {eq.id}</p>
              <div className="flex flex-wrap gap-1.5 mt-2"><StatusBadge status={eq.status}/><SharingPermissionBadge isShareable={eq.isShareable}/><ExternalAvailBadge avail={avail}/></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {label:"Lab Location", val:eq.location||"—", icon:<MapPin size={10} className="text-purple-600"/>},
              {label:"Calibration Status", val:eq.calibrationStatus||"NOT RECORDED", icon:<Activity size={10} className="text-blue-600"/>},
              {label:"Next Calibration", val:eq.nextCalibrationDue||eq.nextCalibration||"—", icon:<Calendar size={10} className="text-emerald-600"/>},
              {label:"Added On", val:eq.createdAt ? fmtDate(eq.createdAt):"—", icon:<Clock size={10} className="text-purple-600"/>},
              eq.capacityPerSlot && {label:"Capacity/Slot", val:`${eq.capacityPerSlot} concurrent users`, icon:<BarChart3 size={10} className="text-slate-500"/>},
              (eq.externalHourlyRate||eq.externalRate) && {label:"External Rate", val:`₹${eq.externalHourlyRate||eq.externalRate}/hr`, icon:<DollarSign size={10} className="text-purple-600"/>},
            ].filter(Boolean).map(({label,val,icon}) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">{icon}{label}</p>
                <p className="font-bold text-slate-900 leading-snug">{val}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Technical Specifications</p>
            {specsObj && typeof specsObj === "object" ? (
              <table className="w-full text-xs"><tbody className="divide-y divide-slate-100">
                {Object.entries(specsObj).map(([k,v]) => (
                  <tr key={k}><td className="py-1.5 pr-3 font-bold text-slate-500 w-1/3 capitalize">{k.replace(/_/g," ")}</td><td className="py-1.5 font-semibold text-slate-900">{String(v)}</td></tr>
                ))}
              </tbody></table>
            ) : <p className="text-slate-700 leading-relaxed">{eq.specifications||eq.specs||"No specifications recorded."}</p>}
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
            <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-widest">External Availability</p>
            {avail.state==="ACTIVE" && <p className="text-emerald-700 font-bold">🟢 Active until {fmtDate(avail.endDt)}</p>}
            {avail.state==="UPCOMING" && <p className="text-amber-700 font-bold">🟡 Starts {fmtDate(avail.startDt)}</p>}
            {avail.state==="NONE" && <p className="text-slate-400 italic">No active MOU agreements.</p>}
            <p className="text-[10px] text-slate-400">Sharing: <strong>{eq.isShareable ? "ENABLED":"DISABLED"}</strong></p>
          </div>

          {["UNDER_MAINTENANCE","MAINTENANCE"].includes((eq.status||"").toUpperCase()) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
              <p className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest"><Wrench size={11} className="inline mr-1"/>Active Maintenance</p>
              <div className="grid grid-cols-2 gap-2.5">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Technician</p><p className="font-extrabold text-slate-900">{eq.assignedTechnicianName||"NOT RECORDED"}</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Timeline</p><p>Start: <strong>{eq.repairStartDate||"—"}</strong></p><p className="text-amber-900 font-bold">End: <strong>{eq.repairEndDate||"—"}</strong></p></div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 p-4 flex gap-2.5 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold py-2.5 text-xs hover:bg-slate-50">Close</button>
          <button onClick={()=>{onClose();onManageSharing(eq);}} className="flex-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 text-xs flex items-center justify-center gap-1.5">
            <Globe size={13}/> Manage Sharing
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Equipment({ equipment:rawEquipment=[], department="CSE", user }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSharing, setFilterSharing] = useState("ALL");
  const [sharingDrawer, setSharingDrawer] = useState(null);
  const [detailsDrawer, setDetailsDrawer] = useState(null);
  const [equipmentList, setEquipmentList] = useState(rawEquipment);
  const [agreementsMap, setAgreementsMap] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingAgreements, setLoadingAgreements] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(()=>{ setEquipmentList(rawEquipment); }, [rawEquipment]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingAgreements(true);
      try {
        const [ag, inc] = await Promise.allSettled([sharingApi.getAllAgreements(), sharingApi.getIncomingRequests()]);
        if (!active) return;
        const map = {};
        if (ag.status==="fulfilled" && Array.isArray(ag.value)) {
          ag.value.forEach(a => {
            const eid = String(a.equipmentId||a.equipment_id||"");
            if (eid) { if (!map[eid]) map[eid]=[]; map[eid].push(a); }
          });
        }
        setAgreementsMap(map);
        if (inc.status==="fulfilled" && Array.isArray(inc.value))
          setPendingCount(inc.value.filter(r=>["PENDING","MOU_PROPOSED"].includes((r.status||"").toUpperCase())).length);
      } catch {} finally { if (active) setLoadingAgreements(false); }
    };
    load();
    return ()=>{ active=false; };
  }, [refreshKey]);

  const enriched = useMemo(() => equipmentList.map(e => ({
    ...e,
    _avail: computeExternalAvailability(agreementsMap[String(e.id)]||[]),
    _agreements: agreementsMap[String(e.id)]||[],
  })), [equipmentList, agreementsMap]);

  const sharingEnabled = enriched.filter(e=>e.isShareable).length;
  const externalActive = enriched.filter(e=>e._avail.state==="ACTIVE").length;
  const locationOptions = useMemo(()=>Array.from(new Set(equipmentList.map(e=>e.location).filter(Boolean))).sort(),[equipmentList]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return enriched.filter(e => {
      if (filterLocation!=="ALL" && e.location!==filterLocation) return false;
      const s=(e.status||"").toUpperCase();
      if (filterStatus==="AVAILABLE" && s!=="AVAILABLE") return false;
      if (filterStatus==="BOOKED" && !["BOOKED","IN_USE"].includes(s)) return false;
      if (filterStatus==="MAINTENANCE" && !["UNDER_MAINTENANCE","MAINTENANCE"].includes(s)) return false;
      if (filterStatus==="OOS" && !["OUT_OF_SERVICE","UNAVAILABLE"].includes(s)) return false;
      if (filterSharing==="ENABLED" && !e.isShareable) return false;
      if (filterSharing==="DISABLED" && e.isShareable) return false;
      if (filterSharing==="ACTIVE" && e._avail.state!=="ACTIVE") return false;
      if (q) return (e.name||"").toLowerCase().includes(q)||(e.category||"").toLowerCase().includes(q)||(e.location||"").toLowerCase().includes(q)||String(e.id).includes(q);
      return true;
    });
  }, [enriched, filterLocation, filterStatus, filterSharing, searchQuery]);

  const handleSaved = useCallback(updated => {
    setEquipmentList(prev => prev.map(e => String(e.id)===String(updated.id)?{...e,...updated}:e));
    setRefreshKey(k=>k+1);
  }, []);

  const dept = user?.departmentName||user?.department||department;
  const inst = user?.institutionName||user?.institution||"";

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={18} className="text-purple-700 shrink-0"/>
            <h1 className="text-xl font-extrabold text-slate-900">Department Equipment Control Center</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">{dept}{inst ? ` · ${inst}`:""} — Inter-Institution Sharing Governance &amp; Equipment Oversight</p>
        </div>
        <button onClick={()=>setRefreshKey(k=>k+1)} className="shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
          <RefreshCw size={13} className={loadingAgreements?"animate-spin text-purple-600":""}/> Refresh
        </button>
      </div>

      <KpiStrip equipment={equipmentList} sharingEnabled={sharingEnabled} externalActive={externalActive} pendingCount={pendingCount}/>

      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="relative sm:col-span-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search name, category, ID…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
        </div>
        <div className="relative">
          <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <select value={filterLocation} onChange={e=>setFilterLocation(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none">
            <option value="ALL">All Locations</option>
            {locationOptions.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="relative">
          <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <select value={filterSharing} onChange={e=>setFilterSharing(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none">
            <option value="ALL">All Sharing States</option>
            <option value="ENABLED">🟢 Sharing Enabled</option>
            <option value="DISABLED">⚪ Sharing Disabled</option>
            <option value="ACTIVE">⚡ Externally Active</option>
          </select>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 font-semibold mb-3">Showing <strong className="text-slate-700">{filtered.length}</strong> of <strong className="text-slate-700">{equipmentList.length}</strong> equipment</p>

      {filtered.length===0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <Package size={40} className="mx-auto text-slate-200 mb-3"/>
          <p className="font-bold text-slate-400">No equipment matches your filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto shadow-sm">
          <table className="w-full text-xs min-w-[860px]">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="text-left font-extrabold px-5 py-3">Equipment</th>
                <th className="text-left font-extrabold px-4 py-3">Category</th>
                <th className="text-left font-extrabold px-4 py-3">Location</th>
                <th className="text-left font-extrabold px-4 py-3">Status</th>
                <th className="text-left font-extrabold px-4 py-3">Sharing</th>
                <th className="text-right font-extrabold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <EqImage src={e.imageSecureUrl||e.image} name={e.name} size={44}/>
                      <div>
                        <p className="font-extrabold text-slate-900">{e.name}</p>
                        <p className="text-slate-400 font-mono text-[10px]">#{e.id}</p>
                        {e._avail.state==="ACTIVE" && <span className="inline-flex items-center gap-1 mt-0.5 rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/> EXT ACTIVE</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-semibold">{e.category}</td>
                  <td className="px-4 py-3.5"><span className="inline-flex items-center gap-1 text-slate-700 font-semibold"><MapPin size={11} className="text-purple-500 shrink-0"/>{e.location||"—"}</span></td>
                  <td className="px-4 py-3.5"><StatusBadge status={e.status}/></td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <SharingPermissionBadge isShareable={e.isShareable}/>
                      <ExternalAvailBadge avail={e._avail}/>
                      {e.externalHourlyRate && <span className="text-[10px] text-slate-500 font-medium">₹{e.externalHourlyRate}/hr</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={()=>setSharingDrawer(e)} className="rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-extrabold px-3 py-1.5 inline-flex items-center gap-1">
                        <Globe size={11}/> Manage Sharing
                      </button>
                      <button onClick={()=>setDetailsDrawer(e)} className="rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 inline-flex items-center gap-1">
                        <Eye size={11}/> Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sharingDrawer && <SharingDrawer equipment={sharingDrawer} agreements={sharingDrawer._agreements||[]} onClose={()=>setSharingDrawer(null)} onSaved={handleSaved}/>}
      {detailsDrawer && <DetailsDrawer equipment={detailsDrawer} agreements={detailsDrawer._agreements||[]} onClose={()=>setDetailsDrawer(null)} onManageSharing={e=>setSharingDrawer(e)}/>}
    </div>
  );
}