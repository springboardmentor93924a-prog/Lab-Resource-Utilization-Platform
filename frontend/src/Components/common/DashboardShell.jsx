import { useState } from "react";
import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";

/* ------------------------------------------------------------------ */
/*  Generic dashboard shell: Navbar (mobile) + Sidebar + content area  */
/*  Used by every role dashboard (Researcher, Technician, Manager,     */
/*  Department Head, Institution Admin) so the layout only lives once. */
/* ------------------------------------------------------------------ */
export function DashboardShell({ navItems, activeView, setActiveView, onLogout, roleLabel, roleTag, userName, children, notifCount = 0 }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar mobileNavOpen={mobileNavOpen} onToggle={() => setMobileNavOpen((v) => !v)} />

      <Sidebar
        navItems={navItems}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={onLogout}
        roleLabel={roleLabel}
        roleTag={roleTag}
        userName={userName}
        notifCount={notifCount}
        mobileNavOpen={mobileNavOpen}
        closeMobileNav={() => setMobileNavOpen(false)}
      />

      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 top-14 bg-slate-900/40 z-30"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
