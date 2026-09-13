import ManagerAnalyticsDashboard from "./ManagerAnalyticsDashboard";
import InstitutionAnalyticsDashboard from "./InstitutionAnalyticsDashboard";
import AnalyticsDashboard from "./AnalyticsDashboard";
import SystemAnalyticsDashboard from "./SystemAnalyticsDashboard";

function RoleBasedAnalyticsDashboard() {
  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch (error) {
    console.error(
      "Unable to read user:",
      error
    );
  }

  const role = String(
    user?.role ||
    user?.user?.role ||
    ""
  ).toUpperCase();

  // Lab Manager and Department Head
  if (
    role === "LAB_MANAGER" ||
    role === "DEPARTMENT_HEAD"
  ) {
    return <ManagerAnalyticsDashboard />;
  }

  // Institution Administrator
  if (
    role === "INSTITUTION_ADMIN"
  ) {
    return (
      <InstitutionAnalyticsDashboard />
    );
  }

  if (
    role === "SYSTEM_ADMIN"
  ) {
    return (
      <SystemAnalyticsDashboard />
    );
  }

  // Researcher dashboard remains untouched.
  return <AnalyticsDashboard />;
}

export default RoleBasedAnalyticsDashboard;