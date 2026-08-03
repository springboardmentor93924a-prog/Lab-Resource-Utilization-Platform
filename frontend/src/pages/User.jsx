 import { useState, useEffect } from "react";
import axios from "axios";

export default function User() {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Fetch user data based on the role stored in local storage
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (userRole === "ROLE_ADMIN") {
          // If the user is an admin, fetch the list of all registered users
          const response = await axios.get("http://localhost:8080/api/users", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAllUsers(response.data);
        } else {
          // If the user is a student or normal user, fetch only their personal profile
          const response = await axios.get("http://localhost:8080/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserData();
  }, [userRole]);

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>User Management / Profile</h2>

      {/* Admin View: Show list of all users */}
      {userRole === "ROLE_ADMIN" && (
        <div>
          <h3>All Registered Users (Admin View)</h3>
          <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student View: Show personal profile */}
      {userRole === "ROLE_STUDENT" && (
        <div style={{ background: "#f4f4f4", padding: "15px", borderRadius: "5px", marginTop: "15px" }}>
          <h3>My Profile</h3>
          {userData ? (
            <div>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Role:</strong> {userData.role}</p>
              <p><strong>Email:</strong> {userData.email || "N/A"}</p>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      )}
    </div>
  );
}