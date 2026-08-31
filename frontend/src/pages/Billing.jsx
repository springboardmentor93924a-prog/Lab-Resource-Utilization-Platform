import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  getWhatWeOwe,
  getWhatIsOwedToUs,
  getDepartmentCostSummary,
  markPaid,
} from "../services/billingService";

import { isAdmin } from "../utils/auth";

/* =========================================================
   COLOR / STYLE HELPERS
========================================================= */

const pageBg =
  "linear-gradient(135deg, #020617 0%, #06182D 45%, #071E3A 100%)";

const cardBase = {
  background:
    "linear-gradient(145deg, rgba(15, 35, 62, 0.96), rgba(7, 25, 48, 0.96))",
  border: "1px solid rgba(56, 189, 248, 0.20)",
  borderRadius: "18px",
  boxShadow:
    "0 12px 35px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const thStyle = {
  padding: "15px 16px",
  textAlign: "left",
  background:
    "linear-gradient(135deg, #0B2342, #102F54)",
  color: "#EAF6FF",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.4px",
  borderBottom: "1px solid rgba(56,189,248,0.20)",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px 16px",
  borderBottom: "1px solid rgba(56,189,248,0.10)",
  color: "#DCEBFA",
  fontSize: "14px",
  background: "rgba(12, 35, 60, 0.72)",
};

/* =========================================================
   STATUS BADGE
========================================================= */

function statusBadge(status) {
  const paid = status === "PAID";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "999px",
        background: paid
          ? "linear-gradient(135deg, #16A34A, #22C55E)"
          : "linear-gradient(135deg, #D97706, #F59E0B)",
        color: "#FFFFFF",
        fontSize: "11px",
        fontWeight: 800,
        boxShadow: paid
          ? "0 0 14px rgba(34,197,94,0.28)"
          : "0 0 14px rgba(245,158,11,0.22)",
      }}
    >
      <i
        className={`fa-solid ${
          paid ? "fa-circle-check" : "fa-clock"
        }`}
      />
      {status}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
  gradient,
  glow,
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "18px",
        padding: "20px",
        minHeight: "145px",
        background: gradient,
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: `0 12px 30px ${glow}`,
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          right: "-35px",
          top: "-40px",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          right: "35px",
          bottom: "-45px",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.78)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "10px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            {value}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.20)",
            boxShadow: "0 5px 18px rgba(0,0,0,0.15)",
          }}
        >
          <i
            className={`fa-solid ${icon}`}
            style={{
              color: "#FFFFFF",
              fontSize: "21px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  iconBackground,
  title,
  subtitle,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "13px",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: iconBackground,
          boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
        }}
      >
        <i
          className={`fa-solid ${icon}`}
          style={{
            color: "#FFFFFF",
            fontSize: "17px",
          }}
        />
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            color: "#FFFFFF",
            fontSize: "18px",
            fontWeight: 800,
          }}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            style={{
              margin: "4px 0 0",
              color: "#8FAAC5",
              fontSize: "12px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Billing() {
  const navigate = useNavigate();

  const [weOwe, setWeOwe] = useState([]);
  const [owedToUs, setOwedToUs] = useState([]);
  const [departmentCosts, setDepartmentCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  /* =======================================================
     LOAD BILLING DATA
  ======================================================= */

  useEffect(() => {
    if (!isAdmin()) {
      alert("You don't have permission to view billing.");
      navigate("/dashboard");
      return;
    }

    async function loadBillingData() {
      try {
        const [owe, owed, departmentSummary] =
          await Promise.all([
            getWhatWeOwe(),
            getWhatIsOwedToUs(),
            getDepartmentCostSummary(),
          ]);

        setWeOwe(owe || []);
        setOwedToUs(owed || []);
        setDepartmentCosts(departmentSummary || []);
      } catch (err) {
        console.error(
          "Failed to load billing data:",
          err
        );

        alert(
          err.response?.data?.message ||
            "Failed to load billing information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, [navigate]);

  /* =======================================================
     MARK PAID
  ======================================================= */

  async function handleMarkPaid(id) {
    try {
      setPayingId(id);

      await markPaid(id);

      alert("Payment marked as paid.");

      const [owe, owed, departmentSummary] =
        await Promise.all([
          getWhatWeOwe(),
          getWhatIsOwedToUs(),
          getDepartmentCostSummary(),
        ]);

      setWeOwe(owe || []);
      setOwedToUs(owed || []);
      setDepartmentCosts(
        departmentSummary || []
      );
    } catch (err) {
      console.error(
        "Failed to mark payment as paid:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to mark as paid."
      );
    } finally {
      setPayingId(null);
    }
  }

  /* =======================================================
     TOTAL CALCULATIONS
  ======================================================= */

  const totalWeOwe = weOwe.reduce(
    (sum, record) =>
      sum + Number(record.amount || 0),
    0
  );

  const totalOwedToUs = owedToUs.reduce(
    (sum, record) =>
      sum + Number(record.amount || 0),
    0
  );

  const totalRecords =
    weOwe.length + owedToUs.length;

  const totalDepartmentCost =
    departmentCosts.reduce(
      (sum, item) =>
        sum + Number(item.totalCost || 0),
      0
    );

  /* =======================================================
     BILLING TABLE
  ======================================================= */

  function renderTable(records, showAction) {
    return (
      <div
        style={{
          ...cardBase,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1050px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>
                  Equipment
                </th>

                <th style={thStyle}>
                  Department
                </th>

                <th style={thStyle}>
                  {showAction
                    ? "Charged to"
                    : "Owed to"}
                </th>

                <th style={thStyle}>
                  Usage
                </th>

                <th style={thStyle}>
                  Hourly Rate
                </th>

                <th style={thStyle}>
                  Amount
                </th>

                <th style={thStyle}>
                  Status
                </th>

                <th style={thStyle}>
                  Date
                </th>

                {showAction && (
                  <th style={thStyle}>
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={showAction ? 9 : 8}
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      padding: "38px 20px",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "rgba(56,189,248,0.10)",
                        border:
                          "1px solid rgba(56,189,248,0.18)",
                      }}
                    >
                      <i
                        className="fa-solid fa-receipt"
                        style={{
                          color: "#38BDF8",
                          fontSize: "20px",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        color: "#DCEBFA",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      No billing records found
                    </div>

                    <div
                      style={{
                        color: "#7893AD",
                        fontSize: "12px",
                        marginTop: "5px",
                      }}
                    >
                      Billing activity will appear
                      here when applicable.
                    </div>
                  </td>
                </tr>
              )}

              {records.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    transition:
                      "background 0.2s ease",
                  }}
                >
                  {/* Equipment */}
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "9px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(135deg, #2563EB, #7C3AED)",
                          boxShadow:
                            "0 4px 12px rgba(59,130,246,0.25)",
                        }}
                      >
                        <i
                          className="fa-solid fa-microscope"
                          style={{
                            color: "#FFFFFF",
                            fontSize: "13px",
                          }}
                        />
                      </div>

                      {r.equipmentName}
                    </div>
                  </td>

                  {/* Department */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#BBD8F2",
                      }}
                    >
                      <i
                        className="fa-solid fa-building"
                        style={{
                          color: "#38BDF8",
                          fontSize: "11px",
                        }}
                      />

                      {r.department ||
                        "Unassigned"}
                    </span>
                  </td>

                  {/* Institution */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: "#E8F4FF",
                        fontWeight: 600,
                      }}
                    >
                      {showAction
                        ? r.billedInstitutionName
                        : r.owningInstitutionName}
                    </span>
                  </td>

                  {/* Usage */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i
                        className="fa-solid fa-clock"
                        style={{
                          color: "#A78BFA",
                          fontSize: "12px",
                        }}
                      />

                      {r.durationHours ?? 0}{" "}
                      hour(s)
                    </span>
                  </td>

                  {/* Hourly Rate */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: "#67E8F9",
                        fontWeight: 700,
                      }}
                    >
                      ₹{r.hourlyRate ?? 0}
                    </span>
                  </td>

                  {/* Amount */}
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 800,
                      color: "#FFFFFF",
                      fontSize: "15px",
                    }}
                  >
                    ₹{r.amount}
                  </td>

                  {/* Status */}
                  <td style={tdStyle}>
                    {statusBadge(r.status)}
                  </td>

                  {/* Date */}
                  <td style={tdStyle}>
                    {r.createdAt
                      ? new Date(
                          r.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Action */}
                  {showAction && (
                    <td style={tdStyle}>
                      {r.status === "UNPAID" ? (
                        <button
                          onClick={() =>
                            handleMarkPaid(r.id)
                          }
                          disabled={
                            payingId === r.id
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            border: "none",
                            padding:
                              "9px 14px",
                            borderRadius: "9px",
                            background:
                              "linear-gradient(135deg, #06B6D4, #2563EB)",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor:
                              payingId === r.id
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              payingId === r.id
                                ? 0.65
                                : 1,
                            boxShadow:
                              "0 5px 15px rgba(37,99,235,0.25)",
                          }}
                        >
                          <i
                            className={`fa-solid ${
                              payingId === r.id
                                ? "fa-spinner fa-spin"
                                : "fa-check"
                            }`}
                          />

                          {payingId === r.id
                            ? "Processing..."
                            : "Mark as paid"}
                        </button>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "#4ADE80",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          <i className="fa-solid fa-circle-check" />
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
      </div>
    );
  }

  /* =======================================================
     DEPARTMENT SUMMARY
  ======================================================= */

  function renderDepartmentSummary() {
    return (
      <div
        style={{
          ...cardBase,
          overflow: "hidden",
        }}
      >
        {departmentCosts.length === 0 ? (
          <div
            style={{
              padding: "38px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                margin: "0 auto 12px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "rgba(167,139,250,0.10)",
              }}
            >
              <i
                className="fa-solid fa-chart-pie"
                style={{
                  color: "#A78BFA",
                  fontSize: "20px",
                }}
              />
            </div>

            <div
              style={{
                color: "#DCEBFA",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              No department cost records
            </div>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
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
                  <th style={thStyle}>
                    Department
                  </th>

                  <th style={thStyle}>
                    Allocated Cost
                  </th>
                </tr>
              </thead>

              <tbody>
                {departmentCosts.map(
                  (item, index) => (
                    <tr
                      key={
                        item.department ||
                        `department-${index}`
                      }
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontWeight: 700,
                          }}
                        >
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "9px",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "linear-gradient(135deg, #7C3AED, #C026D3)",
                            }}
                          >
                            <i
                              className="fa-solid fa-flask"
                              style={{
                                color: "#FFFFFF",
                                fontSize:
                                  "13px",
                              }}
                            />
                          </div>

                          {item.department ||
                            "Unassigned"}
                        </div>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 800,
                          color: "#FFFFFF",
                          fontSize: "15px",
                        }}
                      >
                        ₹{item.totalCost}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: pageBg,
        }}
      >
        <aside className="sidebar">
          <Sidebar />
        </aside>

        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#DCEBFA",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "50%",
                margin: "0 auto 15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #2563EB, #7C3AED)",
                boxShadow:
                  "0 0 25px rgba(99,102,241,0.35)",
              }}
            >
              <i
                className="fa-solid fa-receipt"
                style={{
                  color: "#FFFFFF",
                  fontSize: "21px",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              Loading billing...
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: pageBg,
      }}
    >
      {/* SIDEBAR */}
      <aside className="sidebar">
        <Sidebar />
      </aside>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          padding: "28px 30px 50px",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {/* =================================================
            HERO
        ================================================= */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "22px",
            padding: "28px 30px",
            marginBottom: "24px",
            background:
              "linear-gradient(135deg, #0B2A50 0%, #143B68 45%, #432078 100%)",
            border:
              "1px solid rgba(96,165,250,0.28)",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.28)",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              background:
                "rgba(56,189,248,0.15)",
              right: "-70px",
              top: "-110px",
              filter: "blur(5px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background:
                "rgba(168,85,247,0.13)",
              right: "150px",
              bottom: "-130px",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "17px",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #06B6D4, #6366F1, #A855F7)",
                boxShadow:
                  "0 0 25px rgba(99,102,241,0.45)",
              }}
            >
              <i
                className="fa-solid fa-file-invoice-dollar"
                style={{
                  color: "#FFFFFF",
                  fontSize: "24px",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  color: "#67E8F9",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  marginBottom: "5px",
                }}
              >
                Financial overview
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#FFFFFF",
                  fontSize: "27px",
                  fontWeight: 850,
                }}
              >
                Inter-institution Billing
              </h1>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  color: "#BBD4ED",
                  fontSize: "13px",
                }}
              >
                Track equipment usage,
                payments and institutional
                costs in one place.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          <StatCard
            icon="fa-arrow-up"
            title="What we owe"
            value={`₹${totalWeOwe}`}
            subtitle={`${weOwe.length} billing record(s)`}
            gradient="linear-gradient(135deg, #2563EB, #4F46E5)"
            glow="rgba(37,99,235,0.20)"
          />

          <StatCard
            icon="fa-arrow-down"
            title="Owed to us"
            value={`₹${totalOwedToUs}`}
            subtitle={`${owedToUs.length} billing record(s)`}
            gradient="linear-gradient(135deg, #059669, #0D9488)"
            glow="rgba(13,148,136,0.20)"
          />

          <StatCard
            icon="fa-receipt"
            title="Total records"
            value={totalRecords}
            subtitle="Inter-institution transactions"
            gradient="linear-gradient(135deg, #7C3AED, #A855F7)"
            glow="rgba(124,58,237,0.20)"
          />

          <StatCard
            icon="fa-chart-column"
            title="Department cost"
            value={`₹${totalDepartmentCost}`}
            subtitle={`${departmentCosts.length} department(s)`}
            gradient="linear-gradient(135deg, #DB2777, #9333EA)"
            glow="rgba(219,39,119,0.18)"
          />
        </div>

        {/* =================================================
            WHAT WE OWE
        ================================================= */}

        <section style={{ marginBottom: "28px" }}>
          <SectionHeader
            icon="fa-credit-card"
            iconBackground="linear-gradient(135deg, #2563EB, #4F46E5)"
            title="What we owe"
            subtitle="Charges generated when your institution uses equipment from another institution"
          />

          {renderTable(weOwe, true)}
        </section>

        {/* =================================================
            DEPARTMENT SUMMARY
        ================================================= */}

        <section style={{ marginBottom: "28px" }}>
          <SectionHeader
            icon="fa-chart-pie"
            iconBackground="linear-gradient(135deg, #7C3AED, #C026D3)"
            title="Department-wise cost allocation"
            subtitle="Understand how equipment usage costs are distributed across departments"
          />

          {renderDepartmentSummary()}
        </section>

        {/* =================================================
            OWED TO US
        ================================================= */}

        <section style={{ marginBottom: "20px" }}>
          <SectionHeader
            icon="fa-hand-holding-dollar"
            iconBackground="linear-gradient(135deg, #059669, #14B8A6)"
            title="What is owed to us"
            subtitle="Charges generated when other institutions use equipment owned by your institution"
          />

         {renderTable(owedToUs, false)}
        </section>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div
          style={{
            marginTop: "22px",
            padding: "16px 20px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background:
              "rgba(8, 27, 51, 0.65)",
            border:
              "1px solid rgba(56,189,248,0.12)",
          }}
        >
          <i
            className="fa-solid fa-circle-info"
            style={{
              color: "#38BDF8",
              fontSize: "16px",
            }}
          />

          <span
            style={{
              color: "#8FAAC5",
              fontSize: "12px",
            }}
          >
            Billing records are generated
            automatically when equipment is
            booked across institutions.
          </span>
        </div>
      </main>
    </div>
  );
}