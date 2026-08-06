import { useState, useEffect, useCallback } from "react";
import { getWaitlist, joinWaitlist } from "../services/waitlistService";
import { getEquipment } from "../services/equipmentService";
import { useToast } from "../context/ToastContext";
import WaitlistTable from "../components/WaitlistTable";
import AllocationQueue from "../components/AllocationQueue";
import NotificationPanel from "../components/NotificationPanel";
import ScheduleOptimizer from "../components/ScheduleOptimizer";

export default function Waitlist() {
    const [waitlist, setWaitlist] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const { addToast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [wlData, eqData] = await Promise.all([getWaitlist(), getEquipment()]);
            setWaitlist(wlData || []);
            setEquipmentList(eqData || []);
        } catch (err) {
            console.error(err);
            addToast("Failed to load waitlist data.", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { setTimeout(() => loadData(), 0); }, [loadData]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!selectedEquipmentId) {
            addToast("Please select equipment to join the waitlist for.", "warning");
            return;
        }
        const eq = equipmentList.find(item => item.id === selectedEquipmentId);
        const userId = localStorage.getItem("userId") || "current-user";
        const userName = localStorage.getItem("name") || "Current User";
        const userEmail = localStorage.getItem("email") || "";
        try {
            await joinWaitlist(selectedEquipmentId, eq?.name, userId, userName, userEmail);
            addToast(`Joined waitlist for ${eq?.name}!`, "success");
            setSelectedEquipmentId("");
            await loadData();
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error(err);
            addToast("Failed to join waitlist.", "error");
        }
    };

    const unavailableEquipment = equipmentList.filter(e => e.availabilityStatus !== "AVAILABLE");

    const groupedByEquipment = waitlist.reduce((acc, entry) => {
        if (!acc[entry.equipmentId]) acc[entry.equipmentId] = [];
        acc[entry.equipmentId].push(entry);
        return acc;
    }, {});

    return (
        <div className="animate-fade-in">
            <div className="page-header mb-4">
                <h2>Waitlist Management</h2>
                <p>Join a waitlist for busy equipment and get auto-allocated when it frees up</p>
            </div>

            <form onSubmit={handleJoin} className="glass-card mb-4" style={{ padding: '20px' }}>
                <h5 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Join a Waitlist</h5>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="glass-form-group mb-0" style={{ flex: '1 1 260px' }}>
                        <label>Equipment (currently unavailable)</label>
                        <select className="glass-select" value={selectedEquipmentId} onChange={(e) => setSelectedEquipmentId(e.target.value)}>
                            <option value="">Select Equipment</option>
                            {unavailableEquipment.map(eq => (
                                <option key={eq.id} value={eq.id}>{eq.name} ({eq.availabilityStatus})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="glass-btn">Join Waitlist</button>
                </div>
            </form>

            {loading ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading waitlist...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
                    <div>
                        <ScheduleOptimizer equipmentList={equipmentList} />
                        <WaitlistTable entries={waitlist} onRefresh={() => { loadData(); setRefreshKey(k => k + 1); }} />
                        <AllocationQueue groupedByEquipment={groupedByEquipment} onRefresh={() => { loadData(); setRefreshKey(k => k + 1); }} />
                    </div>
                    <NotificationPanel refreshKey={refreshKey} />
                </div>
            )}
        </div>
    );
}
