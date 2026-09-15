// Shared style objects so every newly-wired page looks consistent without
// each file redeclaring the same 20 constants. Plain JS objects for React's
// inline `style` prop - no CSS build step needed.

export const page = { padding: "30px 34px", background: "#f6f8fc", minHeight: "100%", boxSizing: "border-box", color: "#172b4d" };
export const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26, flexWrap: "wrap", gap: 12 };
export const h1Style = { margin: 0, fontSize: 28, fontWeight: 700, color: "#172b4d" };
export const subStyle = { margin: "7px 0 0", fontSize: 14, color: "#718096" };
export const primaryBtn = { border: "none", background: "#2563eb", color: "white", padding: "11px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" };
export const cancelBtn = { padding: "9px 16px", borderRadius: 6, border: "1px solid #d8dee8", background: "white", color: "#64748b", cursor: "pointer" };
export const statsRow = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 };
export const statCardStyle = { background: "white", border: "1px solid #e4e8ef", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(20,40,70,0.04)" };
export const iconBoxStyle = { width: 42, height: 42, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, flexShrink: 0 };
export const card = { background: "#fff", border: "1px solid #e4e8ef", borderRadius: 12, boxShadow: "0 2px 8px rgba(20,40,70,0.04)" };
export const filterBar = { padding: "17px 20px", borderBottom: "1px solid #e8ecf2", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" };
export const searchInput = { flex: 1, minWidth: 200, height: 40, border: "1px solid #d9dfe8", borderRadius: 7, padding: "0 12px", fontSize: 13, boxSizing: "border-box" };
export const selectStyle = { height: 40, minWidth: 160, border: "1px solid #d9dfe8", borderRadius: 7, padding: "0 10px", background: "white", color: "#475569", fontSize: 13 };
export const thStyle = { padding: "13px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" };
export const tdStyle = { padding: "14px 16px", color: "#475569", fontSize: 13, whiteSpace: "nowrap" };
export const actionBtn = { border: "1px solid #cbd5e1", background: "white", color: "#334155", padding: "5px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer" };
export const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 };
export const modalCard = { background: "white", borderRadius: 12, padding: 26, width: 560, maxWidth: "100%", maxHeight: "85vh", overflowY: "auto" };
export const labelStyle = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#334155" };
export const inputStyle = { width: "100%", height: 40, boxSizing: "border-box", border: "1px solid #d8dee8", borderRadius: 6, padding: "0 10px", fontSize: 13, outline: "none" };
export const hintText = { fontSize: 11, color: "#94a3b8", margin: "4px 0 0" };
export const errorText = { color: "#c0392b" };
export const emptyText = { padding: 30, textAlign: "center", color: "#94a3b8" };

export function pill(bg, fg) {
  return { background: bg, color: fg, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, display: "inline-block" };
}
