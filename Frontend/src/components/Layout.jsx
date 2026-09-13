import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  return (
    <div className="app-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="main-area">

        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default Layout;