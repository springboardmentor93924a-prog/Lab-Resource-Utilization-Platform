import React, { useState, useEffect, useMemo } from "react";
import {
  Share2,
  Building2,
  MapPin,
  Tag,
  Globe,
  Calendar,
  Clock,
  DollarSign,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  History,
  Users,
  Handshake,
  Cpu,
  ShieldCheck,
  Eye,
  Send,
  Check,
  Zap,
  RefreshCw,
  FileText,
  Plus,
  FileCheck,
  Phone,
  Mail,
  Info
} from "lucide-react";
import { sharingApi } from "../../../api/sharingApi.js";
import { apiFetch } from "../../../api/client.js";

// Safe specification renderer
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

export function SharingControlCenter({ user, deptEquipment = [], toast }) {
  const [activeTab, setActiveTab] = useState("explore");
  const [loading, setLoading] = useState(false);

  // Data states
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

  // Tab Filter States
  const [outgoingStatusFilter, setOutgoingStatusFilter] = useState("ALL");
  const [incomingStatusFilter, setIncomingStatusFilter] = useState("ALL");

  // Modals & Drawers
  const [detailsEq, setDetailsEq] = useState(null);
  const [requestEqModal, setRequestEqModal] = useState(null);
  const [lifecycleDrawerReq, setLifecycleDrawerReq] = useState(null);
  const [mouReviewModalReq, setMouReviewModalReq] = useState(null);
  const [proposeMouModalReq, setProposeMouModalReq] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);

  // Form states
  const [reqStartDate, setReqStartDate] = useState("");
  const [reqEndDate, setReqEndDate] = useState("");
  const [reqPurpose, setReqPurpose] = useState("");

  const [mouStartDate, setMouStartDate] = useState("");
  const [mouEndDate, setMouEndDate] = useState("");
  const [mouHourlyRate, setMouHourlyRate] = useState("");
  const [mouTermsText, setMouTermsText] = useState("");

  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch all primary dashboard datasets
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [instRes, outRes, inRes, agrRes] = await Promise.allSettled([
        apiFetch("/institutions/active"),
        sharingApi.getOutgoingRequests(),
        sharingApi.getIncomingRequests(),
        sharingApi.getAllAgreements(),
      ]);

      if (instRes.status === "fulfilled" && Array.isArray(instRes.value)) {
        const userInstId = user?.institutionId;
        const userInstName = (user?.institutionName || user?.institution || "").toLowerCase();
        const filtered = instRes.value.filter((inst) => {
          if (userInstId && (inst.institutionId || inst.id) === userInstId) return false;
          if (userInstName && (inst.name || "").toLowerCase().includes(userInstName)) return false;
          return true;
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
      console.error("Error loading sharing control center data:", err);
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

    // 1. Immediately clear all stale partner equipment/department/filter states
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
      // 2. Fetch real partner departments & equipment concurrently via dedicated read-only discovery endpoints
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

  // Handle Department Filter Change (clears lab & location filters, loads labs & locations for selected dept)
  const handleDepartmentChange = async (newDeptId) => {
    const targetInstId = selectedInst?.institutionId || selectedInst?.id;
    setPartnerDeptFilter(newDeptId);
    setPartnerLabFilter(""); // Clear lab filter
    setPartnerLocFilter("ALL"); // Clear location filter
    setPartnerLaboratories([]);
    setPartnerLocations([]);

    if (targetInstId && newDeptId) {
      try {
        const [labs, locs] = await Promise.all([
          sharingApi.getPartnerLaboratories(targetInstId, newDeptId),
          sharingApi.getPartnerLocations(targetInstId, newDeptId, ""),
        ]);
        setPartnerLaboratories(Array.isArray(labs) ? labs : []);
        setPartnerLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {
        console.error("Failed to fetch partner labs/locations:", err);
      }
    } else if (targetInstId) {
      // Re-fetch default locations for all departments
      try {
        const locs = await sharingApi.getPartnerLocations(targetInstId);
        setPartnerLocations(Array.isArray(locs) ? locs : []);
      } catch (err) {}
    }

    handleFetchPartnerEquipment(newDeptId, "", partnerCatFilter, "ALL", partnerSearch);
  };

  const handleLabChange = async (newLabId) => {
    const targetInstId = selectedInst?.institutionId || selectedInst?.id;
    setPartnerLabFilter(newLabId);
    setPartnerLocFilter("ALL"); // Clear location filter when lab changes

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

  // KPI Calculations
  const kpiPartnerInstitutions = institutions.length;
  const kpiMyRequests = outgoingRequests.length;
  const kpiIncomingRequests = incomingRequests.length;
  const kpiActiveAgreements = agreements.filter((a) => (a.status || "ACTIVE") === "ACTIVE").length;
  const kpiShareableAssets = deptEquipment.filter((e) => e.isShareable === true).length;

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

  // Handlers for Propose MOU / Counter Terms
  const handleOpenProposeMouModal = (req) => {
    setProposeMouModalReq(req);
    setMouStartDate(req.startDate || new Date().toISOString().slice(0, 10));
    setMouEndDate(req.endDate || new Date().toISOString().slice(0, 10));
    setMouHourlyRate(req.externalHourlyRate || req.hourlyRate || "");
    setMouTermsText(req.mouTerms || "Standard inter-institution laboratory usage agreement.");
  };

  const handleSubmitProposeMou = async (e) => {
    e.preventDefault();
    if (!mouTermsText.trim()) {
      toast?.("Please specify MOU terms.", "error");
      return;
    }
    try {
      const fullTerms = `[Dates: ${mouStartDate} to ${mouEndDate} | Rate: ₹${mouHourlyRate || '0'}/hr] ${mouTermsText}`;
      await sharingApi.proposeMou(proposeMouModalReq.id, fullTerms);
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
      setMouReviewModalReq(null);
      setLifecycleDrawerReq(null);
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
    try {
      await sharingApi.rejectRequest(rejectModalReq.id);
      toast?.("Sharing request rejected.", "info");
      setRejectModalReq(null);
      setMouReviewModalReq(null);
      setLifecycleDrawerReq(null);
      fetchAllData();
    } catch (err) {
      toast?.(err.message || "Failed to reject request", "error");
    }
  };

  const userInstName = user?.institutionName || user?.institution || "Your Institution";
  const userDeptName = user?.departmentName || user?.department || "Your Department";

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Cross-Institution Sharing</h1>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Control Center
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Share laboratory resources with approved partner institutions & govern inter-institution access
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 w-fit">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{userInstName}</span>
              <span className="text-slate-400">→</span>
              <span>Department: {userDeptName}</span>
            </div>
          </div>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. TOP KPI STRIP (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner Institutions</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{kpiPartnerInstitutions}</p>
          <span className="text-[11px] text-slate-400 font-medium">Approved partners</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Requests</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{kpiMyRequests}</p>
          <span className="text-[11px] text-slate-400 font-medium">Outgoing applications</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incoming Requests</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Handshake className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{kpiIncomingRequests}</p>
          <span className="text-[11px] text-slate-400 font-medium">Awaiting governance review</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Agreements</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{kpiActiveAgreements}</p>
          <span className="text-[11px] text-slate-400 font-medium">MOUs active</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sharing Eligible</span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{kpiShareableAssets}</p>
          <span className="text-[11px] text-slate-400 font-medium">My dept shareable equipment</span>
        </div>
      </div>

      {/* 3. 5 MAIN NAVIGATION TABS */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-2 shadow-sm flex flex-wrap gap-1">
        {[
          { id: "explore", label: "Explore Institutions", icon: Building2 },
          { id: "outgoing", label: `My Requests (${kpiMyRequests})`, icon: Send },
          { id: "incoming", label: `Incoming Requests (${kpiIncomingRequests})`, icon: Handshake },
          { id: "agreements", label: `Active Agreements (${kpiActiveAgreements})`, icon: ShieldCheck },
          { id: "history", label: "Sharing History", icon: History },
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
                  ? "bg-slate-900 text-white shadow"
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
                  <p className="text-xs text-slate-500">Approved partner institutions available for cross-institution sharing</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {institutions.length} Partners Found
                </span>
              </div>

              {institutions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-3 text-sm font-bold text-slate-900">No Partner Institutions Found</h3>
                  <p className="mt-1 text-xs text-slate-500">No other active institutions registered in the network.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {institutions.map((inst) => (
                    <div
                      key={(inst.institutionId || inst.id)}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
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

                        <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                          {inst.contactEmail && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{inst.contactEmail}</span>
                            </p>
                          )}
                          {inst.contactPhone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{inst.contactPhone}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                          Partner Institution
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
            /* SELECTED PARTNER EQUIPMENT CATALOG (STRICTLY PARTNER SCOPED) */
            <div className="space-y-6">
              {/* Partner Catalog Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
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
                      Browse all active equipment catalog published for inter-institution discovery
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
                    {/* Department Dropdown (Populated dynamically from selected partner) */}
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

                    {/* Laboratory Dropdown (Cascading: Dependent on Department) */}
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

                    {/* Location Dropdown (Cascading: Dependent on Department/Lab) */}
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

                    {/* Sharing Filter Dropdown — client-side filter on loaded data */}
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
                // Apply sharing filter client-side on already-loaded equipment
                const displayEquipment = partnerSharingFilter === "ALL"
                  ? partnerEquipment
                  : partnerSharingFilter === "ENABLED"
                  ? partnerEquipment.filter((e) => e.isShareable === true)
                  : partnerEquipment.filter((e) => e.isShareable !== true);

                if (partnerLoading) {
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                      <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
                      <p className="mt-3 text-xs text-slate-500 font-semibold">Loading {selectedInst.name} equipment catalog...</p>
                    </div>
                  );
                }

                // CASE A: Partner has zero equipment at all
                if (partnerEquipment.length === 0) {
                  return (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm space-y-4">
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
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm space-y-4">
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
                          <span className="font-semibold">{selectedInst.name}</span>{" "}
                          {partnerSharingFilter === "ENABLED"
                            ? "currently has no equipment enabled for external sharing requests."
                            : "currently has no equipment in this sharing state."}
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
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm space-y-4">
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

                // Normal grid
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
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                          >
                            <div>
                              {/* Equipment Image / Fallback */}
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
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                                      SHARING ENABLED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-1 text-[10px] font-bold text-white shadow">
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

                                {/* Sharing Status */}
                                <div className={`mt-3 rounded-xl p-2.5 border ${
                                  isShareable
                                    ? "bg-emerald-50 border-emerald-100"
                                    : "bg-slate-50 border-slate-100"
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

                                {/* External Rate — only show if present */}
                                {eq.externalHourlyRate != null && (
                                  <div className="mt-2 flex items-center justify-between bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                    <span className="text-xs text-slate-500 font-medium">External Rate</span>
                                    <span className="text-sm font-black text-slate-900">
                                      ₹{eq.externalHourlyRate}/hr
                                    </span>
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
                                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition shadow-sm ${
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
      {/* TAB 2: MY REQUESTS (OUTGOING)                                             */}
      {/* ========================================================================= */}
      {activeTab === "outgoing" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Outgoing Requests</h2>
              <p className="text-xs text-slate-500">Track status of equipment requests submitted to partner institutions</p>
            </div>
            <select
              value={outgoingStatusFilter}
              onChange={(e) => setOutgoingStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="MOU_PROPOSED">MOU Proposed</option>
              <option value="AGREEMENT_ACTIVE">Active Agreement</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {outgoingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Send className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Outgoing Requests</h3>
              <p className="mt-1 text-xs text-slate-500">You have not submitted any sharing requests yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {outgoingRequests
                .filter((r) => outgoingStatusFilter === "ALL" || (r.status || "PENDING") === outgoingStatusFilter)
                .map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {req.targetInstitutionName || req.institutionName || "Partner Institution"}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            req.status === "AGREEMENT_ACTIVE" || req.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "MOU_PROPOSED"
                              ? "bg-amber-100 text-amber-800"
                              : req.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {req.status || "PENDING"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{req.equipmentName || req.equipment?.name || "Equipment"}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dates: {req.startDate} to {req.endDate}</span>
                      </p>
                      {req.purpose && <p className="text-xs text-slate-600 line-clamp-1 italic">"{req.purpose}"</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === "MOU_PROPOSED" && (
                        <button
                          onClick={() => setMouReviewModalReq(req)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm"
                        >
                          <FileCheck className="w-4 h-4" />
                          Review MOU
                        </button>
                      )}

                      <button
                        onClick={() => setLifecycleDrawerReq(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Lifecycle
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INCOMING REQUESTS                                                  */}
      {/* ========================================================================= */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900">Incoming Requests Governance</h2>
              <p className="text-xs text-slate-500">Review and respond to equipment sharing requests from partner institutions</p>
            </div>
            <select
              value={incomingStatusFilter}
              onChange={(e) => setIncomingStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="MOU_PROPOSED">MOU Proposed</option>
              <option value="AGREEMENT_ACTIVE">Active Agreement</option>
            </select>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Handshake className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Incoming Requests</h3>
              <p className="mt-1 text-xs text-slate-500">No other institutions have requested your department equipment yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {incomingRequests
                .filter((r) => incomingStatusFilter === "ALL" || (r.status || "PENDING") === incomingStatusFilter)
                .map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          From: {req.requestorInstitutionName || req.requestingInstitution || "Partner Institution"}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            req.status === "AGREEMENT_ACTIVE" || req.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "MOU_PROPOSED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {req.status || "PENDING"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        Equipment Requested: {req.equipmentName || req.equipment?.name || "Equipment"}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Requested: {req.startDate} to {req.endDate}
                        </span>
                        {req.requestorName && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Requester: {req.requestorName}
                          </span>
                        )}
                      </div>

                      {req.purpose && (
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-700">Purpose: </span>
                          "{req.purpose}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenProposeMouModal(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Propose / Counter MOU
                      </button>

                      <button
                        onClick={() => handleOpenRejectModal(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACTIVE AGREEMENTS                                                 */}
      {/* ========================================================================= */}
      {activeTab === "agreements" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Active Sharing Agreements (MOUs)</h2>
            <p className="text-xs text-slate-500">Legal agreements active between institutions for lab resource access</p>
          </div>

          {agreements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Active Agreements</h3>
              <p className="mt-1 text-xs text-slate-500">No active sharing agreements found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {agreements.map((agr) => (
                <div key={agr.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      🟢 AGREEMENT ACTIVE
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Ref: #{agr.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{agr.equipmentName || "Equipment"}</h3>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p><span className="font-semibold text-slate-700">Partner:</span> {agr.partnerInstitutionName || "Partner Institution"}</p>
                    <p><span className="font-semibold text-slate-700">Valid Dates:</span> {agr.startDate || "N/A"} to {agr.endDate || "N/A"}</p>
                    <p><span className="font-semibold text-slate-700">Agreed Rate:</span> {agr.hourlyRate != null ? `₹${agr.hourlyRate}/hr` : "Not specified"}</p>
                  </div>

                  {agr.mouTerms && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      {agr.mouTerms}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SHARING HISTORY                                                   */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Sharing History Audit Log</h2>
            <p className="text-xs text-slate-500">Historical log of all completed, expired, or rejected requests</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              Audit Trail
            </div>
            <div className="divide-y divide-slate-100">
              {[...outgoingRequests, ...incomingRequests].length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No historical sharing logs recorded yet.</div>
              ) : (
                [...outgoingRequests, ...incomingRequests].map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{item.equipmentName || "Equipment"} — Request ID #{item.id}</p>
                      <p className="text-slate-500">
                        {item.startDate} to {item.endDate} | Purpose: {item.purpose || "Research"}
                      </p>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                        item.status === "AGREEMENT_ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.status || "COMPLETED"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 1: EQUIPMENT DETAILS DRAWER                                        */}
      {/* ========================================================================= */}
      {detailsEq && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
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

              {/* Sharing Status Badge */}
              <div className={`rounded-xl p-3 border ${
                detailsEq.isShareable
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-slate-50 border-slate-100"
              }`}>
                <p className={`text-sm font-bold ${detailsEq.isShareable ? "text-emerald-700" : "text-slate-500"}`}>
                  {detailsEq.isShareable ? "🟢 SHARING ENABLED" : "⚪ SHARING DISABLED"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {detailsEq.isShareable
                    ? "Available for external sharing requests"
                    : "Not currently available for external sharing requests"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Manufacturer</span>
                  <p className="font-bold text-slate-800">{detailsEq.manufacturer || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Model</span>
                  <p className="font-bold text-slate-800">{detailsEq.model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Institution</span>
                  <p className="font-bold text-slate-800">{detailsEq.institutionName || selectedInst?.name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-bold text-slate-800">{detailsEq.departmentName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Laboratory</span>
                  <p className="font-bold text-slate-800">{detailsEq.labName || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location</span>
                  <p className="font-bold text-slate-800">{detailsEq.location || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Condition</span>
                  <p className="font-bold text-slate-800">{detailsEq.condition || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Capacity per Slot</span>
                  <p className="font-bold text-slate-800">{detailsEq.capacityPerSlot != null ? detailsEq.capacityPerSlot : "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Internal Hourly Rate</span>
                  <p className="font-bold text-slate-800">{detailsEq.internalHourlyRate != null ? `₹${detailsEq.internalHourlyRate}/hr` : "Not specified"}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">External Hourly Rate</span>
                  <p className="font-bold text-slate-800">{detailsEq.externalHourlyRate != null ? `₹${detailsEq.externalHourlyRate}/hr` : "Not specified"}</p>
                </div>
              </div>

              {/* Calibration Info */}
              {(detailsEq.calibrationStatus || detailsEq.lastCalibratedDate || detailsEq.nextCalibrationDate) && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Calibration Information</h4>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 text-xs">
                    {detailsEq.calibrationStatus && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        <span><span className="font-semibold">Status:</span> {detailsEq.calibrationStatus}</span>
                      </div>
                    )}
                    {detailsEq.lastCalibratedDate && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        <span><span className="font-semibold">Last Calibrated:</span> {detailsEq.lastCalibratedDate}</span>
                      </div>
                    )}
                    {detailsEq.nextCalibrationDate && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        <span><span className="font-semibold">Next Calibration:</span> {detailsEq.nextCalibrationDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parsed Technical Specifications */}
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
      {/* MODAL 1: REQUEST SHARING MODAL                                           */}
      {/* ========================================================================= */}
      {requestEqModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Submit Inter-Institution Sharing Request</h3>
                <p className="text-xs text-slate-400 mt-0.5">Target: {requestEqModal.name}</p>
              </div>
              <button onClick={() => setRequestEqModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 space-y-1">
                <p><span className="font-semibold">Institution:</span> {selectedInst?.name || "Partner Institution"}</p>
                <p><span className="font-semibold">Rate:</span> {requestEqModal.externalHourlyRate != null ? `₹${requestEqModal.externalHourlyRate}/hr` : "Not specified"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={reqStartDate}
                    onChange={(e) => setReqStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={reqEndDate}
                    onChange={(e) => setReqEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Research Purpose & Specifications</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your research project, required hours, and operator support details..."
                  value={reqPurpose}
                  onChange={(e) => setReqPurpose(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRequestEqModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 2: REQUEST LIFECYCLE TIMELINE DRAWER                              */}
      {/* ========================================================================= */}
      {lifecycleDrawerReq && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Request Lifecycle Tracker</h2>
              <button onClick={() => setLifecycleDrawerReq(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Request #{lifecycleDrawerReq.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{lifecycleDrawerReq.equipmentName || "Equipment"}</h3>
              </div>

              {/* VISUAL 5-STEP LIFECYCLE TIMELINE */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Lifecycle Progress</h4>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {[
                    { step: 1, label: "Request Submitted", desc: "Application sent to target institution" },
                    { step: 2, label: "Owner Reviewed", desc: "Department Head evaluating request" },
                    { step: 3, label: "MOU Proposed", desc: "Terms and rates generated" },
                    { step: 4, label: "MOU Accepted", desc: "Both institutions signed terms" },
                    { step: 5, label: "Agreement Active", desc: "Inter-institution access enabled" },
                  ].map((s) => {
                    const status = lifecycleDrawerReq.status || "PENDING";
                    let isDone = false;
                    let isCurrent = false;

                    if (status === "AGREEMENT_ACTIVE" || status === "ACTIVE") {
                      isDone = true;
                    } else if (status === "MOU_PROPOSED") {
                      if (s.step <= 3) isDone = true;
                      if (s.step === 3) isCurrent = true;
                    } else if (status === "PENDING") {
                      if (s.step === 1) isDone = true;
                      if (s.step === 2) isCurrent = true;
                    }

                    return (
                      <div key={s.step} className="flex items-start gap-3 relative z-10">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-100"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isCurrent ? "text-blue-600" : "text-slate-800"}`}>{s.label}</p>
                          <p className="text-[11px] text-slate-500">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PROPOSE ALTERNATIVE TERMS / MOU MODAL                            */}
      {/* ========================================================================= */}
      {proposeMouModalReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Propose MOU / Counter Terms</h3>
                <p className="text-xs text-slate-400">Request #{proposeMouModalReq.id}</p>
              </div>
              <button onClick={() => setProposeMouModalReq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposeMou} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Approved Start Date</label>
                  <input
                    type="date"
                    required
                    value={mouStartDate}
                    onChange={(e) => setMouStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Approved End Date</label>
                  <input
                    type="date"
                    required
                    value={mouEndDate}
                    onChange={(e) => setMouEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">External Hourly Rate (₹/hr)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={mouHourlyRate}
                  onChange={(e) => setMouHourlyRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MOU Terms & Conditions</label>
                <textarea
                  rows={4}
                  required
                  value={mouTermsText}
                  onChange={(e) => setMouTermsText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setProposeMouModalReq(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  Submit MOU Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MOU REVIEW & ACCEPTANCE MODAL                                    */}
      {/* ========================================================================= */}
      {mouReviewModalReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Review Proposed MOU Terms</h3>
                <p className="text-xs text-slate-400">Request #{mouReviewModalReq.id}</p>
              </div>
              <button onClick={() => setMouReviewModalReq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold">MOU Terms proposed by partner institution:</p>
                <p className="italic bg-white p-3 rounded-lg border border-amber-100 text-slate-800">
                  {mouReviewModalReq.mouTerms || "Standard inter-institution sharing agreement."}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => handleOpenRejectModal(mouReviewModalReq)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  Decline
                </button>

                <button
                  onClick={() => handleAcceptMou(mouReviewModalReq.id)}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Accept & Activate Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REJECT REQUEST MODAL                                             */}
      {/* ========================================================================= */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-rose-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Reject Sharing Request</h3>
              <button onClick={() => setRejectModalReq(null)} className="text-rose-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide reason for rejecting this request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700"
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

export default SharingControlCenter;
