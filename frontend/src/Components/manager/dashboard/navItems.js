import { LayoutDashboard, CalendarClock, Wrench, Gauge, FileText, Bell, UserRound, Package } from "lucide-react";

/* ================================================================== */
/*  Manager -> Dashboard -> Sidebar nav items                          */
/* ================================================================== */
export const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "equipment", label: "Department Equipment", icon: Package },
  { id: "approvals", label: "Booking Approvals", icon: CalendarClock },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "utilization", label: "Utilization Heatmap", icon: Gauge },
  { id: "reports", label: "Reports & Analytics", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
];
