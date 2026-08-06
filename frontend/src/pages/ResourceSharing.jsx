import { useState, useEffect, useCallback } from "react";
import { getSharingRequests, deleteSharingRequest } from "../services/sharingService";
import { getEquipment } from "../services/equipmentService";
import { useToast } from "../context/ToastContext";
import ShareEquipmentForm from "../components/ShareEquipmentForm";
import IncomingRequests from "../components/IncomingRequests";
import OutgoingRequests from "../components/OutgoingRequests";
import SharingHistory from "../components/SharingHistory";

const getMyInstitutionId = () => localStorage.getItem("institutionId") || "62e07288-28d8-4d7f-b2ce-40a322cc6654";

export default function ResourceSharing() {
    const [requests, setRequests] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("incoming");
    const { addToast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [reqData, eqData] = await Promise.all([getSharingRequests(), getEquipment()]);
            setRequests(reqData || []);
            setEquipmentList(eqData || []);
        } catch (err) {
            console.error(err);
            addToast("Failed to load resource sharing data.", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => { setTimeout(() => loadData(), 0); }, [loadData]);

    const myInstitutionId = getMyInstitutionId();

    const incomingRequests = requests.filter(r => r.ownerInstitutionId === myInstitutionId && r.status === "PENDING");
    const outgoingRequests = requests.filter(r => r.requesterInstitutionId === myInstitutionId && r.status === "PENDING");
    const historyRequests = requests.filter(r => ["APPROVED", "REJECTED", "COMPLETED"].includes(r.status));

    const shareableEquipment = equipmentList.filter(
        e => e.availabilityStatus === "AVAILABLE" && e.institutionId !== myInstitutionId
    );

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === "PENDING").length,
        approved: requests.filter(r => r.status === "APPROVED").length,
        rejected: requests.filter(r => r.status === "REJECTED").length,
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Cancel this sharing request?")) return;
        try {
            await deleteSharingRequest(id);
            addToast("Sharing request cancelled.");
            await loadData();
        } catch (err) {
            console.error(err);
            addToast("Failed to cancel request.", "error");
        }
    };

    const tabs = [
        { key: "incoming", label: `Incoming (${incomingRequests.length})` },
        { key: "outgoing", label: `Outgoing (${outgoingRequests.length})` },
        { key: "history", label: `History (${historyRequests.length})` }
    ];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Inter-Institution Resource Sharing</h2>
                    <p>Share equipment across institutions and manage sharing requests</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Requests</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.total}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #fbbf24' }}>
                    <span style={{ fontSize: '12px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.pending}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #34d399' }}>
                    <span style={{ fontSize: '12px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.approved}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '3px solid #f87171' }}>
                    <span style={{ fontSize: '12px', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rejected</span>
                    <span style={{ display: 'block', fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.rejected}</span>
                </div>
            </div>

            <ShareEquipmentForm onRequestCreated={loadData} />

            <div className="glass-card mb-4">
                <h5 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Shareable Equipment from Other Institutions</h5>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading...</div>
                ) : shareableEquipment.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                        {shareableEquipment.map(eq => (
                            <div key={eq.id} className="glass-card" style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong>{eq.name}</strong>
                                    <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px' }}>Available</span>
                                </div>
                                <small style={{ color: 'var(--text-muted)' }}>{eq.institutionName}</small>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No shareable equipment available from other institutions right now.</div>
                )}
            </div>

            <div className="glass-card" style={{ padding: '12px 20px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className="glass-btn"
                        style={{
                            background: activeTab === tab.key ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab.key ? '#60a5fa' : 'var(--text-muted)',
                            fontSize: '13px'
                        }}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "incoming" && <IncomingRequests requests={incomingRequests} onRefresh={loadData} />}
            {activeTab === "outgoing" && <OutgoingRequests requests={outgoingRequests} onCancel={handleCancel} />}
            {activeTab === "history" && <SharingHistory requests={historyRequests} />}
        </div>
    );
}
