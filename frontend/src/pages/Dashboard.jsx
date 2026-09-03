import { useAuth } from "../context/AuthContext";
import ResearcherDashboard from "../components/dashboard/ResearcherDashboard";
import LabTechnicianDashboard from "../components/dashboard/LabTechnicianDashboard";
import LabManagerDashboard from "../components/dashboard/LabManagerDashboard";
import DepartmentHeadDashboard from "../components/dashboard/DepartmentHeadDashboard";
import InstitutionAdminDashboard from "../components/dashboard/InstitutionAdminDashboard";
import SystemAdminDashboard from "../components/dashboard/SystemAdminDashboard";

export default function Dashboard() {
    const { user, isSystemAdmin, isInstitutionAdmin, isDepartmentHead, isLabManager, isLabTechnician, isResearcher } = useAuth();

    return (
        <div className="page-content">
            <div className="welcome-header">
                <h1 className="mb-0">Welcome, {user?.name || "User"}</h1>
                <p className="text-muted">Lab Resource Utilization Platform</p>
            </div>

            {isSystemAdmin() ? (
                <SystemAdminDashboard />
            ) : isInstitutionAdmin() ? (
                <InstitutionAdminDashboard />
            ) : isDepartmentHead() ? (
                <DepartmentHeadDashboard />
            ) : isLabManager() ? (
                <LabManagerDashboard />
            ) : isLabTechnician() ? (
                <LabTechnicianDashboard />
            ) : isResearcher() ? (
                <ResearcherDashboard />
            ) : (
                <div className="alert alert-warning">
                    Your role ({user?.role}) does not have a specialized dashboard assigned.
                </div>
            )}
        </div>
    );
}