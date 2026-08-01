import { useEffect, useState } from "react";
import api from "../services/api";

function Bookings() {

    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [equipment, setEquipment] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        userId: "",
        equipmentId: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        status: "Pending"
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bookingResponse, userResponse, equipmentResponse] =
                await Promise.all([
                    api.get("/bookings"),
                    api.get("/users"),
                    api.get("/equipment")
                ]);

            setBookings(bookingResponse.data);
            setUsers(userResponse.data);
            setEquipment(equipmentResponse.data);

        } catch (err) {
            console.error(err);
            setError("Unable to load booking data.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            userId: "",
            equipmentId: "",
            bookingDate: "",
            startTime: "",
            endTime: "",
            status: "Pending"
        });

        setEditingId(null);
        setError("");
    };

    const createBookingObject = () => {
        return {
            user: {
                id: Number(formData.userId)
            },

            equipment: {
                id: Number(formData.equipmentId)
            },

            bookingDate: formData.bookingDate,

            startTime:
                formData.startTime.length === 5
                    ? `${formData.startTime}:00`
                    : formData.startTime,

            endTime:
                formData.endTime.length === 5
                    ? `${formData.endTime}:00`
                    : formData.endTime,

            status: formData.status
        };
    };

    // CREATE BOOKING
    const addBooking = async (e) => {
        e.preventDefault();

        try {
            const booking = createBookingObject();

            await api.post("/bookings", booking);

            resetForm();
            await loadData();

        } catch (err) {
            console.error(err);
            setError("Unable to create booking.");
        }
    };

    // LOAD BOOKING INTO EDIT FORM
    const editBooking = (booking) => {

        setEditingId(booking.id);

        setFormData({
            userId: booking.user?.id?.toString() ?? "",
            equipmentId: booking.equipment?.id?.toString() ?? "",
            bookingDate: booking.bookingDate ?? "",

            startTime:
                booking.startTime
                    ? booking.startTime.substring(0, 5)
                    : "",

            endTime:
                booking.endTime
                    ? booking.endTime.substring(0, 5)
                    : "",

            status: booking.status ?? "Pending"
        });

        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // UPDATE BOOKING
    const updateBooking = async (e) => {
        e.preventDefault();

        try {
            const booking = createBookingObject();

            await api.put(`/bookings/${editingId}`, booking);

            resetForm();
            await loadData();

        } catch (err) {
            console.error(err);
            setError("Unable to update booking.");
        }
    };

    // DELETE BOOKING
    const deleteBooking = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this booking?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/bookings/${id}`);
            await loadData();

        } catch (err) {
            console.error(err);
            setError("Unable to delete booking.");
        }
    };

    return (
        <div className="container mt-4">

            <h2>Bookings</h2>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* CREATE / EDIT FORM */}

            <div className="card mt-3 mb-4">

                <div className="card-body">

                    <h4>
                        {editingId
                            ? "Edit Booking"
                            : "Create Booking"}
                    </h4>

                    <form
                        onSubmit={
                            editingId
                                ? updateBooking
                                : addBooking
                        }
                    >

                        <div className="row">

                            {/* USER */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    User
                                </label>

                                <select
                                    className="form-select"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select User
                                    </option>

                                    {users.map((user) => (
                                        <option
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.name} - {user.department}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {/* EQUIPMENT */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Equipment
                                </label>

                                <select
                                    className="form-select"
                                    name="equipmentId"
                                    value={formData.equipmentId}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Equipment
                                    </option>

                                    {equipment.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name} - {item.status}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {/* DATE */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    Booking Date
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    name="bookingDate"
                                    value={formData.bookingDate}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* START */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    Start Time
                                </label>

                                <input
                                    type="time"
                                    className="form-control"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* END */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    End Time
                                </label>

                                <input
                                    type="time"
                                    className="form-control"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* STATUS */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Approved">
                                        Approved
                                    </option>

                                    <option value="Rejected">
                                        Rejected
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className={
                                editingId
                                    ? "btn btn-warning"
                                    : "btn btn-primary"
                            }
                        >
                            {editingId
                                ? "Update Booking"
                                : "Create Booking"}
                        </button>

                        {editingId && (

                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>

                        )}

                    </form>

                </div>

            </div>

            {/* BOOKINGS TABLE */}

            <div className="table-responsive">

                <table className="table table-bordered table-striped">

                    <thead className="table-dark">

                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Equipment</th>
                            <th>Date</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {bookings.map((booking) => (

                            <tr key={booking.id}>

                                <td>{booking.id}</td>

                                <td>
                                    {booking.user?.name}
                                </td>

                                <td>
                                    {booking.equipment?.name}
                                </td>

                                <td>
                                    {booking.bookingDate}
                                </td>

                                <td>
                                    {booking.startTime}
                                </td>

                                <td>
                                    {booking.endTime}
                                </td>

                                <td>
                                    {booking.status}
                                </td>

                                <td>

                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() =>
                                            editBooking(booking)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            deleteBooking(booking.id)
                                        }
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Bookings;