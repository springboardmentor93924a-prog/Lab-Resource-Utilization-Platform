import ReportsContainer from "../../reports/ReportsContainer.jsx";

export default function Reports({ user, toast }) {
  return <ReportsContainer user={user} role="LAB_MANAGER" toast={toast} />;
}
