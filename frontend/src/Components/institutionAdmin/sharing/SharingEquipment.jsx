import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Send,
  Handshake,
  ShieldCheck,
  Search,
  Filter,
  ArrowLeft,
  X,
  RefreshCw,
  Eye,
  CheckCircle2,
  Tag,
  MapPin,
  Cpu,
  Users,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Wallet
} from "lucide-react";
import { sharingApi } from "../../../api/sharingApi.js";
import { apiFetch } from "../../../api/client.js";

// Helper to parse technical specifications cleanly
function parseSpecifications(specs) {
  if (!specs) return [];
  if (typeof specs === "object") {
    if (Array.isArray(specs)) return specs.map((item) => String(item));
    return Object.entries(specs).map(([k, v]) => `${k}: ${v}`);
  }
  if (typeof specs === "string") {
    try {
      const parsed = JSON.parse(specs);
      if (typeof parsed === "object" && parsed !== null) {
        if (Array.isArray(parsed)) return parsed.map((item) => String(item));
        return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`);
      }
    } catch {
      return specs.split("\n").filter((line) => line.trim().length > 0);
    }
  }
  return [String(specs)];
}

export default function SharingEquipment({ user, toast }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Overview State
  const [overview, setOverview] = useState(null);

  // General Data States
  const [institutions, setInstitutions] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [agreements, setAgreements] = useState([]);

  // Explore Partner Institution Catalog States (Strictly Partner-Scoped)
  const [selectedInst, setSelectedInst] = useState(null);
  const [partnerEquipment, setPartnerEquipment] = useState([]);
  const [partnerDepartments, setPartnerDepartments] = useState([]);
  const [partnerLaboratories, setPartnerLaboratories] = useState([]);
  const [partnerCategories, setPartnerCategories] = useState([]);
  const [partnerLocations, setPartnerLocations] = useState([]);
  const [partnerLoading, setPartnerLoading] = useState(false);

  // Filter States for Partner Catalog
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerDeptFilter, setPartnerDeptFilter] = useState("");
  const [partnerLabFilter, setPartnerLabFilter] = useState("");
  const [partnerCatFilter, setPartnerCatFilter] = useState("ALL");
  const [partnerLocFilter, setPartnerLocFilter] = useState("ALL");
  const [partnerSharingFilter, setPartnerSharingFilter] = useState("ALL");

  // Modals & Drawers
  const [detailsEq, setDetailsEq] = useState(null);
  const [requestEqModal, setRequestEqModal] = useState(null);
  const [proposeMouModalReq, setProposeMouModalReq] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);

  // Form states for Request Creation
  const [reqStartDate, setReqStartDate] = useState("");
  const [reqEndDate, setReqEndDate] = useState("");
  const [reqPurpose, setReqPurpose] = useState("");

  // Form states for Propose MOU
  const [mouStartDate, setMouStartDate] = useState("");
  const [mouEndDate, setMouEndDate] = useState("");
  const [mouHourlyRate, setMouHourlyRate] = useState("");
  const [mouTermsText, setMouTermsText] = useState("");

  // Form state for Rejection
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch primary dashboard datasets
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, instRes, outRes, inRes, agrRes] = await Promise.allSettled([
        sharingApi.getInstitutionSharingOverview(),
        apiFetch("/institutions/active"),
        sharingApi.getOutgoingRequests(),
        sharingApi.getIncomingRequests(),
        sharingApi.getAllAgreements(),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value) {
        setOverview(overviewRes.value);
      }

      if (instRes.status === "fulfilled" && Array.isArray(instRes.value)) {
        const userInstId = user?.institutionId;
        const filtered = instRes.value.filter((inst) => {
          const instId = inst.institutionId ?? inst.id;
          return userInstId == null || String(instId) !== String(userInstId);
        });
        setInstitutions(filtered);
      }

      if (outRes.status === "fulfilled" && Array.isArray(outRes.value)) {
        setOutgoingRequests(outRes.value);
      }
      if (inRes.status === "fulfilled" && Array.isArray(inRes.value)) {
        setIncomingRequests(inRes.value);
      }
      if (agrRes.status === "fulfilled" && Array.isArray(agrRes.value)) {
        setAgreements(agrRes.value);
      }
    } catch (err) {
      console.error("Error loading sharing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Handle Partner Institution Selection (Clears all previous partner state)
  const handleSelectInstitution = async (inst) => {
    setSelectedInst(inst);
    const targetInstId = inst.institutionId || inst.id;

    // Clear previous partner state
    setPartnerEquipment([]);
    setPartnerDepartments([]);
    setPartnerLaboratories([]);
    setPartnerCategories([]);
    setPartnerLocations([]);
    setPartnerSearch("");
    setPartnerDeptFilter("");
    setPartnerLabFilter("");
    setPartnerCatFilter("ALL");
    setPartnerLocFilter("ALL");
    setPartnerSharingFilter("ALL");

    setPartnerLoading(true);
    try {
      const [deptRes, eqRes, catRes, locRes] = await Promise.allSettled([
        sharingApi.getPartnerDepartments(targetInstId),
        sharingApi.getPartnerEquipment(targetInstId, {}),
        sharingApi.getPartnerCategories(targetInstId),
        sharingApi.getPartnerLocations(targetInstId),
      ]);

      if (deptRes.status === "fulfilled" && Array.isArray(deptRes.value)) {
        setPartnerDepartments(deptRes.value);
      }
      if (eqRes.status === "fulfilled" && Array.isArray(eqRes.value)) {
        // Defensive validation: strictly require non-null institution ID matching targetInstId
        const verified = eqRes.value.filter((eq) => {
          const eqInstId = eq.institutionId ?? eq.institution?.id;
          return eqInstId != null && String(eqInstId) === String(targetInstId);
        });
        setPartnerEquipment(verified);
      }
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) {
        setPartnerCategories(catRes.value);
      }
      if (locRes.status === "fulfilled" && Array.isArray(locRes.value)) {
        setPartnerLocations(locRes.value);
      }
    } catch (err) {
      console.error("Failed to load partner catalog:", err);
      toast?.("Could not load catalog for " + inst.name, "error");
    } finally {
      setPartnerLoading(false);
    }
  };

  // Re-fetch partner equipment when filters change
  const handleFetchPartnerEquipment = async (deptId, labId, cat, loc, search) => {
    if (!selectedInst) return;
    const targetInstId = selectedInst.institutionId || selectedInst.id;
    setPartnerLoading(true);
    try {
      const params = {};
      if (deptId) params.departmentId = deptId;
      if (labId) params.labId = labId;
      if (cat && cat !== "ALL") params.category = cat;
      if (loc && loc !== "ALL") params.location = loc;
      if (search && search.trim()) params.search = search.trim();

      const eqList = await sharingApi.getPartnerEquipment(targetInstId, params);
      const verified = (Array.isArray(eqList) ? eqList : []).filter((eq) => {
        const eqInstId = eq.institutionId ?? eq.institution?.id;
        return eqInstId != null && String(eqInstId) === String(targetInstId);
      });
      setPartnerEquipment(verified);
    } catch (err) {
      console.error("Error filtering partner equipment:", err);
      setPartnerEquipment([]);
    } finally {
      setPartnerLoading(false);
    }
  };

  // Handle Department Filter Change
  const handleDepartmentChange = async (newDeptId) => {
    const targetInstId = selectedInst?.institutionId || selectedInst?.id;
    setPartnerDeptFilter(newDeptId);
    setPartnerLabFilter("");
    setPartnerLocFilter("ALL");
    setPartnerLaboratories([]);
    setPartnerLocations([]);

    if (targetInstId && newDeptId) {
      try {
        const [labs, locs, cats] = await Promise.all([
          sharingApi.getPartnerLaboratories(targetInstId, newDeptId),
          sharingApi.getPartnerLocations(targetInstId, newDeptId, ""),
          sharingApi.getPartnerCategories(targetInstId, newDeptId),
        ]);
        setPartnerLaboratories(Array.isArray(labs) ? labs : []);
        setPartnerLocations(Array.isArray(locs) ? locs : []);
        if (Array.isArray(cats)) setPartnerCategories(cats);
      } catch (err) {
        console.error("Failed to fetch partner labs/locations:", err);
      }
    } else if (targetInstId) {
      try {
        const [locs, cats] = await Promise.all([
          sharingApi.getPartnerLocations(targetInstId),
          sharingApi.getPartnerCategories(targetInstId),
        ]);
        setPartnerLocations(Array.isArray(locs) ? locs : []);
        if (Array.isArray(cats)) setPartnerCategories(cats);
      } catch (err) {}
    }

    handleFetchPartnerEquipment(newDeptId, "", partnerCatFilter, "ALL", partnerSearch);
  };

  // Handle Laboratory Filter Change
  const handleLabChange = async (newLabId) => {
    const targetInstId = selectedInst?.institutionId || selectedInst?.id;
    setPartnerLabFilter(newLabId);
    setPartnerLocFilter("ALL");

    if (targetInstId && partnerDeptFilter && newLabId) {
      try {
        const locs = await sharingApi.getPartnerLocations(targetInstId, partnerDeptFilter, newLabId);
        setPartnerLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {
        console.error("Failed to fetch partner locations for lab:", err);
      }
    } else if (targetInstId && partnerDeptFilter) {
      try {
        const locs = await sharingApi.getPartnerLocations(targetInstId, partnerDeptFilter, "");
        setPartnerLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {}
    }

    handleFetchPartnerEquipment(partnerDeptFilter, newLabId, partnerCatFilter, "ALL", partnerSearch);
  };

  const handleCategoryChange = (newCat) => {
    setPartnerCatFilter(newCat);
    handleFetchPartnerEquipment(partnerDeptFilter, partnerLabFilter, newCat, partnerLocFilter, partnerSearch);
  };

  const handleLocationChange = (newLoc) => {
    setPartnerLocFilter(newLoc);
    handleFetchPartnerEquipment(partnerDeptFilter, partnerLabFilter, partnerCatFilter, newLoc, partnerSearch);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFetchPartnerEquipment(partnerDeptFilter, partnerLabFilter, partnerCatFilter, partnerLocFilter, partnerSearch);
  };

  // Handlers for Request Creation
  const handleOpenRequestModal = (eq) => {
    setRequestEqModal(eq);
    const today = new Date().toISOString().slice(0, 10);
    setReqStartDate(today);
    setReqEndDate(today);
    setReqPurpose("");
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!reqStartDate || !reqEndDate || !reqPurpose.trim()) {
      toast?.("Please fill in start date, end date, and purpose.", "error");
      return;
    }
    try {
      await sharingApi.createRequest(requestEqModal.id || requestEqModal.equipmentId, reqStartDate, reqEndDate, reqPurpose);
      toast?.("Sharing request submitted successfully!", "success");
      setRequestEqModal(null);
      fetchAllData();
      setActiveTab("outgoing");
    } catch (err) {
      toast?.(err.message || "Failed to submit sharing request", "error");
    }
  };

  // Handlers for Propose MOU
  const handleOpenProposeMouModal = (req) => {
    setProposeMouModalReq(req);
    setMouStartDate(req.requestedStartDate || new Date().toISOString().slice(0, 10));
    setMouEndDate(req.requestedEndDate || new Date().toISOString().slice(0, 10));
    setMouHourlyRate(req.externalHourlyRate || req.proposedHourlyRate || "");
    setMouTermsText(req.mouTerms || "Standard inter-institution laboratory usage agreement.");
  };

  const handleSubmitProposeMou = async (e) => {
    e.preventDefault();
    if (!mouTermsText.trim()) {
      toast?.("Please specify MOU terms.", "error");
      return;
    }
    try {
      const rateNum = Number(mouHourlyRate) || 0;
      await sharingApi.proposeMou(proposeMouModalReq.requestId || proposeMouModalReq.id, {
        proposedHourlyRate: rateNum,
        mouTerms: mouTermsText,
        availableStartDate: mouStartDate || null,
        availableEndDate: mouEndDate || null,
      });
      toast?.("MOU terms proposed successfully!", "success");
      setProposeMouModalReq(null);
      fetchAllData();
    } catch (err) {
      toast?.(err.message || "Failed to propose MOU", "error");
    }
  };

  // Handler for Accept MOU
  const handleAcceptMou = async (reqId) => {
    try {
      await sharingApi.acceptMou(reqId);
      toast?.("MOU accepted! Sharing agreement activated.", "success");
      fetchAllData();
    } catch (err) {
      toast?.(err.message || "Failed to accept MOU", "error");
    }
  };

  // Handler for Reject Request
  const handleOpenRejectModal = (req) => {
    setRejectModalReq(req);
    setRejectionReason("");
  };

  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast?.("Rejection reason is required.", "error");
      return;
    }
    try {
      await sharingApi.rejectRequest(rejectModalReq.requestId || rejectModalReq.id, rejectionReason);
      toast?.("Sharing request rejected.", "info");
      setRejectModalReq(null);
      fetchAllData();
    } catch (err) {
      toast?.(err.message || "Failed to reject request", "error");
    }
  };

  const userInstName = user?.institutionName || user?.institution || "Your Institution";

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Cross-Institution Sharing</h1>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                Institution Admin
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage equipment sharing, requests and agreements across your institution
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 w-fit">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{userInstName}</span>
            </div>
          </div>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* 2. MAIN TABS NAVIGATION */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-2 shadow-xs flex flex-wrap gap-1">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "explore", label: `Explore Institutions (${institutions.length})`, icon: Building2 },
          { id: "outgoing", label: `My Requests (${outgoingRequests.length})`, icon: Send },
          { id: "incoming", label: `Incoming Requests (${incomingRequests.length})`, icon: Handshake },
          { id: "agreements", label: `Active Agreements (${agreements.filter(a => a.status === "ACTIVE").length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "explore") setSelectedInst(null);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: OVERVIEW TAB                                                      */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Partner Institutions</span>
              <p className="text-2xl font-black text-slate-900">{overview?.partnerInstitutionCount ?? institutions.length}</p>
              <span className="text-[11px] text-slate-400 font-medium">Active partners</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Equipment</span>
              <p className="text-2xl font-black text-slate-900">{overview?.totalEquipmentCount ?? "—"}</p>
              <span className="text-[11px] text-slate-400 font-medium">Our institution inventory</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Sharing Enabled</span>
              <p className="text-2xl font-black text-emerald-600">{overview?.shareableEquipmentCount ?? "—"}</p>
              <span className="text-[11px] text-slate-400 font-medium">Eligible for request</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Sharing Disabled</span>
              <p className="text-2xl font-black text-slate-500">{overview?.nonShareableEquipmentCount ?? "—"}</p>
              <span className="text-[11px] text-slate-400 font-medium">Internal access only</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Currently Shared</span>
              <p className="text-2xl font-black text-blue-600">{overview?.currentlySharedEquipmentCount ?? "—"}</p>
              <span className="text-[11px] text-slate-400 font-medium">Active MOUs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Active MOUs</span>
              <p className="text-xl font-bold text-slate-900">{overview?.totalActiveMoUs ?? agreements.filter(a => a.status === "ACTIVE").length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Pending MOUs</span>
              <p className="text-xl font-bold text-amber-600">{overview?.totalPendingMoUs ?? (incomingRequests.filter(r => r.status === "PENDING").length + outgoingRequests.filter(r => r.status === "PENDING").length)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Revenue Earned</span>
              <p className="text-xl font-bold text-emerald-600">₹{overview?.totalRevenueEarned != null ? Number(overview.totalRevenueEarned).toLocaleString() : "0"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Expense Paid</span>
              <p className="text-xl font-bold text-indigo-600">₹{overview?.totalExpensePaid != null ? Number(overview.totalExpensePaid).toLocaleString() : "0"}</p>
            </div>
          </div>

          {/* Quick Summary Tables */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Incoming Sharing Requests ({incomingRequests.length})</h3>
                <button onClick={() => setActiveTab("incoming")} className="text-xs font-bold text-blue-600 hover:text-blue-800">View All →</button>
              </div>
              {incomingRequests.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 italic text-center">No incoming sharing requests.</p>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.slice(0, 4).map((r) => (
                    <div key={r.requestId || r.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{r.equipmentName || "Equipment"} — <span className="text-blue-600">{r.requestingInstitutionName || "Partner"}</span></p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{r.requestedStartDate} to {r.requestedEndDate}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Outgoing Sharing Requests ({outgoingRequests.length})</h3>
                <button onClick={() => setActiveTab("outgoing")} className="text-xs font-bold text-blue-600 hover:text-blue-800">View All →</button>
              </div>
              {outgoingRequests.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 italic text-center">No outgoing sharing requests.</p>
              ) : (
                <div className="space-y-3">
                  {outgoingRequests.slice(0, 4).map((r) => (
                    <div key={r.requestId || r.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{r.equipmentName || "Equipment"} — <span className="text-indigo-600">{r.owningInstitutionName || "Owner"}</span></p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{r.requestedStartDate} to {r.requestedEndDate}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EXPLORE INSTITUTIONS                                               */}
      {/* ========================================================================= */}
      {activeTab === "explore" && (
        <div className="space-y-6">
          {!selectedInst ? (
            /* PARTNER INSTITUTION DIRECTORY GRID */
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Partner Institutions Directory</h2>
                  <p className="text-xs text-slate-500">Approved active partner institutions available for cross-institution sharing</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {institutions.length} Partners Available
                </span>
              </div>

              {institutions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-3 text-sm font-bold text-slate-900">No Partner Institutions Found</h3>
                  <p className="mt-1 text-xs text-slate-500">No other active approved partner institutions registered in the network.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {institutions.map((inst) => (
                    <div
                      key={(inst.institutionId || inst.id)}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                            Approved Partner
                          </span>
                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {inst.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {inst.city || inst.address || inst.code || "Main Campus"}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">
                          ID: #{inst.institutionId || inst.id}
                        </span>
                        <button
                          onClick={() => handleSelectInstitution(inst)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                        >
                          Explore Equipment
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* SELECTED PARTNER CATALOG WITH CASCADING FILTERS */
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedInst(null)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition mb-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Directory
                    </button>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-slate-900">{selectedInst.name}</h2>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        Approved Partner Institution
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Browse equipment catalog published for inter-institution discovery
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedInst(null)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Explore Another Institution
                  </button>
                </div>

                {/* Catalog Search & Filters */}
                <form onSubmit={handleSearchSubmit} className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search equipment by name, category, manufacturer..."
                        value={partnerSearch}
                        onChange={(e) => setPartnerSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Search
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {/* Department Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                      <select
                        value={partnerDeptFilter}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">All Departments ({partnerDepartments.length})</option>
                        {partnerDepartments.map((d) => (
                          <option key={d.id || d.departmentId} value={d.id || d.departmentId}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Laboratory Dropdown (Cascading) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Laboratory</label>
                      <select
                        value={partnerLabFilter}
                        onChange={(e) => handleLabChange(e.target.value)}
                        disabled={!partnerDeptFilter || partnerLaboratories.length === 0}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {!partnerDeptFilter ? (
                          <option value="">Select department first</option>
                        ) : partnerLaboratories.length === 0 ? (
                          <option value="">No laboratories available</option>
                        ) : (
                          <>
                            <option value="">All Laboratories ({partnerLaboratories.length})</option>
                            {partnerLaboratories.map((l) => (
                              <option key={l.id || l.labId} value={l.id || l.labId}>
                                {l.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={partnerCatFilter}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="ALL">All Categories</option>
                        {partnerCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location Dropdown (Cascading) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                      <select
                        value={partnerLocFilter}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        disabled={!partnerDeptFilter || partnerLocations.length === 0}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {!partnerDeptFilter ? (
                          <option value="ALL">Select department first</option>
                        ) : partnerLocations.length === 0 ? (
                          <option value="ALL">No locations available</option>
                        ) : (
                          <>
                            <option value="ALL">All Locations ({partnerLocations.length})</option>
                            {partnerLocations.map((loc) => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Sharing Filter Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sharing</label>
                      <select
                        value={partnerSharingFilter}
                        onChange={(e) => setPartnerSharingFilter(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="ALL">All Equipment ({partnerEquipment.length})</option>
                        <option value="ENABLED">Sharing Enabled ({partnerEquipment.filter(e => e.isShareable === true).length})</option>
                        <option value="DISABLED">Sharing Disabled ({partnerEquipment.filter(e => e.isShareable !== true).length})</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              {/* Equipment Grid / Zero-Data Display */}
              {(() => {
                const displayEquipment = partnerSharingFilter === "ALL"
                  ? partnerEquipment
                  : partnerSharingFilter === "ENABLED"
                  ? partnerEquipment.filter((e) => e.isShareable === true)
                  : partnerEquipment.filter((e) => e.isShareable !== true);

                if (partnerLoading) {
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                      <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
                      <p className="mt-3 text-xs text-slate-500 font-semibold">Loading {selectedInst.name} equipment catalog...</p>
                    </div>
                  );
                }

                // CASE A: Partner has zero equipment at all
                if (partnerEquipment.length === 0) {
                  return (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs space-y-4">
                      <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Cpu className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">No Equipment Found</h3>
                        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                          This institution currently has no active equipment available in the catalog.
                        </p>
                      </div>
                      <div className="pt-2 flex justify-center gap-3">
                        <button
                          onClick={() => setSelectedInst(null)}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Explore Another Institution
                        </button>
                      </div>
                    </div>
                  );
                }

                // CASE B/C: Sharing filter returns zero
                if (displayEquipment.length === 0 && partnerSharingFilter !== "ALL") {
                  return (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs space-y-4">
                      <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Cpu className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {partnerSharingFilter === "ENABLED"
                            ? "No Equipment Available for Sharing"
                            : "No Equipment with Sharing Disabled"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                          <span className="font-semibold">{selectedInst.name}</span> currently has no equipment in this sharing state.
                        </p>
                      </div>
                      <div className="pt-2 flex justify-center gap-3">
                        <button
                          onClick={() => setPartnerSharingFilter("ALL")}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                        >
                          View All Equipment
                        </button>
                      </div>
                    </div>
                  );
                }

                // CASE D: Search/filter combination returns zero
                if (displayEquipment.length === 0) {
                  return (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs space-y-4">
                      <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">No Matching Equipment</h3>
                        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                          Try changing the selected filters or search terms.
                        </p>
                      </div>
                    </div>
                  );
                }

                // Normal equipment grid
                return (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Showing {displayEquipment.length} of {partnerEquipment.length} equipment
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayEquipment.map((eq) => {
                        const isShareable = eq.isShareable === true;
                        const canRequest = isShareable && (eq.status || "AVAILABLE") !== "OUT_OF_SERVICE";

                        return (
                          <div
                            key={eq.id || eq.equipmentId}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="h-44 w-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center relative">
                                {eq.imageSecureUrl || eq.image ? (
                                  <img
                                    src={eq.imageSecureUrl || eq.image}
                                    alt={eq.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Cpu className="h-16 w-16 text-slate-300" />
                                )}
                                <div className="absolute top-2 right-2">
                                  {isShareable ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                                      SHARING ENABLED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                                      SHARING DISABLED
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                                    {eq.category || "General"}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">ID: #{eq.id || eq.equipmentId}</span>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{eq.name}</h3>

                                <div className="text-xs text-slate-500 space-y-1 pt-1">
                                  <p className="flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-medium text-slate-700">Dept:</span> {eq.departmentName || "Department"}
                                  </p>
                                  {eq.labName && (
                                    <p className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="font-medium text-slate-700">Lab:</span> {eq.labName}
                                    </p>
                                  )}
                                  {eq.location && (
                                    <p className="flex items-center gap-1">
                                      <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="font-medium text-slate-700">Loc:</span> {eq.location}
                                    </p>
                                  )}
                                  {eq.condition && (
                                    <p className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="font-medium text-slate-700">Condition:</span> {eq.condition}
                                    </p>
                                  )}
                                  {eq.capacityPerSlot != null && (
                                    <p className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="font-medium text-slate-700">Capacity:</span> {eq.capacityPerSlot} per slot
                                    </p>
                                  )}
                                </div>

                                <div className={`mt-3 rounded-xl p-2.5 border ${
                                  isShareable ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
                                }`}>
                                  <p className={`text-xs font-bold ${isShareable ? "text-emerald-700" : "text-slate-500"}`}>
                                    {isShareable ? "🟢 SHARING ENABLED" : "⚪ SHARING DISABLED"}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {isShareable
                                      ? "Available for external sharing requests"
                                      : "Not currently available for external sharing requests"}
                                  </p>
                                </div>

                                {eq.externalHourlyRate != null && (
                                  <div className="mt-2 flex items-center justify-between bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                    <span className="text-xs text-slate-500 font-medium">External Rate</span>
                                    <span className="text-sm font-black text-slate-900">₹{eq.externalHourlyRate}/hr</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                              <button
                                onClick={() => setDetailsEq(eq)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Details
                              </button>

                              <button
                                onClick={() => canRequest && handleOpenRequestModal(eq)}
                                disabled={!canRequest}
                                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition shadow-xs ${
                                  canRequest
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                {canRequest ? "Request Sharing" : "Sharing Disabled"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY OUTGOING REQUESTS                                              */}
      {/* ========================================================================= */}
      {activeTab === "outgoing" && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-900">My Sharing Requests</h2>
            <p className="text-xs text-slate-500">Inter-institution equipment access applications submitted by your institution</p>
          </div>

          {outgoingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Send className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Requests Found</h3>
              <p className="mt-1 text-xs text-slate-500">Your institution has not submitted any sharing requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {outgoingRequests.map((req) => (
                <div key={req.requestId || req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">REQ #{req.requestId || req.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                        req.status === "APPROVED" || req.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" :
                        req.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>{req.status}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{req.equipmentName || "Equipment"}</h3>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Owner Institution:</span> {req.owningInstitutionName || "Partner"} · {req.owningDepartmentName || "Dept"}
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Requested Window:</span> {req.requestedStartDate} to {req.requestedEndDate}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 italic">"{req.purpose || "No purpose stated"}"</p>

                    {req.proposedHourlyRate != null && (
                      <p className="text-xs font-semibold text-blue-700 mt-1">
                        Proposed Rate: ₹{req.proposedHourlyRate}/hr
                      </p>
                    )}

                    {req.mouTerms && (
                      <div className="mt-2 text-xs bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-700">
                        <span className="font-bold block text-slate-900">MOU Terms:</span>
                        {req.mouTerms}
                      </div>
                    )}

                    {req.rejectionReason && (
                      <p className="text-xs font-bold text-red-600 mt-1">
                        Rejection Reason: {req.rejectionReason}
                      </p>
                    )}
                  </div>

                  {req.status === "MOU_PROPOSED" && (
                    <button
                      onClick={() => handleAcceptMou(req.requestId || req.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept MOU & Activate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INCOMING REQUESTS                                                 */}
      {/* ========================================================================= */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-900">Incoming Sharing Requests</h2>
            <p className="text-xs text-slate-500">Requests from external partner institutions for equipment owned by your institution</p>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Handshake className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Incoming Requests</h3>
              <p className="mt-1 text-xs text-slate-500">No partner institutions have submitted sharing requests for your equipment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.map((req) => (
                <div key={req.requestId || req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400">REQ #{req.requestId || req.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                        req.status === "APPROVED" || req.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" :
                        req.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>{req.status}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{req.equipmentName || "Equipment"}</h3>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Requesting Partner:</span> {req.requestingInstitutionName || "Partner"} · {req.requestingDepartmentName || "Dept"}
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Requested Schedule:</span> {req.requestedStartDate} to {req.requestedEndDate}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 italic">"{req.purpose || "No purpose stated"}"</p>

                    {req.proposedHourlyRate != null && (
                      <p className="text-xs font-semibold text-blue-700 mt-1">
                        Proposed Rate: ₹{req.proposedHourlyRate}/hr
                      </p>
                    )}

                    {req.mouTerms && (
                      <div className="mt-2 text-xs bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-slate-700">
                        <span className="font-bold block text-slate-900">Proposed Terms:</span>
                        {req.mouTerms}
                      </div>
                    )}
                  </div>

                  {req.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenProposeMouModal(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Propose MOU
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACTIVE AGREEMENTS                                                  */}
      {/* ========================================================================= */}
      {activeTab === "agreements" && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-900">Active Sharing Agreements</h2>
            <p className="text-xs text-slate-500">Active MOUs and equipment sharing contracts involving your institution</p>
          </div>

          {agreements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Active Agreements</h3>
              <p className="mt-1 text-xs text-slate-500">Your institution has no active inter-institution sharing agreements at this time.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {agreements.map((agr) => (
                <div key={agr.agreementId || agr.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">AGR #{agr.agreementId || agr.id}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      CURRENTLY SHARED
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{agr.equipmentName || "Equipment"}</h3>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Owner:</span> {agr.owningInstitutionName || "Owner Inst"}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Partner:</span> {agr.requestingInstitutionName || "Requester Inst"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Valid Dates</span>
                      <span className="font-bold text-slate-800">{agr.startDate || "N/A"} to {agr.endDate || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Hourly Rate</span>
                      <span className="font-bold text-slate-800">{agr.hourlyRate != null ? `₹${agr.hourlyRate}/hr` : "Not specified"}</span>
                    </div>
                  </div>

                  {agr.mouTerms && (
                    <p className="text-xs text-slate-500 line-clamp-2 italic">
                      "{agr.mouTerms}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILS DRAWER / MODAL                                                    */}
      {/* ========================================================================= */}
      {detailsEq && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Equipment Details</h2>
              <button onClick={() => setDetailsEq(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="h-48 w-full rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                {detailsEq.imageSecureUrl || detailsEq.image ? (
                  <img src={detailsEq.imageSecureUrl || detailsEq.image} alt={detailsEq.name} className="h-full w-full object-cover" />
                ) : (
                  <Cpu className="w-16 h-16 text-slate-300" />
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">{detailsEq.category || "General"}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{detailsEq.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{detailsEq.description || "No description provided."}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">Equipment ID: {detailsEq.equipmentId || detailsEq.id}</p>
              </div>

              <div className={`rounded-xl p-3 border ${
                detailsEq.isShareable ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
              }`}>
                <p className={`text-sm font-bold ${detailsEq.isShareable ? "text-emerald-700" : "text-slate-500"}`}>
                  {detailsEq.isShareable ? "🟢 SHARING ENABLED" : "⚪ SHARING DISABLED"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {detailsEq.isShareable ? "Available for external sharing requests" : "Not currently available for external sharing requests"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Manufacturer</span>
                  <p className="font-bold text-slate-800">{detailsEq.manufacturer || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Model</span>
                  <p className="font-bold text-slate-800">{detailsEq.model || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Institution</span>
                  <p className="font-bold text-slate-800">{detailsEq.institutionName || selectedInst?.name || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-bold text-slate-800">{detailsEq.departmentName || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Laboratory</span>
                  <p className="font-bold text-slate-800">{detailsEq.labName || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location</span>
                  <p className="font-bold text-slate-800">{detailsEq.location || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Condition</span>
                  <p className="font-bold text-slate-800">{detailsEq.condition || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Capacity per Slot</span>
                  <p className="font-bold text-slate-800">{detailsEq.capacityPerSlot != null ? detailsEq.capacityPerSlot : "Not provided"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Internal Rate</span>
                  <p className="font-bold text-slate-800">{detailsEq.internalHourlyRate != null ? `₹${detailsEq.internalHourlyRate}/hr` : "Not specified"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">External Rate</span>
                  <p className="font-bold text-slate-800">{detailsEq.externalHourlyRate != null ? `₹${detailsEq.externalHourlyRate}/hr` : "Not specified"}</p>
                </div>
              </div>

              {(detailsEq.calibrationStatus || detailsEq.lastCalibratedDate || detailsEq.nextCalibrationDate) && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Calibration Information</h4>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 text-xs">
                    {detailsEq.calibrationStatus && <p><span className="font-semibold">Status:</span> {detailsEq.calibrationStatus}</p>}
                    {detailsEq.lastCalibratedDate && <p><span className="font-semibold">Last Calibrated:</span> {detailsEq.lastCalibratedDate}</p>}
                    {detailsEq.nextCalibrationDate && <p><span className="font-semibold">Next Calibration:</span> {detailsEq.nextCalibrationDate}</p>}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Technical Specifications</h4>
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 text-xs">
                  {parseSpecifications(detailsEq.specifications || detailsEq.specs).length > 0 ? (
                    parseSpecifications(detailsEq.specifications || detailsEq.specs).map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        <span>{spec}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No detailed technical specifications recorded.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  const eq = detailsEq;
                  setDetailsEq(null);
                  handleOpenRequestModal(eq);
                }}
                disabled={!detailsEq.isShareable}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
              >
                <Send className="w-4 h-4" />
                {detailsEq.isShareable ? "Request Sharing" : "Sharing Disabled"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REQUEST SHARING MODAL                                                    */}
      {/* ========================================================================= */}
      {requestEqModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Equipment Access</h3>
                <p className="text-xs text-slate-500">{requestEqModal.name}</p>
              </div>
              <button onClick={() => setRequestEqModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 space-y-4">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 space-y-1">
                <p><span className="font-semibold">Institution:</span> {selectedInst?.name || "Partner Institution"}</p>
                <p><span className="font-semibold">External Rate:</span> {requestEqModal.externalHourlyRate != null ? `₹${requestEqModal.externalHourlyRate}/hr` : "Not specified"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={reqStartDate}
                    onChange={(e) => setReqStartDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={reqEndDate}
                    onChange={(e) => setReqEndDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose of Sharing Request</label>
                <textarea
                  value={reqPurpose}
                  onChange={(e) => setReqPurpose(e.target.value)}
                  placeholder="Describe your research objectives, laboratory usage requirement, and expected utilization..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestEqModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROPOSE MOU MODAL                                                        */}
      {/* ========================================================================= */}
      {proposeMouModalReq && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Propose MOU Terms & Conditions</h3>
                <p className="text-xs text-slate-500">{proposeMouModalReq.equipmentName}</p>
              </div>
              <button onClick={() => setProposeMouModalReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposeMou} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Approved Start Date</label>
                  <input
                    type="date"
                    value={mouStartDate}
                    onChange={(e) => setMouStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Approved End Date</label>
                  <input
                    type="date"
                    value={mouEndDate}
                    onChange={(e) => setMouEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposed External Hourly Rate (₹/hr)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={mouHourlyRate}
                  onChange={(e) => setMouHourlyRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MOU Terms & Operational Rules</label>
                <textarea
                  value={mouTermsText}
                  onChange={(e) => setMouTermsText(e.target.value)}
                  placeholder="Specify usage rules, safety protocols, consumable chargebacks, or slot scheduling terms..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProposeMouModalReq(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Send MOU Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REJECT MODAL                                                             */}
      {/* ========================================================================= */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Sharing Request</h3>
                <p className="text-xs text-slate-500">{rejectModalReq.equipmentName}</p>
              </div>
              <button onClick={() => setRejectModalReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mandatory Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this sharing request cannot be accommodated at this time..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
