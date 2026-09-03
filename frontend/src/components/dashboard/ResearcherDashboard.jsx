import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

export default function ResearcherDashboard() {
    const [bookings, setBookings] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [waitlists, setWaitlists] = useState([]);
    const [userId] = useState(() => localStorage.getItem("userId"));

    const loadData = async () => {
        try {
            const [bookingRes, eqRes, wlRes] = await Promise.all([
                api.get(`/bookings/user/${userId}`).catch(() => ({ data: [] })),
                api.get("/equipment").catch(() => ({ data: [] })),
                api.get(`/waitlist/user/${userId}`).catch(() => ({ data: [] }))
            ]);
            setBookings(bookingRes.data || []);
            setEquipment(eqRes.data || []);
            setWaitlists(wlRes.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const availableEquipment = equipment.filter(e => (e.availabilityStatus || e.status || "").toLowerCase() === "available").length;
    const myActiveBookings = bookings.filter(b => {
        const approval = (b.approvalStatus || "").toLowerCase();
        const booking = (b.bookingStatus || "").toLowerCase();
        return ["pending", "approved"].includes(approval) || ["in_use"].includes(booking);
    }).length;
    const myWaitlists = waitlists.filter(w => {
        const s = (w.status || "").toLowerCase();
        return ["waiting", "notified", "allocated"].includes(s);
    }).length;

    const formatDate = (dt) => dt ? String(dt).split("T")[0] : "";
    const formatTime = (dt) => {
        if (!dt) return "";
        const parts = String(dt).split("T");
        return parts[1] ? parts[1].substring(0, 5) : "";
    };

    const getBadgeClass = (b) => {
        const approval = (b.approvalStatus || "").toLowerCase();
        const booking = (b.bookingStatus || "").toLowerCase();
        if (booking === "cancelled" || booking === "no_show" || approval === "rejected") return "danger";
        if (approval === "approved" || booking === "completed") return "success";
        if (approval === "pending") return "warning";
        return "info";
    };

    const getDisplayStatus = (b) => {
        const approval = (b.approvalStatus || "").toLowerCase();
        const booking = (b.bookingStatus || "").toLowerCase();
        if (booking === "cancelled") return "cancelled";
        if (booking === "no_show") return "no show";
        if (booking === "in_use") return "in use";
        if (booking === "completed") return "completed";
        if (approval === "rejected") return "rejected";
        if (approval === "approved") return "approved";
        if (approval === "pending") return "pending";
        return b.bookingStatus || b.approvalStatus || "unknown";
    };

    return (
        <div>
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Active Bookings</div>
                    <div className="stat-value">{myActiveBookings}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--success)' }}>
                    <div className="stat-label">Available Equipment</div>
                    <div className="stat-value">{availableEquipment}</div>
                </div>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--warning)' }}>
                    <div className="stat-label">My Waitlists</div>
                    <div className="stat-value">{myWaitlists}</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--primary)', color: 'white', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <h5 style={{ marginBottom: '16px', color: 'white' }}>Need Equipment?</h5>
                        <Link to="/equipment" className="btn btn-outline" style={{ background: 'white', color: 'var(--primary)', width: '100%', border: 'none' }}>Browse Catalog</Link>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-body">
                        <h2>My Recent Bookings</h2>
                        <div className="table-responsive" style={{ marginTop: '24px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Equipment</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found.</td></tr>
                                    ) : (
                                        bookings.slice(-5).reverse().map(b => (
                                            <tr key={b.id}>
                                                <td style={{ fontWeight: 600 }}>{b.equipmentName || "Unknown"}</td>
                                                <td>{formatDate(b.startTime)}</td>
                                                <td>{formatTime(b.startTime)} - {formatTime(b.endTime)}</td>
                                                <td>
                                                    <span className={`badge badge-${getBadgeClass(b)}`}>
                                                        {getDisplayStatus(b)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Link to="/bookings" style={{ fontSize: '0.875rem', marginTop: '16px', display: 'inline-block' }}>View all bookings →</Link>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h2>Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                            <Link to="/equipment" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🔍 Browse Equipment
                            </Link>
                            <Link to="/bookings" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                📅 New Booking
                            </Link>
                            <Link to="/waitlist" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                ⏳ My Waitlists
                            </Link>
                            <Link to="/external-bookings" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                                🏛️ External Bookings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
