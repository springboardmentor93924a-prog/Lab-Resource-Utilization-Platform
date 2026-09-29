import React, { useState, useEffect } from "react";
import { DashboardShell } from "../../common/DashboardShell.jsx";
import { NAV_ITEMS } from "../navItems";
import SystemAdminDashboardView from "./SystemAdminDashboardView.jsx";
import AllInstitutionsView from "../institutions/AllInstitutionsView.jsx";
import PendingApprovalsView from "../institutions/PendingApprovalsView.jsx";
import InstitutionDetailsView from "../institutions/InstitutionDetailsView.jsx";
import AllUsersView from "../users/AllUsersView.jsx";
import PendingRegistrationsView from "../users/PendingRegistrationsView.jsx";
import StaffInvitationsMonitorView from "../users/StaffInvitationsMonitorView.jsx";
import AccessRolesView from "../accessRoles/AccessRolesView.jsx";
import AuditLogsView from "../auditLogs/AuditLogsView.jsx";
import PlatformAnalyticsView from "../analytics/PlatformAnalyticsView.jsx";
import SystemSettingsView from "../settings/SystemSettingsView.jsx";
import SystemAdminNotifications from "../notifications/Notifications.jsx";
import SystemAdminProfileView from "../profile/SystemAdminProfileView.jsx";
import { notificationApi } from "../../../api/notificationApi";

export default function SystemAdminDashboard({ user, onLogout, toast }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedInstId, setSelectedInstId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial unread notifications count for sidebar badge
  useEffect(() => {
    let isMounted = true;
    notificationApi
      .unreadCount()
      .then((res) => {
        if (isMounted && res && typeof res.count === "number") {
          setUnreadCount(res.count);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <SystemAdminDashboardView
            onViewInstitutions={() => setActiveView("institutions")}
            onViewPending={() => setActiveView("pending-institutions")}
            onViewDetails={(id) => {
              setSelectedInstId(id);
              setActiveView("institution-details");
            }}
            toast={toast}
          />
        );
      case "institutions":
        return (
          <AllInstitutionsView
            onViewDetails={(id) => {
              setSelectedInstId(id);
              setActiveView("institution-details");
            }}
            toast={toast}
          />
        );
      case "pending-institutions":
        return (
          <PendingApprovalsView
            onViewDetails={(id) => {
              setSelectedInstId(id);
              setActiveView("institution-details");
            }}
            toast={toast}
          />
        );
      case "institution-details":
        return (
          <InstitutionDetailsView
            institutionId={selectedInstId}
            onBack={() => setActiveView("institutions")}
            toast={toast}
          />
        );
      case "users":
        return <AllUsersView toast={toast} />;
      case "pending-registrations":
        return <PendingRegistrationsView toast={toast} />;
      case "staff-invitations":
        return <StaffInvitationsMonitorView toast={toast} />;
      case "access-roles":
        return <AccessRolesView />;
      case "audit-logs":
        return <AuditLogsView toast={toast} />;
      case "analytics":
        return <PlatformAnalyticsView toast={toast} />;
      case "settings":
        return <SystemSettingsView toast={toast} />;
      case "notifications":
        return (
          <SystemAdminNotifications
            toast={toast}
            onUnreadCountChange={setUnreadCount}
          />
        );
      case "profile":
        return <SystemAdminProfileView toast={toast} />;
      default:
        return (
          <SystemAdminDashboardView
            onViewInstitutions={() => setActiveView("institutions")}
            onViewPending={() => setActiveView("pending-institutions")}
            onViewDetails={(id) => {
              setSelectedInstId(id);
              setActiveView("institution-details");
            }}
            toast={toast}
          />
        );
    }
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeView={activeView}
      setActiveView={setActiveView}
      onLogout={onLogout}
      roleLabel="Platform Administrator"
      roleTag="SYSTEM ADMIN"
      userName={user?.email || "System Administrator"}
      notifCount={unreadCount}
    >
      {renderView()}
    </DashboardShell>
  );
}
