import { useMemo } from "react";
import { Cpu, Sliders, CheckCircle2, AlertCircle } from "lucide-react";

/* ================================================================== */
/*  Technician -> Dynamic Specifications Tab Component                 */
/* ================================================================== */
export function EquipmentSpecificationsTab({ specifications }) {
  // Parse specifications dynamically (JSON object, dictionary, key-value pairs, or raw string)
  const parsedSpecs = useMemo(() => {
    if (!specifications) return null;

    if (typeof specifications === "object" && specifications !== null) {
      return { type: "kv", data: specifications };
    }

    if (typeof specifications === "string") {
      const trimmed = specifications.trim();
      if (!trimmed) return null;

      // Check if it is JSON
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === "object" && parsed !== null) {
            return { type: "kv", data: parsed };
          }
        } catch {
          // not valid json, fall back to string parsing
        }
      }

      // Check if it has multi-line key: value pairs
      if (trimmed.includes(":") && (trimmed.includes("\n") || trimmed.includes(";"))) {
        const separator = trimmed.includes("\n") ? "\n" : ";";
        const lines = trimmed.split(separator).map((l) => l.trim()).filter(Boolean);
        const kv = {};
        let allKv = true;
        for (const line of lines) {
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim();
            if (key && val) {
              kv[key] = val;
            }
          } else {
            allKv = false;
            break;
          }
        }
        if (allKv && Object.keys(kv).length > 0) {
          return { type: "kv", data: kv };
        }
      }

      return { type: "text", data: trimmed };
    }

    return null;
  }, [specifications]);

  if (!parsedSpecs) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <Cpu size={22} />
        </div>
        <h4 className="text-sm font-bold text-slate-700">No Specifications Recorded</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No dynamic specifications or technical parameter guidelines have been configured for this equipment yet.
        </p>
      </div>
    );
  }

  // Format key labels from camelCase / snake_case to readable Title Case
  const formatKey = (key) => {
    if (!key) return "";
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Technical Specifications & Operating Parameters
          </h4>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Dynamic Data Structure
        </span>
      </div>

      {parsedSpecs.type === "kv" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(parsedSpecs.data).map(([key, val], idx) => {
            const displayVal = typeof val === "object" ? JSON.stringify(val) : String(val);
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-1 shadow-sm hover:border-slate-300 transition-colors"
              >
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {formatKey(key)}
                </p>
                <p className="text-sm font-semibold text-slate-900 leading-snug break-words">
                  {displayVal || "—"}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-start gap-2 text-slate-700">
            <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed whitespace-pre-line text-slate-800">
              {parsedSpecs.data}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
