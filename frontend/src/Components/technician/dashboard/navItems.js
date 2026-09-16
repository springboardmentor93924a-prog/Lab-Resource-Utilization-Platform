import { LayoutDashboard, Wrench, Thermometer, Bell, UserRound, ClipboardList } from "lucide-react";

/* ================================================================== */
/*  Technician -> Dashboard -> Sidebar nav items                       */
/* ================================================================== */
export const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Assigned Tasks", icon: ClipboardList },
  { id: "maintenance", label: "Equipment Maintenance", icon: Wrench },
  { id: "calibration", label: "Calibration Logs", icon: Thermometer },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
];
