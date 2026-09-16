import { LayoutDashboard, Search, CalendarClock, AlertTriangle, Bell, UserRound } from "lucide-react";

/* ================================================================== */
/*  Researcher -> Dashboard -> Sidebar nav items                       */
/* ================================================================== */
export const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "search", label: "Search Equipment", icon: Search },
  { id: "bookings", label: "My Bookings", icon: CalendarClock },
  { id: "report", label: "Report Issue", icon: AlertTriangle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
];
