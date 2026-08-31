import Sidebar from "./Sidebar";

function DashboardLayout({
  children,
  role,
  currentPage,
  setPage,
  onLogout
}) {
  return (
    <div className="dashboard-layout">

      <Sidebar
        currentPage={currentPage}
        setPage={setPage}
        role={role}
        onLogout={onLogout}
      />

      <main className="dashboard-main">
        {children}
      </main>

    </div>
  );
}

export default DashboardLayout;