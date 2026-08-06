import { useState, useEffect } from "react";
import { getAnalyticsStats, getIdleEquipment } from "../services/analyticsService";
import DashboardCards from "../components/DashboardCards";
import UtilizationChart from "../components/UtilizationChart";
import HeatMap from "../components/HeatMap";
import IdleEquipmentTable from "../components/IdleEquipmentTable";

export default function UtilizationDashboard() {
    const [stats, setStats] = useState(null);
    const [idleList, setIdleList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [analyticsData, idleData] = await Promise.all([
                    getAnalyticsStats(),
                    getIdleEquipment()
                ]);
                setStats(analyticsData);
                setIdleList(idleData);
            } catch (err) {
                console.error("Error loading utilization data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                Loading utilization statistics...
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header mb-4">
                <h2>Utilization Analytics Dashboard</h2>
                <p>Track operating hours, detect idle equipment and examine weekly heatmap trends</p>
            </div>

            {stats && (
                <>
                    {/* Top Stats Cards */}
                    <DashboardCards stats={stats} />

                    {/* Recharts Panels */}
                    <UtilizationChart 
                        hourlyData={stats.hourlyUtilization} 
                        dailyData={stats.dailyUtilization} 
                        categoryDistribution={stats.demandTrends} 
                    />

                    {/* Heatmap Section */}
                    <HeatMap />

                    {/* Idle Equipment Table */}
                    <IdleEquipmentTable data={idleList} />
                </>
            )}
        </div>
    );
}
