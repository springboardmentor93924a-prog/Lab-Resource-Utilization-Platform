import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  getWhatWeOwe,
  getWhatIsOwedToUs,
  markPaid,
} from "../services/billingService";
import { isAdmin } from "../utils/auth";

const thStyle = {
  padding: "14px 16px",
  textAlign: "left",
  background: "#081B33",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: 700,
  borderBottom: "1px solid #29476B",
};

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #29476B",
  color: "#E6EEF8",
  fontSize: "14px",
  background: "#102A43",
};

function statusBadge(status) {
  return (
    <span
      style={{
        display: "inline-block",
        background: status === "PAID" ? "#22c55e" : "#f59e0b",
        color: "#FFFFFF",
        padding: "5px 11px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {status}
    </span>
  );
}

export default function Billing() {
  const navigate = useNavigate();

  const [weOwe, setWeOwe] = useState([]);
  const [owedToUs, setOwedToUs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!isAdmin()) {
    alert("You don't have permission to view billing.");
    navigate("/dashboard");
    return;
  }

  async function loadBillingData() {
    try {
      const [owe, owed] = await Promise.all([
        getWhatWeOwe(),
        getWhatIsOwedToUs(),
      ]);

      setWeOwe(owe);
      setOwedToUs(owed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  loadBillingData();
}, [navigate]);

async function handleMarkPaid(id) {
  try {
    await markPaid(id);
    alert("Marked as paid.");

    // Refresh billing data
    const [owe, owed] = await Promise.all([
      getWhatWeOwe(),
      getWhatIsOwedToUs(),
    ]);

    setWeOwe(owe);
    setOwedToUs(owed);
  } catch (err) {
    alert(
      err.response?.data?.message ||
        "Failed to mark as paid."
    );
  }
}

  function renderTable(records, showAction) {
    return (
      <div
        style={{
          background: "#102A43",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.25)",
          border: "1px solid #29476B",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Equipment</th>

              <th style={thStyle}>
                {showAction ? "Charged to" : "Owed to"}
              </th>

              <th style={thStyle}>Amount</th>

              <th style={thStyle}>Status</th>

              <th style={thStyle}>Date</th>

              {showAction && (
                <th style={thStyle}>Action</th>
              )}
            </tr>
          </thead>

          <tbody>
            {records.length === 0 && (
              <tr>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "#AFC4DA",
                    padding: "22px",
                  }}
                  colSpan={showAction ? 6 : 5}
                >
                  No billing records found.
                </td>
              </tr>
            )}

            {records.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>
                  {r.equipmentName}
                </td>

                <td style={tdStyle}>
                  {showAction
                    ? r.billedInstitutionName
                    : r.owningInstitutionName}
                </td>

                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 600,
                    color: "#FFFFFF",
                  }}
                >
                  ₹{r.amount}
                </td>

                <td style={tdStyle}>
                  {statusBadge(r.status)}
                </td>

                <td style={tdStyle}>
                  {new Date(
                    r.createdAt
                  ).toLocaleDateString()}
                </td>

                {showAction && (
                  <td style={tdStyle}>
                    {r.status === "UNPAID" && (
                      <button
                        onClick={() =>
                          handleMarkPaid(r.id)
                        }
                        style={{
                          background: "#38BDF8",
                          color: "#06213A",
                          border: "none",
                          padding: "7px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Mark as paid
                      </button>
                    )}

                    {r.status === "PAID" && (
                      <span
                        style={{
                          color: "#86EFAC",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Payment completed
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#061525",
      }}
    >
      {/* Sidebar */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "30px",
          background:
            "linear-gradient(135deg, #061525 0%, #0A1F35 50%, #0B2742 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Page Title */}
        <h2
          style={{
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: "30px",
            fontSize: "24px",
          }}
        >
          Inter-institution billing
        </h2>

        {loading && (
          <p
            style={{
              color: "#D7E3F0",
              fontSize: "15px",
            }}
          >
            Loading billing records...
          </p>
        )}

        {!loading && (
          <>
            {/* What We Owe */}
            <h5
              style={{
                color: "#FFFFFF",
                marginBottom: "14px",
                fontSize: "17px",
                fontWeight: 600,
              }}
            >
              What we owe
            </h5>

            {renderTable(weOwe, false)}

            {/* What Is Owed To Us */}
            <h5
              style={{
                color: "#FFFFFF",
                margin: "32px 0 14px",
                fontSize: "17px",
                fontWeight: 600,
              }}
            >
              What is owed to us
            </h5>

            {renderTable(owedToUs, true)}
          </>
        )}
      </main>
    </div>
  );
}