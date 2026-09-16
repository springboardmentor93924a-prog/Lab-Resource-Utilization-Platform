import { useState, useEffect } from "react";
import { FileText, Download, ExternalLink, FileSpreadsheet, FileCode, FolderOpen } from "lucide-react";
import { equipmentApi } from "../../../api/equipmentApi.js";

export function EquipmentDocumentsTab({ equipment }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const eqId = equipment?.equipmentId || equipment?.id;

  useEffect(() => {
    if (eqId) {
      setLoading(true);
      equipmentApi
        .getDocuments(eqId)
        .then((data) => {
          if (Array.isArray(data)) setDocuments(data);
        })
        .catch(() => setDocuments([]))
        .finally(() => setLoading(false));
    }
  }, [eqId]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDocType = (type) => {
    if (!type) return "Document";
    return type.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Equipment Manuals & Technical Documents
        </h4>
        <span className="text-[11px] text-slate-500 font-medium">
          {documents.length} Available
        </span>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 p-6 text-center">Loading documents...</div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate" title={doc.documentName}>
                    {doc.documentName || "Technical Document"}
                  </p>
                  <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                    {formatDocType(doc.documentType)}
                  </p>
                  {doc.fileSize && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatFileSize(doc.fileSize)}
                    </p>
                  )}
                </div>
              </div>

              {doc.cloudinarySecureUrl && (
                <a
                  href={doc.cloudinarySecureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 transition-colors shrink-0 shadow-sm"
                >
                  <ExternalLink size={12} />
                  <span>View</span>
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
            <FolderOpen size={22} />
          </div>
          <h4 className="text-sm font-bold text-slate-700">No Documents Available</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No operating manuals, wiring diagrams, or safety datasheets have been uploaded for this equipment yet.
          </p>
        </div>
      )}
    </div>
  );
}
