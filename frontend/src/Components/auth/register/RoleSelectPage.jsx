import { Microscope, Wrench, BarChart3, Building2, Landmark, Settings, HelpCircle, FileText } from "lucide-react";
import { Logo } from "../../common/Logo.jsx";

const ROLES = [
  {
    id: "researcher",
    label: "Researcher / Student",
    desc: "Search equipment and manage bookings.",
    icon: Microscope,
    flow: "register",
  },
  {
    id: "technician",
    label: "Lab Technician",
    desc: "Manage work orders and maintenance.",
    icon: Wrench,
    flow: "login",
  },
  {
    id: "manager",
    label: "Lab Manager",
    desc: "Manage equipment and utilization.",
    icon: BarChart3,
    flow: "login",
  },
  {
    id: "department-head",
    label: "Department Head",
    desc: "Analyze department data.",
    icon: Building2,
    flow: "login",
  },
  {
    id: "institution-admin",
    label: "Institution Administrator",
    desc: "Manage resources and users.",
    icon: Landmark,
    flow: "register-admin",
  },
  {
    id: "system-admin",
    label: "System Administrator",
    desc: "Manage roles, permissions and audit logs.",
    icon: Settings,
    flow: "login",
  },
];

export default 
function RoleSelectPage({ goTo, selectRole, toast, openModal }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo onClick={() => goTo("landing")} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal("help")}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              <HelpCircle size={16} /> Help Center
            </button>
            <button
              onClick={() => openModal("terms")}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              <FileText size={16} /> Terms of Service
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-5 sm:px-8 py-14 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Select Your Role</h1>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Choose the role that best describes your position to access the appropriate
            laboratory management tools and resources.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                selectRole(role);
                if (role.id === "system-admin") {
                  toast("System Administrator accounts are provisioned by IT. Redirecting to login.", "info");
                  goTo("login");
                } else if (role.id === "technician" || role.id === "manager" || role.id === "department-head" || role.flow === "login") {
                  toast(`${role.label} accounts are created by your Institution Admin via invitation. Redirecting to sign in.`, "info");
                  goTo("login");
                } else if (role.flow === "register-admin") {
                  goTo("register-admin");
                } else {
                  goTo("register");
                }
              }}
              className="text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <role.icon size={20} />
              </span>
              <h3 className="text-base font-bold text-slate-900">{role.label}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{role.desc}</p>
            </button>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> SYSTEM STATUS: OPTIMAL
          </span>
          <span>© 2026 LabFlow Pro</span>
          <div className="flex gap-4">
            <button onClick={() => openModal("privacy")} className="hover:text-blue-600">Privacy Policy</button>
            <button onClick={() => openModal("help")} className="hover:text-blue-600">Contact Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
