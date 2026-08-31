import { useState } from "react";

function Equipment({ showToast }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const [equipment, setEquipment] = useState([
    {
      id: "EQ001",
      name: "Oscilloscope",
      category: "Electronics",
      department: "ECE",
      location: "Lab 101",
      status: "Available",
    },
    {
      id: "EQ002",
      name: "Digital Multimeter",
      category: "Electronics",
      department: "ECE",
      location: "Lab 102",
      status: "In Use",
    },
    {
      id: "EQ003",
      name: "3D Printer",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Lab 201",
      status: "Available",
    },
    {
      id: "EQ004",
      name: "CNC Machine",
      category: "Manufacturing",
      department: "Mechanical",
      location: "Workshop",
      status: "Maintenance",
    },
    {
      id: "EQ005",
      name: "Spectrometer",
      category: "Optical",
      department: "Physics",
      location: "Lab 301",
      status: "Available",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    department: "",
    location: "",
    status: "Available",
  });

  const available = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const inUse = equipment.filter(
    (item) => item.status === "In Use"
  ).length;

  const maintenance = equipment.filter(
    (item) => item.status === "Maintenance"
  ).length;

  const filteredEquipment = equipment.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.id.toLowerCase().includes(searchText) ||
      item.department.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" || item.category === category;

    const matchesStatus =
      status === "All" || item.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const addEquipment = (e) => {
    e.preventDefault();

    const newEquipment = {
      id: `EQ${String(equipment.length + 1).padStart(3, "0")}`,
      ...form,
    };

    setEquipment([...equipment, newEquipment]);

    if (showToast) {
      showToast(`Equipment "${form.name}" added successfully!`, "success");
    }

    setForm({
      name: "",
      category: "",
      department: "",
      location: "",
      status: "Available",
    });

    setShowAddForm(false);
  };

  const handleView = (item) => {
    if (showToast) {
      showToast(`Viewing details for ${item.name} (${item.id})`, "info");
    }
  };

  const handleEdit = (item) => {
    if (showToast) {
      showToast(`Edit mode opened for ${item.name}`, "info");
    }
  };

  const getStatusStyle = (itemStatus) => {
    if (itemStatus === "Available") {
      return {
        background: "#e8f7ee",
        color: "#16834b",
      };
    }

    if (itemStatus === "In Use") {
      return {
        background: "#fff4df",
        color: "#b56a00",
      };
    }

    return {
      background: "#fdecec",
      color: "#c0392b",
    };
  };

  const page = {
    padding: "30px 34px",
    background: "#f6f8fc",
    minHeight: "100%",
    boxSizing: "border-box",
    color: "#172b4d",
  };

  const card = {
    background: "#ffffff",
    border: "1px solid #e4e8ef",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(20, 40, 70, 0.04)",
  };

  return (
    <div style={page}>

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
            Equipment Inventory
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Manage and monitor laboratory equipment
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
          + Add Equipment
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
          title="Total Equipment"
          value={equipment.length}
          iconBackground="#eaf2ff"
          iconColor="#2563eb"
        />

        <StatCard
          icon="✓"
          title="Available"
          value={available}
          iconBackground="#e9f8ef"
          iconColor="#16834b"
        />

        <StatCard
          icon="●"
          title="In Use"
          value={inUse}
          iconBackground="#fff4df"
          iconColor="#b56a00"
        />

        <StatCard
          icon="⚙"
          title="Maintenance"
          value={maintenance}
          iconBackground="#fdecec"
          iconColor="#c0392b"
        />

      </div>


      {/* INVENTORY TABLE */}
      <div style={card}>

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
              boxSizing: "border-box",
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
              placeholder="Search equipment..."
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
                color: "#334155",
              }}
            />
          </div>


          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Optical">Optical</option>
          </select>


          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
          </select>

        </div>


        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "850px",
            }}
          >

            <thead>

              <tr style={{ background: "#f8fafc" }}>

                <TableHeader>ID</TableHeader>
                <TableHeader>Equipment</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Location</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>

              </tr>

            </thead>


            <tbody>

              {filteredEquipment.map((item) => (

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
                        {item.name.charAt(0)}
                      </div>

                      <span
                        style={{
                          fontWeight: 600,
                          color: "#24344d",
                        }}
                      >
                        {item.name}
                      </span>

                    </div>

                  </td>


                  {/* CATEGORY */}
                  <td style={tdStyle}>

                    <span
                      style={{
                        background: "#f1f4f8",
                        color: "#596579",
                        padding: "5px 9px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </span>

                  </td>


                  {/* DEPARTMENT */}
                  <td style={tdStyle}>
                    {item.department}
                  </td>


                  {/* LOCATION */}
                  <td style={tdStyle}>
                    {item.location}
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

                      <button style={viewButton} onClick={() => handleView(item)}>
                        View
                      </button>

                      <button style={editButton} onClick={() => handleEdit(item)}>
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
          Showing {filteredEquipment.length} of {equipment.length} equipment
        </div>

      </div>


      {/* ADD EQUIPMENT MODAL */}

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
              width: "600px",
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
                alignItems: "flex-start",
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
                  Add Equipment
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#718096",
                  }}
                >
                  Add a new laboratory resource
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

            <form onSubmit={addEquipment}>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "17px",
                }}
              >

                <FormInput
                  label="Equipment Name"
                  placeholder="e.g. Oscilloscope"
                  value={form.name}
                  onChange={(value) =>
                    setForm({ ...form, name: value })
                  }
                />


                <FormSelect
                  label="Category"
                  value={form.category}
                  onChange={(value) =>
                    setForm({ ...form, category: value })
                  }
                  options={[
                    "Electronics",
                    "Manufacturing",
                    "Optical",
                  ]}
                />


                <FormInput
                  label="Department"
                  placeholder="e.g. ECE"
                  value={form.department}
                  onChange={(value) =>
                    setForm({ ...form, department: value })
                  }
                />


                <FormInput
                  label="Location"
                  placeholder="e.g. Lab 101"
                  value={form.location}
                  onChange={(value) =>
                    setForm({ ...form, location: value })
                  }
                />


                <FormSelect
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    setForm({ ...form, status: value })
                  }
                  options={[
                    "Available",
                    "In Use",
                    "Maintenance",
                  ]}
                />

              </div>


              {/* FORM BUTTONS */}

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
                  Add Equipment
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
  iconBackground,
  iconColor,
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
          background: iconBackground,
          color: iconColor,
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

      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155",
        }}
      >
        {label}
      </label>

      <input
        type="text"
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: "40px",
          boxSizing: "border-box",
          border: "1px solid #d8dee8",
          borderRadius: "6px",
          padding: "0 10px",
          fontSize: "13px",
          outline: "none",
        }}
      />

    </div>
  );
}


function FormSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155",
        }}
      >
        {label}
      </label>

      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
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
        }}
      >

        <option value="">Select {label.toLowerCase()}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


const selectStyle = {
  height: "40px",
  minWidth: "150px",
  border: "1px solid #d9dfe8",
  borderRadius: "7px",
  padding: "0 10px",
  background: "white",
  color: "#475569",
  fontSize: "13px",
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

export default Equipment;