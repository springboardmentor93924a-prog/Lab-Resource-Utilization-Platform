import { Logo } from "./Logo.jsx";

function LogOutIcon() {
  // Small inline icon to avoid an extra import cycle; mirrors lucide LogOut.
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Left navigation sidebar — role nav items + user info + logout      */
/*  (extracted from the combined DashboardShell layout component)      */
/* ------------------------------------------------------------------ */
export function Sidebar({ navItems, activeView, setActiveView, onLogout, roleLabel, roleTag, userName, notifCount = 0, mobileNavOpen, closeMobileNav }) {
  return (
    <aside
      className={`fixed lg:static z-40 top-14 lg:top-0 left-0 h-[calc(100vh-3.5rem)] lg:h-screen w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ${
        mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } lg:sticky lg:top-0`}
    >
      <div className="hidden lg:flex items-center h-16 px-5 border-b border-slate-800">
        <Logo dark />
      </div>

      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{roleTag}</p>
        <p className="text-sm font-bold text-white mt-0.5 truncate">{userName}</p>
        <p className="text-xs text-slate-400">{roleLabel}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); closeMobileNav(); }}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative ${
              activeView === item.id
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon size={17} />
            {item.label}
            {item.id === "notifications" && notifCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                {notifCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOutIcon /> Logout
        </button>
      </div>
    </aside>
  );
}
