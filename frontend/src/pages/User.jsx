import { useEffect, useState } from "react";

function User() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("http://localhost:8080/api/users", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("User error:", error);
        setLoading(false);
      });

  }, []);


  if (loading) {
    return <h2>Loading users...</h2>;
  }


  return (
    <div style={{ padding: "20px" }}>

      <h2>User Management</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >

        <thead>
          <tr>
            <th style={cellStyle}>ID</th>
            <th style={cellStyle}>Name</th>
            <th style={cellStyle}>Email</th>
            <th style={cellStyle}>Phone</th>
            <th style={cellStyle}>Role</th>
            <th style={cellStyle}>Department</th>
            <th style={cellStyle}>Status</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user) => (

            <tr key={user.userId}>

              <td style={cellStyle}>
                {user.userId}
              </td>

              <td style={cellStyle}>
                {user.fullName}
              </td>

              <td style={cellStyle}>
                {user.email}
              </td>

              <td style={cellStyle}>
                {user.phone}
              </td>

              <td style={cellStyle}>
                {user.role?.roleName || "N/A"}
              </td>

              <td style={cellStyle}>
                {user.department?.departmentName || "N/A"}
              </td>

              <td style={cellStyle}>
                {user.status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}


const cellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};


export default User;
