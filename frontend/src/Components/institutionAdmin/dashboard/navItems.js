import { LayoutDashboard, Share2, Users, Gauge, Receipt, ScrollText, UserRound, Package, GraduationCap, FileText } from "lucide-react";

/* ================================================================== */
/*  Institution Admin -> Dashboard -> Sidebar nav items                 */
/* ================================================================== */
export const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Student Applications", icon: GraduationCap },
  { id: "network", label: "Institution Equipment Network", icon: Package },
  { id: "sharing", label: "Cross-Institution Sharing", icon: Share2 },
  { id: "users", label: "User Management", icon: Users },
  { id: "reports", label: "Reports & Analytics", icon: FileText },
  { id: "analytics", label: "Utilization Heatmap", icon: Gauge },
  { id: "billing", label: "Billing & Cost Recovery", icon: Receipt },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
  { id: "profile", label: "Profile", icon: UserRound },
];
