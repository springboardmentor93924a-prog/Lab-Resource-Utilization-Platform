import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../components/common/useToasts";
import { ToastStack } from "../components/common/ToastStack";
import { LoginPage } from "../backend-integration/components/auth/LoginPage";
import { LandingPage } from "../backend-integration/components/landing/LandingPage";
import { RegisterPage } from "../backend-integration/components/auth/RegisterPage";
import { InstitutionAdminRegisterPage } from "../backend-integration/components/auth/InstitutionAdminRegisterPage";
import { RoleSelectPage } from "../backend-integration/components/auth/RoleSelectPage";
import { PendingPage } from "../backend-integration/components/auth/PendingPage";
import StaffPasswordSetupPage from "../components/auth/StaffPasswordSetupPage";
import PasswordSetupPage from "../components/auth/PasswordSetupPage";
import { ResearcherApp } from "../backend-integration/components/researcher/ResearcherApp";
import TechnicianDashboard from "../components/technician/dashboard/TechnicianDashboard";
import ManagerDashboard from "../components/manager/dashboard/ManagerDashboard";
import DepartmentHeadDashboard from "../components/departmentHead/dashboard/DepartmentHeadDashboard";
import InstitutionAdminDashboard from "../components/institutionAdmin/dashboard/InstitutionAdminDashboard";
import SystemAdminDashboard from "../components/systemAdmin/dashboard/SystemAdminDashboard";
import UtilizationHeatmapPage from "../components/shared/UtilizationHeatmapPage";

function getInitialRoute() {
  const path = window.location.pathname.replace(/^\/+/, "");
  if (path === "login") return "login";
  if (path === "register" || path === "register-researcher" || path === "register-student") return "register";
  if (path === "register-institution" || path === "register-admin") return "register-institution";
  if (path === "roles") return "roles";
  if (path === "pending") return "pending";
  if (path === "heatmap") return "heatmap";
  if (path === "accept-invitation" || path === "staff-setup") return "accept-invitation";
  if (path === "setup-password" || path === "setup") return "setup-password";
  if (path === "landing" || path === "") return "landing";
  return "landing";
}

export default function AppRoutes() {
  const { user, logout, initializing } = useAuth();
  const { toasts, push: pushToast } = useToasts();
  const [route, setRoute] = useState(getInitialRoute);
  const [pendingUser, setPendingUser] = useState(null);

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Loading Lab Resource Platform...</div>
      </div>
    );
  }

  // Navigation handler
  const goTo = (targetRoute, data = null) => {
    if (targetRoute === "pending" && data) {
      setPendingUser(data);
    }
    setRoute(targetRoute);
    try {
      window.history.pushState({}, "", `/${targetRoute === "landing" ? "" : targetRoute}`);
    } catch (_) {}
  };

  // If user is authenticated, route based on user roles or active route
  if (user) {
    const roles = user.roles || [];
    const isSystemAdmin = roles.includes("SYSTEM_ADMIN") || roles.includes("ROLE_SYSTEM_ADMIN");
    const isResearcher = roles.includes("RESEARCHER") || roles.includes("ROLE_RESEARCHER");
    const isTechnician = roles.includes("LAB_TECHNICIAN") || roles.includes("ROLE_LAB_TECHNICIAN");
    const isManager = roles.includes("LAB_MANAGER") || roles.includes("ROLE_LAB_MANAGER");
    const isDeptHead = roles.includes("DEPARTMENT_HEAD") || roles.includes("ROLE_DEPARTMENT_HEAD");
    const isInstAdmin = roles.includes("INSTITUTION_ADMIN") || roles.includes("ROLE_INSTITUTION_ADMIN");

    // Route overrides
    if (route === "heatmap") {
      return (
        <>
          <UtilizationHeatmapPage onBack={() => setRoute("dashboard")} />
          <ToastStack toasts={toasts} />
        </>
      );
    }

    if (isSystemAdmin) {
      return (
        <>
          <SystemAdminDashboard user={user} onLogout={logout} toast={pushToast} />
          <ToastStack toasts={toasts} />
        </>
      );
    }

    if (isResearcher) {
      return (
        <>
          <ResearcherApp toast={pushToast} onLogout={logout} />
          <ToastStack toasts={toasts} />
        </>
      );
    }

    if (isTechnician) {
      return (
        <>
          <TechnicianDashboard user={user} onLogout={logout} toast={pushToast} />
          <ToastStack toasts={toasts} />
        </>
      );
    }

    if (isManager) {
      return (
        <>
          <ManagerDashboard user={user} onLogout={logout} toast={pushToast} />
          <ToastStack toasts={toasts} />
        </>
      );
    }

    if (isDeptHead) {
      return (
        <>
          <DepartmentHeadDashboard user={user} onLogout={logout} toast={pushToast} />
          <ToastStack toasts={toasts} />
        </>
      );
    }

    if (isInstAdmin) {
      return (
        <>
          <InstitutionAdminDashboard user={user} onLogout={logout} toast={pushToast} />
          <ToastStack toasts={toasts} />
        </>
      );
    }

    // Default fallback for logged-in user: Researcher App
    return (
      <>
        <ResearcherApp toast={pushToast} onLogout={logout} />
        <ToastStack toasts={toasts} />
      </>
    );
  }

  // Unauthenticated routes
  let pageContent;
  if (route === "landing") {
    pageContent = <LandingPage goTo={goTo} toast={pushToast} />;
  } else if (route === "login") {
    pageContent = <LoginPage goTo={goTo} toast={pushToast} />;
  } else if (route === "roles") {
    pageContent = <RoleSelectPage goTo={goTo} selectRole={() => {}} toast={pushToast} openModal={() => {}} />;
  } else if (route === "register" || route === "register-researcher") {
    pageContent = <RegisterPage goTo={goTo} toast={pushToast} />;
  } else if (route === "register-institution" || route === "register-admin") {
    pageContent = <InstitutionAdminRegisterPage goTo={goTo} toast={pushToast} />;
  } else if (route === "accept-invitation" || route === "staff-setup") {
    pageContent = <StaffPasswordSetupPage goTo={goTo} toast={pushToast} />;
  } else if (route === "setup-password" || route === "setup") {
    pageContent = <PasswordSetupPage goTo={goTo} toast={pushToast} />;
  } else if (route === "pending") {
    pageContent = <PendingPage user={pendingUser} goTo={goTo} />;
  } else if (route === "heatmap") {
    pageContent = <UtilizationHeatmapPage onBack={() => setRoute("landing")} />;
  } else {
    // Default: landing page
    pageContent = <LandingPage goTo={goTo} toast={pushToast} />;
  }

  return (
    <>
      {pageContent}
      <ToastStack toasts={toasts} />
    </>
  );
}
