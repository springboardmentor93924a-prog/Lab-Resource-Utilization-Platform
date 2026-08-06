import { useEffect, useState } from "react";
import { getBookings, createBooking, updateBooking, deleteBooking as deleteBookingService, approveBooking, rejectBooking } from "../services/bookingService";
import { getUsers } from "../services/userService";
import { getAvailableEquipment } from "../services/equipmentService";
import { findBookingConflict } from "../services/externalBookingService";
import { useToast } from "../context/ToastContext";

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);

    const initialFormState = {
        userId: "", equipmentId: "", startTime: "", endTime: "", purpose: "", status: "PENDING"
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // Search and Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [bData, uData, eData] = await Promise.all([getBookings(), getUsers(), getAvailableEquipment()]);
            setBookings(bData || []); setUsers(uData || []); setEquipmentList(eData || []);
            setError("");
        } catch (err) {
            console.error(err);
            // setError("Unable to load bookings data. Ensure backend is running or enable DEV MODE.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setTimeout(() => loadInitialData(), 0);
        const handleStorage = () => loadInitialData();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const resetForm = () => { setFormData(initialFormState); setEditingId(null); setError(""); };

    const submit = async (e) => {
        e.preventDefault();

        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            setError("End time must be after the start time.");
            addToast("End time must be after the start time.", "warning");
            return;
        }

        // Prevent double booking: block if this equipment already has a
        // non-rejected/cancelled booking overlapping the requested window.
        const conflict = findBookingConflict(bookings, formData.equipmentId, formData.startTime, formData.endTime, editingId || undefined);
        if (conflict) {
            const msg = `Double booking blocked: this equipment is already ${String(conflict.status).toLowerCase()} from ${formatDate(conflict.startTime)} to ${formatDate(conflict.endTime)}.`;
            setError(msg);
            addToast(msg, "error");
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await updateBooking(editingId, formData);
                addToast("Booking updated successfully!");
            } else {
                await createBooking(formData);
                addToast("Booking created successfully!");
            }
            resetForm();
            await loadInitialData();
        } catch (err) {
            console.error(err);
            setError("Unable to save booking.");
            addToast("Failed to save booking.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const editBooking = (booking) => {
        setEditingId(booking.id);
        const formatForInput = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
        setFormData({
            userId: booking.userId || "", equipmentId: booking.equipmentId || "",
            startTime: formatForInput(booking.startTime), endTime: formatForInput(booking.endTime),
            purpose: booking.purpose || "", status: booking.status || "PENDING"
        });
        setError("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteBooking = async (id) => {
        if (!window.confirm("Delete this booking?")) return;
        try { 
            await deleteBookingService(id); 
            addToast("Booking deleted successfully!");
            await loadInitialData(); 
        } catch (err) {
            console.error(err);
            setError("Unable to delete booking."); 
            addToast("Failed to delete booking.", "error");
        }
    };

    const handleApprove = async (id) => { try { await approveBooking(id); addToast("Booking approved!"); await loadInitialData(); } catch (err) {
            console.error(err);
            setError("Unable to approve."); addToast("Failed to approve.", "error"); } };
    const handleReject = async (id) => { try { await rejectBooking(id); addToast("Booking rejected."); await loadInitialData(); } catch (err) {
            console.error(err);
            setError("Unable to reject."); addToast("Failed to reject.", "error"); } };

    const getStatusClass = (status) => status ? `status-badge status-${status.toLowerCase()}` : "";
    const formatDate = (isoString) => {
        if (!isoString) return "-";
        const d = new Date(isoString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    // Derived State
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = String(b.userName || b.userId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              String(b.equipmentName || b.equipmentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              String(b.purpose || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus ? b.status === filterStatus : true;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Bookings Management</h2>
                    <p>Schedule and manage resource reservations</p>
                </div>
            </div>

            {error && <div className="pro-alert">{error}</div>}

            <div className="glass-card" style={{marginBottom: '40px'}}>
                <h4 style={{marginTop: 0, marginBottom: '20px', fontSize: '20px'}}>{editingId ? "Edit Booking" : "Create New Booking"}</h4>
                <form onSubmit={submit}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                        <div className="glass-form-group"><label>User *</label><select className="glass-select" name="userId" value={formData.userId} onChange={handleChange} required><option value="">Select User</option>{users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}</select></div>
                        <div className="glass-form-group"><label>Equipment *</label><select className="glass-select" name="equipmentId" value={formData.equipmentId} onChange={handleChange} required><option value="">Select Equipment</option>{equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}</select></div>
                        <div className="glass-form-group"><label>Start Time *</label><input type="datetime-local" className="glass-input" name="startTime" value={formData.startTime} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>End Time *</label><input type="datetime-local" className="glass-input" name="endTime" value={formData.endTime} onChange={handleChange} required /></div>
                        <div className="glass-form-group"><label>Status</label><select className="glass-select" name="status" value={formData.status} onChange={handleChange}><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option><option value="SCHEDULED">SCHEDULED</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option></select></div>
                        <div className="glass-form-group" style={{ gridColumn: '1 / -1' }}><label>Purpose of Booking *</label><input type="text" className="glass-input" name="purpose" value={formData.purpose} onChange={handleChange} required placeholder="e.g. Research Project Alpha" /></div>
                    </div>
                    <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                        <button type="submit" className="glass-btn" disabled={submitting}>
                            {submitting ? "Saving..." : (editingId ? "Update Booking" : "Create Booking")}
                        </button>
                        {editingId && <button type="button" className="glass-btn" style={{background: 'rgba(255,255,255,0.1)'}} onClick={resetForm} disabled={submitting}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '20px' }}>All Bookings</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" className="glass-input" placeholder="Search user, eq, purpose..." value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} style={{ width: '250px' }} />
                        <select className="glass-select" value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}>
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Equipment</th>
                                <th>Purpose</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="7" style={{textAlign: 'center'}}>Loading...</td></tr> : paginatedBookings.length > 0 ? (
                                paginatedBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>{booking.userName || booking.userId}</td>
                                        <td>{booking.equipmentName || booking.equipmentId}</td>
                                        <td>{booking.purpose}</td>
                                        <td>{formatDate(booking.startTime)}</td>
                                        <td>{formatDate(booking.endTime)}</td>
                                        <td><span className={getStatusClass(booking.status)}>{booking.status}</span></td>
                                        <td>
                                            {booking.status === "PENDING" && (
                                                <>
                                                    <button className="glass-btn" style={{padding: '0 8px', height: '28px', fontSize: '11px', marginRight: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399'}} onClick={() => handleApprove(booking.id)}>Approve</button>
                                                    <button className="glass-btn" style={{padding: '0 8px', height: '28px', fontSize: '11px', marginRight: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171'}} onClick={() => handleReject(booking.id)}>Reject</button>
                                                </>
                                            )}
                                            <button className="glass-btn" style={{padding: '0 8px', height: '28px', fontSize: '11px', marginRight: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24'}} onClick={() => editBooking(booking)}>Edit</button>
                                            <button className="glass-btn" style={{padding: '0 8px', height: '28px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.1)'}} onClick={() => deleteBooking(booking.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : <tr><td colSpan="7" style={{textAlign: 'center'}}>No bookings found</td></tr>}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                        <button className="glass-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '5px 15px' }}>Previous</button>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
                        <button className="glass-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '5px 15px' }}>Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Bookings;