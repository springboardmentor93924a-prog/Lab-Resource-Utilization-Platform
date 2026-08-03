 export default function Navbar() {
  // Retrieve the user role from local storage to display if needed
  const userRole = localStorage.getItem("role");

  return (
    <nav
      style={{
        height: "60px",
        background: "#1976d2",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        fontSize: "22px",
        fontWeight: "bold",
      }}
    >
      <span>Lab Resource Utilization Platform</span>
      
      {/* Display current role badge on the right side of the navbar */}
      {userRole && (
        <span style={{ fontSize: "14px", background: "rgba(255,255,255,0.2)", padding: "5px 10px", borderRadius: "4px" }}>
          Role: {userRole}
        </span>
      )}
    </nav>
  );
}