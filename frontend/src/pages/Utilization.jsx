import UtilizationStats from "../components/utilization/UtilizationStats";
import UtilizationHeatmap from "../components/utilization/UtilizationHeatmap";

export default function Utilization() {
    return (
        <div className="page-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1">Utilization Analytics</h1>
                    <p className="text-muted">Monitor equipment utilization, identify bottlenecks, and optimize resource allocation.</p>
                </div>
            </div>

            <UtilizationStats />
            
            <div className="mt-4">
                <UtilizationHeatmap />
            </div>
        </div>
    );
}
