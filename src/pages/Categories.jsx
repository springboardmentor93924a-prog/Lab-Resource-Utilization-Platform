import { useEffect, useMemo, useState } from "react";
import { getAllEquipment } from "../api/equipmentApi";
import { extractErrorMessage } from "../api/client";
import { page, headerRow, h1Style, subStyle, card, thStyle, tdStyle, errorText, emptyText } from "../styles/shared";

function Categories() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllEquipment()
      .then(setEquipment)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load equipment.")))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map();
    equipment.forEach((e) => {
      if (!e.categoryId) return;
      if (!map.has(e.categoryId)) {
        map.set(e.categoryId, { categoryId: e.categoryId, categoryName: e.categoryName, count: 0, available: 0 });
      }
      const entry = map.get(e.categoryId);
      entry.count += 1;
      if (e.status === "AVAILABLE") entry.available += 1;
    });
    return Array.from(map.values());
  }, [equipment]);

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>Equipment Categories</h1>
          <p style={subStyle}>Categories currently in use across your equipment inventory</p>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: -14, marginBottom: 20 }}>
        The backend doesn't expose a category-management endpoint yet, so this list is
        read-only and derived from the equipment already registered — it can't be used to
        create or rename categories.
      </p>

      {error && <p style={errorText}>{error}</p>}

      <div style={card}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading categories...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Category ID</th>
                  <th style={thStyle}>Category Name</th>
                  <th style={thStyle}>Equipment Count</th>
                  <th style={thStyle}>Available</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.categoryId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{c.categoryId}</td>
                    <td style={tdStyle}>{c.categoryName}</td>
                    <td style={tdStyle}>{c.count}</td>
                    <td style={tdStyle}>{c.available}</td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} style={emptyText}>No categories found in the current equipment list.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;
