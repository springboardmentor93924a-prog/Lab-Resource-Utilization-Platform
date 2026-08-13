import { useState } from "react";

function Departments() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [institution, setInstitution] = useState("All");

  const [departments, setDepartments] = useState([
    {
      id: "DEP001",
      name: "Computer Science",
      institution: "Mysore University",
      head: "Dr. Ravi Kumar",
      equipment: 18,
      status: "Active",
    },
    {
      id: "DEP002",
      name: "Electronics & Communication",
      institution: "Mysore University",
      head: "Dr. Priya Sharma",
      equipment: 24,
      status: "Active",
    },
    {
      id: "DEP003",
      name: "Mechanical Engineering",
      institution: "Mysore Institute",
      head: "Dr. Arun Kumar",
      equipment: 16,
      status: "Active",
    },
    {
      id: "DEP004",
      name: "Physics",
      institution: "Mysore Institute",
      head: "Dr. Meena Rao",
      equipment: 12,
      status: "Active",
    },
    {
      id: "DEP005",
      name: "Chemistry",
      institution: "Mysore University",
      head: "Dr. Suresh Bhat",
      equipment: 10,
      status: "Inactive",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    institution: "",
    head: "",
    equipment: "",
    status: "Active",
  });

  const activeDepartments = departments.filter(
    (item) => item.status === "Active"
  ).length;

  const inactiveDepartments = departments.filter(
    (item) => item.status === "Inactive"
  ).length;

  const institutions = [
    ...new Set(departments.map((item) => item.institution)),
  ];

  const filteredDepartments = departments.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.id.toLowerCase().includes(searchText) ||
      item.head.toLowerCase().includes(searchText);

    const matchesInstitution =
      institution === "All" ||
      item.institution === institution;

    return matchesSearch && matchesInstitution;
  });

  const addDepartment = (e) => {
    e.preventDefault();

    const newDepartment = {
      id: `DEP${String(departments.length + 1).padStart(3, "0")}`,
      name: form.name,
      institution: form.institution,
      head: form.head,
      equipment: Number(form.equipment) || 0,
      status: form.status,
    };

    setDepartments([...departments, newDepartment]);

    setForm({
      name: "",
      institution: "",
      head: "",
      equipment: "",
      status: "Active",
    });

    setShowAddForm(false);
  };

  const getStatusStyle = (status) => {
    if (status === "Active") {
      return {
        background: "#e8f7ee",
        color: "#16834b",
      };
    }

    return {
      background: "#fdecec",
      color: "#c0392b",
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
            Departments
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Manage and monitor departments across institutions
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
          + Add Department
        </button>
      </div>


      {/* STATISTICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >

        <StatCard
          icon="▣"
          title="Total Departments"
          value={departments.length}
          background="#eaf2ff"
          color="#2563eb"
        />

        <StatCard
          icon="✓"
          title="Active Departments"
          value={activeDepartments}
          background="#e9f8ef"
          color="#16834b"
        />

        <StatCard
          icon="●"
          title="Inactive Departments"
          value={inactiveDepartments}
          background="#fdecec"
          color="#c0392b"
        />

      </div>


      {/* TABLE CARD */}

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
              placeholder="Search departments..."
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13px",
              }}
            />
          </div>


          <select
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            style={{
              height: "40px",
              minWidth: "190px",
              border: "1px solid #d9dfe8",
              borderRadius: "7px",
              padding: "0 10px",
              background: "white",
              color: "#475569",
              fontSize: "13px",
              outline: "none",
            }}
          >
            <option value="All">All Institutions</option>

            {institutions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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
                <TableHeader>Department</TableHeader>
                <TableHeader>Institution</TableHeader>
                <TableHeader>Department Head</TableHeader>
                <TableHeader>Equipment</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>

              </tr>

            </thead>


            <tbody>

              {filteredDepartments.map((item) => (

                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #edf0f4",
                  }}
                >

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


                  <td style={tdStyle}>
                    {item.institution}
                  </td>


                  <td style={tdStyle}>
                    {item.head}
                  </td>


                  <td style={tdStyle}>

                    <span
                      style={{
                        background: "#f1f4f8",
                        color: "#596579",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {item.equipment} items
                    </span>

                  </td>


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
          Showing {filteredDepartments.length} of{" "}
          {departments.length} departments
        </div>

      </div>


      {/* ADD DEPARTMENT MODAL */}

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
                  Add Department
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#718096",
                  }}
                >
                  Add a new department
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


            <form onSubmit={addDepartment}>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "17px",
                }}
              >

                <FormInput
                  label="Department Name"
                  placeholder="e.g. Computer Science"
                  value={form.name}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      name: value,
                    })
                  }
                />


                <FormInput
                  label="Institution"
                  placeholder="e.g. Mysore University"
                  value={form.institution}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      institution: value,
                    })
                  }
                />


                <FormInput
                  label="Department Head"
                  placeholder="e.g. Dr. Ravi Kumar"
                  value={form.head}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      head: value,
                    })
                  }
                />


                <FormInput
                  label="Equipment Count"
                  placeholder="e.g. 15"
                  value={form.equipment}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      equipment: value,
                    })
                  }
                />


                <FormSelect
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      status: value,
                    })
                  }
                  options={[
                    "Active",
                    "Inactive",
                  ]}
                />

              </div>


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
                  Add Department
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


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
        }}
      >

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


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

export default Departments;