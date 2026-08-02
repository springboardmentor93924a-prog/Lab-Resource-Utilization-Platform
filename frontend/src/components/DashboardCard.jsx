import "./../styles/dashboard.css";

function DashboardCard({ title, value }) {
  return (
    <div className="dashboard-card">

      <h3>{title}</h3>

      <h1>{value}</h1>

    </div>
  );
}

export default DashboardCard;