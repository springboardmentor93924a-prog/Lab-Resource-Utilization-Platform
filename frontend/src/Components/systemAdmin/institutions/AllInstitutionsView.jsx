import React, { useState, useEffect } from "react";
import { Search, Landmark, RefreshCw, Eye, Building2, MapPin, Mail, Phone, Globe } from "lucide-react";
import { authApi } from "../../../api/authApi";

export default function AllInstitutionsView({ onViewDetails, toast }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const list = await authApi.listInstitutions();
      setInstitutions(list || []);
    } catch (err) {
      toast?.(err.message || "Failed to load institutions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const filtered = institutions.filter((inst) => {
    const matchesSearch =
      (inst.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inst.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (inst.contactEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (inst.city || "").toLowerCase().includes(search.toLowerCase());

    const status = inst.approvalStatus || (inst.isActive ? "APPROVED" : "PENDING");
    const matchesStatus =
      statusFilter === "ALL" || status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500 font-medium">Loading educational institutions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">All Educational Institutions</h1>
          <p className="text-sm text-slate-600">Overview of registered network institutions across the platform.</p>
        </div>
        <button
          onClick={fetchInstitutions}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by institution name, code, email, location..."
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending Approval</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <p className="text-xs font-semibold text-slate-500">Showing {filtered.length} of {institutions.length} institution{institutions.length === 1 ? "" : "s"}</p>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Institution Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No institutions match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inst) => (
                  <tr key={inst.institutionId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-700">{inst.code || "INST"}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{inst.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inst.institutionType || "Engineering"}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-slate-800">{inst.contactEmail || "—"}</p>
                      {inst.contactPhone && <p className="text-[11px] text-slate-400">{inst.contactPhone}</p>}
                    </td>
                    <td className="px-5 py-3.5">{inst.city ? `${inst.city}, ${inst.state}` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        inst.approvalStatus === "APPROVED" || inst.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : inst.approvalStatus === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {inst.approvalStatus || (inst.isActive ? "APPROVED" : "PENDING")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onViewDetails(inst.institutionId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
