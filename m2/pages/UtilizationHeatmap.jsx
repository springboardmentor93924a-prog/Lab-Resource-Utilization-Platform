import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import equipmentService from "../services/equipmentService";

function UtilizationHeatmap() {

    const [equipment, setEquipment] = useState([]);

    useEffect(() => {
        loadEquipment();
        const interval = setInterval(() => {
          loadEquipment();
        }, 5000);

    return () => clearInterval(interval);
    }, []);

    const loadEquipment = async () => {
        try {
            const response = await equipmentService.getAllEquipment();
            setEquipment(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getColor = (rate) => {
        if (rate <= 40) return "success";
        if (rate <= 70) return "warning";
        return "danger";
    };

    return (
        <>
            <Navbar />

            <div className="d-flex">

                <Sidebar />

                <div className="container-fluid p-4">

                    <h2 className="mb-4">
                        Equipment Utilization Heatmap
                    </h2>

                    <div className="row">

                        {equipment.map((item) => (

                            <div
                                className="col-md-4 mb-4"
                                key={item.id}
                            >

                                <div
                                    className={`card border-${getColor(item.utilizationRate)}`}
                                >

                                    <div className="card-body">

                                        <h4>
                                            {item.equipmentName}
                                        </h4>

                                        <hr />

                                        <p>
                                            <strong>Category:</strong>{" "}
                                            {item.category}
                                        </p>

                                        <p>
                                            <strong>Status:</strong>{" "}
                                            {item.status}
                                        </p>

                                        <p>
                                            <strong>Usage Hours:</strong>{" "}
                                            {item.usageHours}
                                        </p>

                                        <p>
                                            <strong>Total Bookings:</strong>{" "}
                                            {item.totalBookings}
                                        </p>

                                        <div className="progress">

                                            <div
                                                className={`progress-bar bg-${getColor(item.utilizationRate)}`}
                                                style={{
                                                    width: `${item.utilizationRate}%`
                                                }}
                                            >
                                                {item.utilizationRate}%
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </>
    );

}

export default UtilizationHeatmap;