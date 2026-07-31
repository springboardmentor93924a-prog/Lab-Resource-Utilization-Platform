import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
    const [users, setUsers] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [usersResponse, equipmentResponse, bookingsResponse] =
                await Promise.all([
                    api.get("/users"),
                    api.get("/equipment"),
                    api.get("/booking")
                ]);

            setUsers(usersResponse.data);
            setEquipment(equipmentResponse.data);
            setBookings(bookingsResponse.data);

        } catch (err) {
            console.error(err);
            setError("Unable to load dashboard data.");
        }
    };

    const availableEquipment = equipment.filter(
        (item) => item.status?.toLowerCase() === "available"
    ).length;

    const bookedEquipment = equipment.filter(
        (item) => item.status?.toLowerCase() === "booked"
    ).length;

    const pendingBookings = bookings.filter(
        (booking) => booking.status?.toLowerCase() === "pending"
    ).length;

    const approvedBookings = bookings.filter(
        (booking) => booking.status?.toLowerCase() === "approved"
    ).length;

    return (
        <div className="container mt-4">

            <h2>Dashboard</h2>

            <p className="text-muted">
                Lab Resource Utilization Platform
            </p>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="row mt-4">

                <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5>Total Users</h5>
                            <h2>{users.length}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5>Total Equipment</h5>
                            <h2>{equipment.length}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5>Available Equipment</h5>
                            <h2>{availableEquipment}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5>Booked Equipment</h5>
                            <h2>{bookedEquipment}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5>Total Bookings</h5>
                            <h2>{bookings.length}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5>Pending Bookings</h5>
                            <h2>{pendingBookings}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 col-lg-3 mb-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5>Approved Bookings</h5>
                            <h2>{approvedBookings}</h2>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card shadow-sm mt-3">
                <div className="card-body">

                    <h4>Recent Bookings</h4>

                    <div className="table-responsive">
                        <table className="table table-bordered mt-3">

                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Equipment</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {bookings.slice(-5).reverse().map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.id}</td>
                                        <td>{booking.user?.name}</td>
                                        <td>{booking.equipment?.name}</td>
                                        <td>{booking.bookingDate}</td>
                                        <td>{booking.status}</td>
                                    </tr>
                                ))}

                            </tbody>

                        </table>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Dashboard;