import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import { extractErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AvailabilityCalendar from "../components/bookings/AvailabilityCalendar";

function Bookings() {
    const { user, isManager, isAdmin, isResearcher } = useAuth();
    const location = useLocation();

    const [bookings, setBookings] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [checking, setChecking] = useState(false);

    const [formData, setFormData] = useState({
        equipmentId: location.state?.selectedEquipment || "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        status: ""
    });

    const loadData = async () => {
        try {
            let bookingEndpoint = "/bookings";
            if (isResearcher()) {
                bookingEndpoint = `/bookings/user/${user.userId}`;
            }

            const [bookingRes, eqRes] = await Promise.all([
                api.get(bookingEndpoint).catch(() => ({ data: [] })),
                api.get("/equipment").catch(() => ({ data: [] }))
            ]);

            setBookings(bookingRes.data || []);
            setEquipmentList(eqRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to load booking data.");
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSlotSelect = (slotInfo) => {
        setFormData(prev => ({
            ...prev,
            bookingDate: slotInfo.date,
            startTime: slotInfo.startTime,
            endTime: slotInfo.endTime,
            status: slotInfo.status
        }));
        setError("");
        setSuccess("");
    };

    const formatDateTime = (date, time) => {
        const t = time.length === 5 ? time + ":00" : time;
        return `${date}T${t}`;
    };

    const addBooking = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.bookingDate || !formData.startTime || !formData.endTime) {
            setError("Please select a time slot from the calendar.");
            return;
        }

        const startDateTime = formatDateTime(formData.bookingDate, formData.startTime);
        const endDateTime = formatDateTime(formData.bookingDate, formData.endTime);

        const now = new Date();
        // Allow booking the current hour slot (walk-in tolerance),
        // matching the backend rule.
        now.setMinutes(0, 0, 0);
        const slotStart = new Date(startDateTime);
        if (slotStart < now) {
            setError("Cannot book a past time slot. Please select a current or future slot from the calendar.");
            return;
        }

        try {
            const bookingObj = {
                userId: String(user.userId),
                equipmentId: String(formData.equipmentId),
                startTime: startDateTime,
                endTime: endDateTime,
                purpose: "General booking",
                projectName: "",
                notes: ""
            };

            await api.post("/bookings", bookingObj);

            setSuccess("Booking request submitted successfully! Awaiting approval.");
            setFormData({ equipmentId: formData.equipmentId, bookingDate: "", startTime: "", endTime: "", status: "" });
            await loadData();
        } catch (err) {
            console.error(err);
            setError(`Unable to create booking: ${extractErrorMessage(err, "Please check the selected time slot.")}`);
        }
    };

    const handleJoinWaitlist = async () => {
        setError("");
        setSuccess("");

        if (!formData.bookingDate || !formData.startTime) {
            setError("Please select a time slot first.");
            return;
        }

        try {
            let slotDate = formData.bookingDate;
            const todayStr = new Date().toISOString().split('T')[0];
            if (slotDate <= todayStr) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                slotDate = tomorrow.toISOString().split('T')[0];
            }

            const startDateTime = formatDateTime(slotDate, formData.startTime);
            const endDateTime = formatDateTime(slotDate, formData.endTime);

            await api.post("/waitlist", {
                userId: String(user.userId),
                equipmentId: String(formData.equipmentId),
                requestedStartTime: startDateTime,
                requestedEndTime: endDateTime,
                priority: 1,
                purpose: "Waitlisted from Bookings Page",
                remarks: ""
            });
            setSuccess("Successfully joined the waitlist for this slot!");
            setFormData({ equipmentId: formData.equipmentId, bookingDate: "", startTime: "", endTime: "", status: "" });
        } catch (err) {
            console.error(err);
            setError(`Unable to join waitlist: ${extractErrorMessage(err)}`);
        }
    };

    const getSuggestions = async () => {
        if (!formData.equipmentId || !formData.bookingDate || !formData.startTime) {
            setError("Please select a time slot first.");
            return;
        }
        setError("");
        setSuccess("");
        setChecking(true);
        try {
            const start = formatDateTime(formData.bookingDate, formData.startTime);
            const end = formatDateTime(formData.bookingDate, formData.endTime);
            const res = await api.get("/booking-optimization/suggestions", {
                params: { equipmentId: formData.equipmentId, requestedStartTime: start, requestedEndTime: end }
            });
            const data = res.data;
            if (data.requestedSlotAvailable) {
                setSuccess("Good news! The requested slot is available. You can book now.");
            } else {
                let msg = data.message || "The requested slot is not available.";
                if (data.suggestedSlots && data.suggestedSlots.length > 0) {
                    msg += "\n\nSuggested alternative slots:\n";
                    data.suggestedSlots.slice(0, 3).forEach(s => {
                        msg += `  • ${s.startTime} to ${s.endTime} (${s.reason || 'available'})\n`;
                    });
                }
                if (data.alternativeEquipment && data.alternativeEquipment.length > 0) {
                    msg += "\nAlternative equipment:\n";
                    data.alternativeEquipment.slice(0, 3).forEach(eq => {
                        msg += `  • ${eq.equipmentName} at ${eq.institutionName || eq.location || 'N/A'} (${eq.utilizationPercentage}% utilized)\n`;
                    });
                }
                setSuccess(msg);
            }
        } catch (err) {
            console.error(err);
            setError("Unable to fetch optimization suggestions.");
        } finally {
            setChecking(false);
        }
    };

    const updateBookingStatus = async (bookingId, action) => {
        try {
            await api.patch(`/bookings/${bookingId}/${action}`);
            setSuccess(`Booking ${action}ed successfully.`);
            await loadData();
        } catch (err) {
            console.error(err);
            setError(`Unable to ${action} booking.`);
        }
    };

    const canManage = isManager() || isAdmin();
    const isSlotUnavailable = formData.status === 'BOOKED' || formData.status === 'PENDING';

    const getDisplayStatus = (b) => {
        const approval = (b.approvalStatus || "").toLowerCase();
        const booking = (b.bookingStatus || "").toLowerCase();
        if (booking === "cancelled" || booking === "no_show") return booking;
        if (booking === "in_use") return "in use";
        if (booking === "completed") return "completed";
        if (approval === "rejected") return "rejected";
        if (approval === "approved") return "approved";
        if (approval === "pending") return "pending";
        return b.bookingStatus || b.approvalStatus || "unknown";
    };

    const getBadgeClass = (b) => {
        const status = getDisplayStatus(b);
        if (["approved", "completed"].includes(status)) return "success";
        if (["pending"].includes(status)) return "warning";
        if (["rejected", "cancelled", "no_show"].includes(status)) return "danger";
        if (["in use"].includes(status)) return "info";
        return "info";
    };

    const formatDate = (dt) => {
        if (!dt) return "";
        return String(dt).split("T")[0];
    };

    const formatTime = (dt) => {
        if (!dt) return "";
        const parts = String(dt).split("T");
        return parts[1] ? parts[1].substring(0, 5) : "";
    };

    return (
        <div className="page-content">
            <h1 className="mb-4">{canManage ? "Manage Bookings" : "My Bookings"}</h1>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success" style={{ whiteSpace: "pre-wrap" }}>{success}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="mb-3">New Booking Request</h5>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label text-muted fw-bold">Equipment</label>
                            <select className="form-select" name="equipmentId" value={formData.equipmentId} onChange={handleChange} required>
                                <option value="">Select Equipment</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-8 mb-3">
                            {formData.equipmentId ? (
                                <AvailabilityCalendar
                                    equipmentId={formData.equipmentId}
                                    onSlotSelect={handleSlotSelect}
                                    selectedSlot={{
                                        date: formData.bookingDate,
                                        startTime: formData.startTime
                                    }}
                                />
                            ) : (
                                <div className="p-4 bg-light text-center text-muted rounded h-100 d-flex align-items-center justify-content-center">
                                    Please select an equipment to view availability
                                </div>
                            )}
                        </div>
                    </div>

                    {formData.bookingDate && (
                        <div className="mt-3 p-3 bg-light rounded d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <strong>Selected Slot:</strong> {formData.bookingDate} | {formData.startTime} to {formData.endTime}
                                <span className={`badge badge-${formData.status === 'AVAILABLE' ? 'success' : formData.status === 'BOOKED' ? 'danger' : 'warning'} ms-2`}>
                                    {formData.status}
                                </span>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-outline-info px-3" onClick={getSuggestions} disabled={checking}>
                                    {checking ? "Checking…" : "Get Suggestions"}
                                </button>
                                {isSlotUnavailable ? (
                                    <button type="button" className="btn btn-warning px-4" onClick={handleJoinWaitlist}>
                                        Join Waitlist
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-primary px-4" onClick={addBooking}>
                                        Book Now
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>User</th>
                            <th>Equipment</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-muted">No bookings found</td></tr>
                        ) : (
                            bookings.map(b => {
                                const displayStatus = getDisplayStatus(b);
                                const approvalLower = (b.approvalStatus || "").toLowerCase();
                                return (
                                <tr key={b.id}>
                                    <td className="fw-semibold text-dark">{b.userName || "Unknown User"}</td>
                                    <td>{b.equipmentName || "Unknown Equipment"}</td>
                                    <td>
                                        <div>{formatDate(b.startTime)}</div>
                                        <div className="text-muted small">
                                            {formatTime(b.startTime)} - {formatTime(b.endTime)}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${getBadgeClass(b)}`}>
                                            {displayStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {canManage && approvalLower === 'pending' && (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => updateBookingStatus(b.id, 'approve')}>Approve</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => updateBookingStatus(b.id, 'reject')}>Reject</button>
                                                </>
                                            )}
                                            {!canManage && (approvalLower === 'pending' || approvalLower === 'approved') && (
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => updateBookingStatus(b.id, 'cancel')}>Cancel</button>
                                            )}
                                            {canManage && approvalLower === 'approved' && (
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => updateBookingStatus(b.id, 'cancel')}>Cancel</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );})
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}

export default Bookings;
