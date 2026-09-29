import {
  LayoutDashboard, Landmark, ShieldAlert, Users, UserCheck, Mail, Lock, Bell, ScrollText, UserRound, BarChart3, Settings
} from "lucide-react";

/* ================================================================== */
/*  System Admin -> Dashboard -> Sidebar nav items                     */
/* ================================================================== */
export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "institutions", label: "All Institutions", icon: Landmark },
  { id: "pending-institutions", label: "Pending Approvals", icon: ShieldAlert },
  { id: "users", label: "All Users", icon: Users },
  { id: "pending-registrations", label: "Pending Registrations", icon: UserCheck },
  { id: "staff-invitations", label: "Staff Invitations", icon: Mail },
  { id: "access-roles", label: "Access & Roles", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "audit-logs", label: "Audit Logs", icon: ScrollText },
  { id: "analytics", label: "Platform Analytics", icon: BarChart3 },
  { id: "settings", label: "System Settings", icon: Settings },
  { id: "profile", label: "My Profile", icon: UserRound },
];
