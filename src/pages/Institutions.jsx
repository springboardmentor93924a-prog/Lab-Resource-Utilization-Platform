function Institutions() {
  const institution = {
    id: "INS001",
    name: "Lab Resource Institution",
    type: "Educational Institution",
    address: "Mysuru, Karnataka",
    contactEmail: "admin@labresource.com",
    contactPhone: "+91 9876543210",
    departments: 4,
    equipment: 25,
    users: 6,
  };

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

      <div style={{ marginBottom: "26px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            color: "#172b4d",
          }}
        >
          Institution
        </h1>

        <p
          style={{
            margin: "7px 0 0",
            fontSize: "14px",
            color: "#718096",
          }}
        >
          Manage your institution information
        </p>
      </div>

      {/* MAIN CARD */}

      <div
        style={{
          background: "white",
          border: "1px solid #e4e8ef",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
          marginBottom: "20px",
        }}
      >
        {/* INSTITUTION HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            paddingBottom: "24px",
            borderBottom: "1px solid #edf0f4",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "12px",
              background: "#eaf2ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "25px",
              fontWeight: 700,
            }}
          >
            I
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "21px",
                color: "#24344d",
              }}
            >
              {institution.name}
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: "12px",
                color: "#8792a3",
              }}
            >
              Institution ID: {institution.id}
            </p>
          </div>

          <span
            style={{
              marginLeft: "auto",
              background: "#e8f7ee",
              color: "#16834b",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            Active
          </span>
        </div>

        {/* DETAILS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            paddingTop: "25px",
          }}
        >
          <InfoItem
            label="Institution Type"
            value={institution.type}
          />

          <InfoItem
            label="Address"
            value={institution.address}
          />

          <InfoItem
            label="Contact Email"
            value={institution.contactEmail}
          />

          <InfoItem
            label="Contact Phone"
            value={institution.contactPhone}
          />
        </div>
      </div>

      {/* STATISTICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        <StatCard
          title="Departments"
          value={institution.departments}
          icon="▣"
          background="#eaf2ff"
          color="#2563eb"
        />

        <StatCard
          title="Equipment"
          value={institution.equipment}
          icon="⚙"
          background="#eee9ff"
          color="#6941c6"
        />

        <StatCard
          title="Users"
          value={institution.users}
          icon="●"
          background="#e9f8ef"
          color="#16834b"
        />
      </div>
    </div>
  );
}


/* =========================
   INFORMATION ITEM
========================= */

function InfoItem({ label, value }) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: "11px",
          color: "#8792a3",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#334155",
          fontWeight: 500,
        }}
      >
        {value}
      </p>
    </div>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  title,
  value,
  icon,
  background,
  color,
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e4e8ef",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "9px",
          background,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "12px",
            color: "#718096",
          }}
        >
          {title}
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: "23px",
            color: "#172b4d",
          }}
        >
          {value}
        </h2>
      </div>
    </div>
  );
}

export default Institutions;