import { useState, useEffect } from "react";
import { getEquipment } from "../services/equipmentService";
import { createExternalBooking, findBookingConflict } from "../services/externalBookingService";
import { useToast } from "../context/ToastContext";

export default function BookingForm({ existingBookings, onBookingCreated }) {
    const [equipmentList, setEquipmentList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [form, setForm] = useState({
        equipmentId: "", externalOrganization: "", contactPerson: "", email: "",
        startDate: "", endDate: "", purpose: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const eq = await getEquipment();
                setEquipmentList(eq || []);
            } catch (err) {
                console.error("Failed to load equipment:", err);
            }
        };
        load();
    }, []);

    const filteredEquipment = equipmentList.filter(eq =>
        eq.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedEquipment = equipmentList.find(eq => eq.id === form.equipmentId);
    const bookedRangesForSelected = (existingBookings || []).filter(
        b => b.equipmentId === form.equipmentId && b.status !== "REJECTED"
    );

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.equipmentId || !form.externalOrganization || !form.contactPerson || !form.email || !form.startDate || !form.endDate) {
            addToast("Please fill in all required fields", "warning");
            return;
        }
        if (new Date(form.endDate) < new Date(form.startDate)) {
            addToast("End date cannot be before the start date.", "warning");
            return;
        }
        // Block double booking client-side before ever hitting the API,
        // using whatever booking list is already loaded (mock or real).
        const conflict = findBookingConflict(existingBookings, form.equipmentId, form.startDate, form.endDate);
        if (conflict) {
            addToast(
                `This equipment is already ${conflict.status.toLowerCase()} from ${conflict.startDate} to ${conflict.endDate}. Choose a different slot.`,
                "error"
            );
            return;
        }
        setSubmitting(true);
        try {
            await createExternalBooking({
                equipmentId: form.equipmentId,
                equipmentName: selectedEquipment?.name,
                externalOrganization: form.externalOrganization,
                contactPerson: form.contactPerson,
                email: form.email,
                startDate: form.startDate,
                endDate: form.endDate,
                purpose: form.purpose
            });
            addToast("External booking request submitted!", "success");
            setForm({ equipmentId: "", externalOrganization: "", contactPerson: "", email: "", startDate: "", endDate: "", purpose: "" });
            if (onBookingCreated) onBookingCreated();
        } catch (err) {
            console.error(err);
            addToast(err.message || "Failed to create booking.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card mb-4" style={{ padding: '20px' }}>
            <h5 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>New External Booking Request</h5>

            <div className="glass-form-group">
                <label>Search Equipment</label>
                <input
                    type="text"
                    className="glass-input"
                    placeholder="Search by equipment name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="glass-form-group mb-0">
                    <label>Equipment *</label>
                    <select className="glass-select" name="equipmentId" value={form.equipmentId} onChange={handleChange} required>
                        <option value="">Select Equipment</option>
                        {filteredEquipment.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.name} ({eq.institutionName})</option>
                        ))}
                    </select>
                </div>
                <div className="glass-form-group mb-0">
                    <label>External Organization *</label>
                    <input type="text" className="glass-input" name="externalOrganization" value={form.externalOrganization} onChange={handleChange} required placeholder="e.g. BioTech Research Labs" />
                </div>
                <div className="glass-form-group mb-0">
                    <label>Contact Person *</label>
                    <input type="text" className="glass-input" name="contactPerson" value={form.contactPerson} onChange={handleChange} required placeholder="e.g. Dr. Rachel Green" />
                </div>
                <div className="glass-form-group mb-0">
                    <label>Email *</label>
                    <input type="email" className="glass-input" name="email" value={form.email} onChange={handleChange} required placeholder="contact@organization.com" />
                </div>
                <div className="glass-form-group mb-0">
                    <label>Start Date *</label>
                    <input type="date" className="glass-input" name="startDate" value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="glass-form-group mb-0">
                    <label>End Date *</label>
                    <input type="date" className="glass-input" name="endDate" value={form.endDate} onChange={handleChange} required />
                </div>
            </div>

            <div className="glass-form-group mt-3">
                <label>Purpose</label>
                <textarea className="glass-input" rows="2" name="purpose" value={form.purpose} onChange={handleChange} placeholder="Reason for external booking..." />
            </div>

            {selectedEquipment && bookedRangesForSelected.length > 0 && (
                <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '12px', color: '#fbbf24' }}>Existing bookings / availability for {selectedEquipment.name}:</strong>
                    <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                        {bookedRangesForSelected.map(b => (
                            <li key={b.id}>{b.startDate} to {b.endDate} &mdash; {b.status}</li>
                        ))}
                    </ul>
                </div>
            )}

            <button type="submit" className="glass-btn mt-3" disabled={submitting}>
                {submitting ? "Checking availability..." : "Book Equipment"}
            </button>
        </form>
    );
}
