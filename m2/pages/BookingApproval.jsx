import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import bookingService from "../services/bookingService";

function BookingApproval() {

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await bookingService.getAllBookings();
            setBookings(response.data);
        } catch (error) {
            console.log(error);
            alert("Unable to load bookings.");
        }
    };

    const approveBooking = async (id) => {
        try {
            await bookingService.updateBookingStatus(id, "APPROVED");
            loadBookings();
        } catch (error) {
            console.log(error);
        }
    };

    const rejectBooking = async (id) => {
        try {
            await bookingService.updateBookingStatus(id, "REJECTED");
            loadBookings();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Navbar />

            <div className="d-flex">

                <Sidebar />

                <div className="container-fluid p-4">

                    <h2 className="mb-4">
                        Booking Approval
                    </h2>

                    <table className="table table-bordered table-hover">

                        <thead className="table-dark">

                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Equipment</th>
                                <th>Booking Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {bookings.map((booking) => (

                                <tr key={booking.id}>

                                    <td>{booking.id}</td>

                                    <td>{booking.userName}</td>

                                    <td>{booking.equipmentName}</td>

                                    <td>{booking.bookingDate}</td>

                                    <td>

                                        <span
                                            className={`badge ${
                                                booking.status === "APPROVED"
                                                    ? "bg-success"
                                                    : booking.status === "REJECTED"
                                                    ? "bg-danger"
                                                    : "bg-warning"
                                            }`}
                                        >
                                            {booking.status}
                                        </span>

                                    </td>

                                    <td>

                                        <button
                                            className="btn btn-success btn-sm me-2"
                                            onClick={() => approveBooking(booking.id)}
                                        >
                                            Approve
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => rejectBooking(booking.id)}
                                        >
                                            Reject
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </>
    );
}

export default BookingApproval;