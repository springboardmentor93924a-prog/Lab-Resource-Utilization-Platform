import { useState } from "react";

function Bookings() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      equipment: "Oscilloscope",
      requestedBy: "Rahul Kumar",
      department: "ECE",
      date: "12 Aug 2026",
      time: "10:00 AM - 12:00 PM",
      status: "Approved",
    },
    {
      id: "BK002",
      equipment: "Digital Multimeter",
      requestedBy: "Priya Sharma",
      department: "ECE",
      date: "13 Aug 2026",
      time: "02:00 PM - 03:00 PM",
      status: "Pending",
    },
    {
      id: "BK003",
      equipment: "3D Printer",
      requestedBy: "Arun Kumar",
      department: "Mechanical",
      date: "14 Aug 2026",
      time: "11:00 AM - 01:00 PM",
      status: "Approved",
    },
    {
      id: "BK004",
      equipment: "Spectrometer",
      requestedBy: "Meena Rao",
      department: "Physics",
      date: "15 Aug 2026",
      time: "09:00 AM - 11:00 AM",
      status: "Completed",
    },
    {
      id: "BK005",
      equipment: "CNC Machine",
      requestedBy: "Suresh Bhat",
      department: "Mechanical",
      date: "16 Aug 2026",
      time: "03:00 PM - 05:00 PM",
      status: "Pending",
    },
  ]);

  const [form, setForm] = useState({
    equipment: "",
    requestedBy: "",
    department: "",
    date: "",
    time: "",
    status: "Pending",
  });

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedBookings = bookings.filter(
    (item) => item.status === "Approved"
  ).length;

  const completedBookings = bookings.filter(
    (item) => item.status === "Completed"
  ).length;

  const filteredBookings = bookings.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.id.toLowerCase().includes(searchText) ||
      item.equipment.toLowerCase().includes(searchText) ||
      item.requestedBy.toLowerCase().includes(searchText) ||
      item.department.toLowerCase().includes(searchText);

    const matchesStatus =
      status === "All" || item.status === status;

    return matchesSearch && matchesStatus;
  });

  const addBooking = (e) => {
    e.preventDefault();

    const newBooking = {
      id: `BK${String(bookings.length + 1).padStart(3, "0")}`,
      equipment: form.equipment,
      requestedBy: form.requestedBy,
      department: form.department,
      date: form.date,
      time: form.time,
      status: form.status,
    };

    setBookings([...bookings, newBooking]);

    setForm({
      equipment: "",
      requestedBy: "",
      department: "",
      date: "",
      time: "",
      status: "Pending",
    });

    setShowAddForm(false);
  };

  const getStatusStyle = (itemStatus) => {
    if (itemStatus === "Approved") {
      return {
        background: "#e8f7ee",
        color: "#16834b",
      };
    }

    if (itemStatus === "Pending") {
      return {
        background: "#fff4df",
        color: "#b56a00",
      };
    }

    return {
      background: "#eaf2ff",
      color: "#2563eb",
    };
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
            Bookings
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Manage laboratory equipment bookings and reservations
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          style={{
            border: "none",
            background: "#2563eb",
            color: "white",
            padding: "11px 18px",
            borderRadius: "7px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New Booking
        </button>
      </div>


      {/* STATISTICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >

        <StatCard
          icon="▣"
          title="Total Bookings"
          value={totalBookings}
          background="#eaf2ff"
          color="#2563eb"
        />

        <StatCard
          icon="◷"
          title="Pending"
          value={pendingBookings}
          background="#fff4df"
          color="#b56a00"
        />

        <StatCard
          icon="✓"
          title="Approved"
          value={approvedBookings}
          background="#e9f8ef"
          color="#16834b"
        />

        <StatCard
          icon="●"
          title="Completed"
          value={completedBookings}
          background="#edf0f5"
          color="#64748b"
        />

      </div>


      {/* MAIN CARD */}

      <div
        style={{
          background: "white",
          border: "1px solid #e4e8ef",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
          overflow: "hidden",
        }}
      >

        {/* FILTER BAR */}

        <div
          style={{
            padding: "17px 20px",
            borderBottom: "1px solid #e8ecf2",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >

          <div
            style={{
              flex: 1,
              height: "40px",
              border: "1px solid #d9dfe8",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
            }}
          >

            <span
              style={{
                color: "#8b96a8",
                fontSize: "18px",
                marginRight: "8px",
              }}
            >
              ⌕
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
              }}
            />

          </div>


          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              height: "40px",
              minWidth: "150px",
              border: "1px solid #d9dfe8",
              borderRadius: "7px",
              padding: "0 10px",
              background: "white",
              color: "#475569",
              fontSize: "13px",
              outline: "none",
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </select>

        </div>


        {/* TABLE */}

        <div style={{ overflowX: "auto" }}>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1050px",
            }}
          >

            <thead>

              <tr style={{ background: "#f8fafc" }}>

                <TableHeader>ID</TableHeader>
                <TableHeader>Equipment</TableHeader>
                <TableHeader>Requested By</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Time</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>

              </tr>

            </thead>


            <tbody>

              {filteredBookings.map((item) => (

                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #edf0f4",
                  }}
                >

                  {/* ID */}

                  <td style={tdStyle}>
                    <span
                      style={{
                        color: "#718096",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {item.id}
                    </span>
                  </td>


                  {/* EQUIPMENT */}

                  <td style={tdStyle}>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >

                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "8px",
                          background: "#edf4ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {item.equipment.charAt(0)}
                      </div>

                      <span
                        style={{
                          fontWeight: 600,
                          color: "#24344d",
                        }}
                      >
                        {item.equipment}
                      </span>

                    </div>

                  </td>


                  {/* REQUESTED BY */}

                  <td style={tdStyle}>
                    {item.requestedBy}
                  </td>


                  {/* DEPARTMENT */}

                  <td style={tdStyle}>
                    {item.department}
                  </td>


                  {/* DATE */}

                  <td style={tdStyle}>
                    {item.date}
                  </td>


                  {/* TIME */}

                  <td style={tdStyle}>
                    {item.time}
                  </td>


                  {/* STATUS */}

                  <td style={tdStyle}>

                    <span
                      style={{
                        ...getStatusStyle(item.status),
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >

                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "currentColor",
                        }}
                      />

                      {item.status}

                    </span>

                  </td>


                  {/* ACTIONS */}

                  <td style={tdStyle}>

                    <div
                      style={{
                        display: "flex",
                        gap: "7px",
                      }}
                    >

                      <button style={viewButton}>
                        View
                      </button>

                      <button style={editButton}>
                        Edit
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div
          style={{
            padding: "13px 20px",
            background: "#fafbfc",
            color: "#8792a3",
            fontSize: "11px",
            borderTop: "1px solid #edf0f4",
          }}
        >
          Showing {filteredBookings.length} of{" "}
          {bookings.length} bookings
        </div>

      </div>


      {/* NEW BOOKING MODAL */}

      {showAddForm && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >

          <div
            style={{
              width: "620px",
              maxWidth: "90%",
              background: "white",
              borderRadius: "12px",
              padding: "25px",
              boxSizing: "border-box",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#172b4d",
                  }}
                >
                  New Booking
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#718096",
                  }}
                >
                  Create a new equipment booking request
                </p>

              </div>

              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  border: "none",
                  background: "#f1f4f8",
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  fontSize: "19px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form onSubmit={addBooking}>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "17px",
                }}
              >

                <FormInput
                  label="Equipment"
                  placeholder="e.g. Oscilloscope"
                  value={form.equipment}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      equipment: value,
                    })
                  }
                />


                <FormInput
                  label="Requested By"
                  placeholder="e.g. Rahul Kumar"
                  value={form.requestedBy}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      requestedBy: value,
                    })
                  }
                />


                <FormInput
                  label="Department"
                  placeholder="e.g. ECE"
                  value={form.department}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      department: value,
                    })
                  }
                />


                <div>

                  <label style={labelStyle}>
                    Date
                  </label>

                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />

                </div>


                <FormInput
                  label="Time"
                  placeholder="e.g. 10:00 AM - 12:00 PM"
                  value={form.time}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      time: value,
                    })
                  }
                />


                <div>

                  <label style={labelStyle}>
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Approved">
                      Approved
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

              </div>


              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "9px",
                  marginTop: "25px",
                }}
              >

                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "6px",
                    border: "1px solid #d8dee8",
                    background: "white",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "9px 17px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create Booking
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================
   SMALL COMPONENTS
========================= */

function StatCard({
  icon,
  title,
  value,
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


function TableHeader({ children }) {
  return (
    <th
      style={{
        padding: "13px 16px",
        textAlign: "left",
        color: "#64748b",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}


function FormInput({
  label,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>

      <label style={labelStyle}>
        {label}
      </label>

      <input
        type="text"
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />

    </div>
  );
}


/* =========================
   STYLES
========================= */

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: "40px",
  boxSizing: "border-box",
  border: "1px solid #d8dee8",
  borderRadius: "6px",
  padding: "0 10px",
  fontSize: "13px",
  background: "white",
  color: "#334155",
  outline: "none",
};

const tdStyle = {
  padding: "14px 16px",
  color: "#475569",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const viewButton = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#2563eb",
  padding: "5px 10px",
  borderRadius: "5px",
  fontSize: "11px",
  cursor: "pointer",
};

const editButton = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#64748b",
  padding: "5px 10px",
  borderRadius: "5px",
  fontSize: "11px",
  cursor: "pointer",
};

export default Bookings;