import { useState } from "react";

function Reports() {
  const [reportType, setReportType] = useState("Overview");

  const equipmentStats = {
    total: 5,
    available: 3,
    inUse: 1,
    maintenance: 1,
  };

  const bookingStats = {
    total: 5,
    pending: 2,
    approved: 2,
    completed: 1,
  };

  const userStats = {
    total: 6,
    active: 6,
  };

  const utilization =
    Math.round(
      ((equipmentStats.inUse + equipmentStats.maintenance) /
        equipmentStats.total) *
        100
    );

  return (
    <div
      style={{
        padding: "30px 34px",
        background: "#f6f8fc",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "26px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              color: "#172b4d",
            }}
          >
            Reports & Analytics
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Monitor laboratory resources, bookings and platform activity
          </p>
        </div>

        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={{
            height: "40px",
            minWidth: "150px",
            border: "1px solid #d9dfe8",
            borderRadius: "7px",
            padding: "0 12px",
            background: "white",
            color: "#475569",
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option>Overview</option>
          <option>Equipment</option>
          <option>Bookings</option>
          <option>Users</option>
        </select>
      </div>

      {/* SUMMARY CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <SummaryCard
          icon="▣"
          title="Total Equipment"
          value={equipmentStats.total}
          subtitle={`${equipmentStats.available} currently available`}
          background="#eaf2ff"
          color="#2563eb"
        />

        <SummaryCard
          icon="◷"
          title="Total Bookings"
          value={bookingStats.total}
          subtitle={`${bookingStats.pending} awaiting approval`}
          background="#fff4df"
          color="#b56a00"
        />

        <SummaryCard
          icon="●"
          title="Total Users"
          value={userStats.total}
          subtitle={`${userStats.active} active users`}
          background="#e9f8ef"
          color="#16834b"
        />

        <SummaryCard
          icon="↗"
          title="Utilization"
          value={`${utilization}%`}
          subtitle="Current resource usage"
          background="#eee9ff"
          color="#6941c6"
        />
      </div>

      {/* REPORT GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* EQUIPMENT REPORT */}

        <ReportCard
          title="Equipment Overview"
          description="Current laboratory equipment status"
        >
          <StatusRow
            label="Available"
            value={equipmentStats.available}
            total={equipmentStats.total}
            color="#16834b"
          />

          <StatusRow
            label="In Use"
            value={equipmentStats.inUse}
            total={equipmentStats.total}
            color="#2563eb"
          />

          <StatusRow
            label="Maintenance"
            value={equipmentStats.maintenance}
            total={equipmentStats.total}
            color="#b56a00"
          />
        </ReportCard>

        {/* BOOKING REPORT */}

        <ReportCard
          title="Booking Overview"
          description="Current booking request status"
        >
          <StatusRow
            label="Approved"
            value={bookingStats.approved}
            total={bookingStats.total}
            color="#16834b"
          />

          <StatusRow
            label="Pending"
            value={bookingStats.pending}
            total={bookingStats.total}
            color="#b56a00"
          />

          <StatusRow
            label="Completed"
            value={bookingStats.completed}
            total={bookingStats.total}
            color="#2563eb"
          />
        </ReportCard>
      </div>

      {/* UTILIZATION CARD */}

      <div
        style={{
          background: "white",
          border: "1px solid #e4e8ef",
          borderRadius: "12px",
          padding: "22px",
          boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                color: "#24344d",
              }}
            >
              Resource Utilization
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "12px",
                color: "#8792a3",
              }}
            >
              Overview of laboratory resource usage
            </p>
          </div>

          <strong
            style={{
              fontSize: "24px",
              color: "#2563eb",
            }}
          >
            {utilization}%
          </strong>
        </div>

        <div
          style={{
            height: "12px",
            background: "#edf1f6",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${utilization}%`,
              height: "100%",
              background: "#2563eb",
              borderRadius: "20px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
            fontSize: "11px",
            color: "#8792a3",
          }}
        >
          <span>0% Usage</span>
          <span>100% Usage</span>
        </div>
      </div>

      {/* USER ROLE DISTRIBUTION */}

      <div
        style={{
          background: "white",
          border: "1px solid #e4e8ef",
          borderRadius: "12px",
          padding: "22px",
          boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "17px",
              color: "#24344d",
            }}
          >
            Platform Roles
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: "12px",
              color: "#8792a3",
            }}
          >
            Users across the six supported platform roles
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          <RoleCard
            role="System Admin"
            count="1"
            color="#6941c6"
          />

          <RoleCard
            role="Institution Admin"
            count="1"
            color="#2563eb"
          />

          <RoleCard
            role="Department Head"
            count="1"
            color="#16834b"
          />

          <RoleCard
            role="Lab Manager"
            count="1"
            color="#b56a00"
          />

          <RoleCard
            role="Lab Technician"
            count="1"
            color="#c0392b"
          />

          <RoleCard
            role="Researcher"
            count="1"
            color="#596579"
          />
        </div>
      </div>
    </div>
  );
}


/* =========================
   COMPONENTS
========================= */

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  background,
  color,
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e4e8ef",
        borderRadius: "12px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "9px",
          background,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "17px",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            margin: "0 0 4px",
            color: "#718096",
            fontSize: "12px",
          }}
        >
          {title}
        </p>

        <h2
          style={{
            margin: "0 0 3px",
            fontSize: "23px",
            color: "#172b4d",
          }}
        >
          {value}
        </h2>

        <p
          style={{
            margin: 0,
            color: "#8792a3",
            fontSize: "10px",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}


function ReportCard({
  title,
  description,
  children,
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e4e8ef",
        borderRadius: "12px",
        padding: "22px",
        boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "17px",
            color: "#24344d",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            fontSize: "12px",
            color: "#8792a3",
          }}
        >
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}


function StatusRow({
  label,
  value,
  total,
  color,
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round((value / total) * 100);

  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "7px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "#475569",
            fontWeight: 600,
          }}
        >
          {label}
        </span>

        <span
          style={{
            fontSize: "11px",
            color: "#8792a3",
          }}
        >
          {value} ({percentage}%)
        </span>
      </div>

      <div
        style={{
          height: "8px",
          background: "#edf1f6",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: color,
            borderRadius: "20px",
          }}
        />
      </div>
    </div>
  );
}


function RoleCard({
  role,
  count,
  color,
}) {
  return (
    <div
      style={{
        border: "1px solid #e6eaf0",
        borderRadius: "9px",
        padding: "14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            background: `${color}18`,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {role.charAt(0)}
        </div>

        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          {role}
        </span>
      </div>

      <strong
        style={{
          fontSize: "16px",
          color: "#24344d",
        }}
      >
        {count}
      </strong>
    </div>
  );
}

export default Reports;