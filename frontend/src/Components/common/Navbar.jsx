import { X } from "lucide-react";
import { Logo } from "./Logo.jsx";

/* ------------------------------------------------------------------ */
/*  Mobile top bar shown above the Sidebar on small screens             */
/*  (extracted from the combined DashboardShell layout component)      */
/* ------------------------------------------------------------------ */
export function Navbar({ mobileNavOpen, onToggle }) {
  return (
    <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4">
      <Logo />
      <button onClick={onToggle} className="text-slate-700" aria-label="Toggle navigation">
        {mobileNavOpen ? <X size={22} /> : <span className="text-xl leading-none">≡</span>}
      </button>
    </div>
  );
}
