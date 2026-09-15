import { useEffect, useState } from "react";
import { getAllEquipment } from "../api/equipmentApi";
import { createSharingRequest } from "../api/sharingApi";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { page, headerRow, h1Style, subStyle, card, filterBar, searchInput, selectStyle, thStyle, tdStyle, actionBtn, errorText, emptyText, pill } from "../styles/shared";

function ExternalBooking({ showToast }) {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("All");
  const [requestedIds, setRequestedIds] = useState([]);

  useEffect(() => {
    getAllEquipment()
      .then(setEquipment)
      .catch((err) => setError(extractErrorMessage(err, "Failed to load equipment.")))
      .finally(() => setLoading(false));
  }, []);

  const myInstitutionId = user?.institution?.institutionId;

  // "External booking" = equipment that belongs to institutions other than
  // the logged-in user's own. The actual request goes through the same
  // /api/resource-sharing/request endpoint used on the Resource Sharing page.
  const externalEquipment = equipment.filter(
    (eq) => eq.institutionId && eq.institutionId !== myInstitutionId
  );

  const institutions = [...new Map(externalEquipment.map((e) => [e.institutionId, e.institutionName])).entries()];

  const filtered = externalEquipment.filter((eq) => {
    const matchesSearch = (eq.equipmentName || "").toLowerCase().includes(search.toLowerCase());
    const matchesInstitution = institutionFilter === "All" || String(eq.institutionId) === institutionFilter;
    return matchesSearch && matchesInstitution;
  });

  const handleRequest = async (eq) => {
    try {
      await createSharingRequest(eq.equipmentId);
      setRequestedIds((prev) => [...prev, eq.equipmentId]);
      showToast?.(`Access request sent for "${eq.equipmentName}".`, "success");
    } catch (err) {
      showToast?.(extractErrorMessage(err, "Failed to submit request."), "warning");
    }
  };

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={h1Style}>External Institution Equipment</h1>
          <p style={subStyle}>Browse and request access to equipment at partner institutions</p>
        </div>
      </div>

      {error && <p style={errorText}>{error}</p>}
      {!myInstitutionId && (
        <p style={{ color: "#b56a00", fontSize: 13 }}>
          Your profile hasn't finished loading, so results may include your own institution's equipment too.
        </p>
      )}

      <div style={card}>
        <div style={filterBar}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment..." style={searchInput} />
          <select value={institutionFilter} onChange={(e) => setInstitutionFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Institutions</option>
            {institutions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <p style={{ padding: 20 }}>Loading equipment...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Equipment</th>
                  <th style={thStyle}>Institution</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((eq) => (
                  <tr key={eq.equipmentId} style={{ borderBottom: "1px solid #f0f2f6" }}>
                    <td style={tdStyle}>{eq.equipmentName}</td>
                    <td style={tdStyle}>{eq.institutionName}</td>
                    <td style={tdStyle}>{eq.categoryName || "-"}</td>
                    <td style={tdStyle}>
                      <span style={eq.status === "AVAILABLE" ? pill("#e8f7ee", "#16834b") : pill("#fff4df", "#b56a00")}>{eq.status}</span>
                    </td>
                    <td style={tdStyle}>
                      {requestedIds.includes(eq.equipmentId) ? (
                        <span style={pill("#eaf2ff", "#2563eb")}>Requested</span>
                      ) : (
                        <button onClick={() => handleRequest(eq)} style={actionBtn}>Request Access</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={emptyText}>No external equipment found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExternalBooking;
