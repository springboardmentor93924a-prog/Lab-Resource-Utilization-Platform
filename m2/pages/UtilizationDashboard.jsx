import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import equipmentService from "../services/equipmentService";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function UtilizationDashboard() {

    const [equipment, setEquipment] = useState([]);
    const [lastUpdated, setLastUpdated] = useState("");

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
          loadData();
        }, 5000);

    return () => clearInterval(interval);

    }, []);

    <p className="text-muted">
      Last Updated : {lastUpdated}
    </p>

    const loadData = async () => {
        try {
            const response = await equipmentService.getAllEquipment();
            setEquipment(response.data);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.log(err);
        }
    };

    <span className={`badge bg-${getStatusColor(item.status)}`}>
      {item.status}
    </span>

    const getStatusColor = (status) => {

    switch (status) {

        case "AVAILABLE":
            return "success";

        case "BOOKED":
            return "warning";

        case "MAINTENANCE":
            return "danger";

        default:
            return "secondary";
      }
    };

    const total = equipment.length;

    const available = equipment.filter(
        e => e.status === "AVAILABLE"
    ).length;

    const booked = equipment.filter(
        e => e.status === "BOOKED"
    ).length;

    const maintenance = equipment.filter(
        e => e.status === "MAINTENANCE"
    ).length;

    const avgUtilization =
        total === 0
            ? 0
            : (
                equipment.reduce(
                    (sum, e) => sum + (e.utilizationRate || 0),
                    0
                ) / total
            ).toFixed(1);

    const chartData = {
        labels: equipment.map(e => e.equipmentName),
        datasets: [
            {
                label: "Usage Hours",
                data: equipment.map(e => e.usageHours),
            },
        ],
    };

    return (
        <>
            <Navbar />

            <div className="d-flex">

                <Sidebar />

                <div className="container-fluid p-4">

                    <h2 className="mb-4">
                        Utilization Dashboard
                    </h2>

                    <div className="row">

                        <div className="col-md-3 mb-3">
                            <div className="card bg-primary text-white">
                                <div className="card-body">
                                    <h3>{total}</h3>
                                    <p>Total Equipment</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3 mb-3">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <h3>{available}</h3>
                                    <p>Available</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3 mb-3">
                            <div className="card bg-warning">
                                <div className="card-body">
                                    <h3>{booked}</h3>
                                    <p>Booked</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3 mb-3">
                            <div className="card bg-danger text-white">
                                <div className="card-body">
                                    <h3>{maintenance}</h3>
                                    <p>Maintenance</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row mt-3">

                        <div className="col-md-4">

                            <div className="card">

                                <div className="card-body">

                                    <h5>
                                        Average Utilization
                                    </h5>

                                    <h2>
                                        {avgUtilization}%
                                    </h2>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="card mt-4">

                        <div className="card-body">

                            <h4>
                                Equipment Usage Hours
                            </h4>

                            <Bar data={chartData} />

                        </div>

                    </div>

                </div>

            </div>

        </>
    );
}

export default UtilizationDashboard;