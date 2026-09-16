import {
  Building2, FlaskConical, MapPin, Tag, Hash,
  DollarSign, Clock, CheckCircle2, ShieldCheck,
  Calendar, Layers, FileText
} from "lucide-react";

export function EquipmentOverviewTab({ equipment }) {
  const eq = equipment || {};

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "Not available";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not available";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  const fields = [
    { label: "Equipment Name", value: eq.name, icon: FileText },
    { label: "Asset ID", value: eq.equipmentId ? `EQ-${eq.equipmentId}` : "Not available", icon: Hash },
    { label: "Category", value: eq.category, icon: Tag },
    { label: "Status", value: eq.status ? String(eq.status).replace(/_/g, " ") : "Not available", icon: CheckCircle2 },
    { label: "Department", value: eq.departmentName, icon: Building2 },
    { label: "Laboratory", value: eq.labName, icon: FlaskConical },
    { label: "Location / Room", value: eq.location, icon: MapPin },
    { label: "Manufacturer", value: eq.manufacturer, icon: Layers },
    { label: "Model Number", value: eq.model, icon: Layers },
    { label: "Serial Number", value: eq.serialNumber, icon: Hash },
    { label: "Condition", value: eq.condition, icon: ShieldCheck },
    { label: "Slot Capacity", value: eq.capacityPerSlot ? `${eq.capacityPerSlot} user(s)/slot` : "Not available", icon: Clock },
    { label: "Purchase Date", value: formatDate(eq.purchaseDate), icon: Calendar },
    { label: "Purchase Cost", value: formatCurrency(eq.purchaseCost), icon: DollarSign },
    { label: "Hourly Rate (Internal)", value: formatCurrency(eq.hourlyRate), icon: DollarSign },
    { label: "Hourly Rate (External)", value: formatCurrency(eq.externalHourlyRate), icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Description if present */}
      {eq.description && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Equipment Description
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {eq.description}
          </p>
        </div>
      )}

      {/* Key Properties Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Equipment Details & Specifications
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {fields.map((f, idx) => {
            const Icon = f.icon;
            const hasVal = f.value && f.value !== "Not available";
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-1 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Icon size={13} className="shrink-0 text-slate-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    {f.label}
                  </span>
                </div>
                <p className={`text-sm font-semibold truncate ${hasVal ? "text-slate-900" : "text-slate-400 italic"}`} title={String(f.value || "")}>
                  {f.value || "Not available"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
