import { useState, useEffect, useRef } from "react";
import { getEquipment } from "../services/equipmentService";
import { getCategories } from "../services/categoryService";
import { getInstitutions } from "../services/institutionService";
import { useToast } from "../context/ToastContext";
import EquipmentCard from "../components/EquipmentCard";

export default function EquipmentTracking() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterInstitution, setFilterInstitution] = useState("");

    // Live update settings
    const [liveUpdates, setLiveUpdates] = useState(true);
    const [recentlyUpdatedId, setRecentlyUpdatedId] = useState(null);

    const { addToast } = useToast();
    const intervalRef = useRef(null);

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [eqData, catData, instData] = await Promise.all([
                    getEquipment(),
                    getCategories(),
                    getInstitutions()
                ]);
                setEquipmentList(eqData || []);
                setCategories(catData || []);
                setInstitutions(instData || []);
            } catch (err) {
                console.error("Error loading tracking data:", err);
                setError("Failed to load tracking data.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Live Status Simulation Interval
    useEffect(() => {
        if (!liveUpdates || equipmentList.length === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            // Select random equipment
            const randomIndex = Math.floor(Math.random() * equipmentList.length);
            const selectedItem = equipmentList[randomIndex];

            // Define statuses
            const statuses = ["AVAILABLE", "IN_USE", "BOOKED", "MAINTENANCE"];
            
            // Filter out current status to force a change
            const availableNewStatuses = statuses.filter(s => s !== selectedItem.availabilityStatus);
            const randomStatus = availableNewStatuses[Math.floor(Math.random() * availableNewStatuses.length)];

            // Update item in state
            setEquipmentList(prevList => {
                const newList = [...prevList];
                newList[randomIndex] = {
                    ...selectedItem,
                    availabilityStatus: randomStatus
                };
                return newList;
            });

            // Set recently updated ID to highlight the card
            setRecentlyUpdatedId(selectedItem.id);
            
            // Format status label for toast
            const formatStatus = (s) => {
                return s.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            };

            // Trigger notification toast
            addToast(`Live: '${selectedItem.name}' is now ${formatStatus(randomStatus)}.`, "info");

            // Reset glow after 3 seconds
            setTimeout(() => {
                setRecentlyUpdatedId(null);
            }, 3000);

        }, 8000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [liveUpdates, equipmentList, addToast]);

    // Derived Statistics
    const stats = {
        total: equipmentList.length,
        available: equipmentList.filter(e => e.availabilityStatus === "AVAILABLE").length,
        inUse: equipmentList.filter(e => e.availabilityStatus === "IN_USE").length,
        booked: equipmentList.filter(e => e.availabilityStatus === "BOOKED").length,
        maintenance: equipmentList.filter(e => e.availabilityStatus === "MAINTENANCE").length
    };

    // Filter Logic
    const filteredEquipment = equipmentList.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (e.modelNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (e.serialNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus ? e.availabilityStatus === filterStatus : true;
        const matchesCategory = filterCategory ? e.categoryId === filterCategory : true;
        const matchesInstitution = filterInstitution ? e.institutionId === filterInstitution : true;
        
        return matchesSearch && matchesStatus && matchesCategory && matchesInstitution;
    });

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2>Live Equipment Tracking</h2>
                    <p>Monitor assets utilization and availability across labs in real time</p>
                </div>
                
                {/* Real-time simulation toggle */}
                <div className="glass-card d-flex align-items-center gap-3" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: liveUpdates ? '#10b981' : '#ef4444', display: 'inline-block', animation: liveUpdates ? 'pulse-live 1s infinite' : 'none' }}></span>
                        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', cursor: 'pointer', margin: 0 }} htmlFor="liveToggle">
                            {liveUpdates ? "Live Updates: Active" : "Live Updates: Paused"}
                        </label>
                    </div>
                    <label className="switch" style={{ margin: 0 }}>
                        <input 
                            type="checkbox" 
                            id="liveToggle"
                            checked={liveUpdates} 
                            onChange={(e) => setLiveUpdates(e.target.checked)} 
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {error && <div className="pro-alert mb-4">{error}</div>}

            {/* Stats Cards Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Assets</span>
                    <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.total}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', borderLeft: '3px solid #34d399' }}>
                    <span style={{ fontSize: '12px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available</span>
                    <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.available}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', borderLeft: '3px solid #60a5fa' }}>
                    <span style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Use</span>
                    <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.inUse}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', borderLeft: '3px solid #fbbf24' }}>
                    <span style={{ fontSize: '12px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booked</span>
                    <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.booked}</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', borderLeft: '3px solid #f87171' }}>
                    <span style={{ fontSize: '12px', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maintenance</span>
                    <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px' }}>{stats.maintenance}</span>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '35px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                    <div className="glass-form-group mb-0">
                        <label>Search Asset</label>
                        <input 
                            type="text" 
                            className="glass-input" 
                            placeholder="Name, model, or serial no..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="glass-form-group mb-0">
                        <label>Filter by Status</label>
                        <select 
                            className="glass-select" 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="IN_USE">In Use</option>
                            <option value="BOOKED">Booked</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </div>

                    <div className="glass-form-group mb-0">
                        <label>Filter by Institution</label>
                        <select 
                            className="glass-select" 
                            value={filterInstitution}
                            onChange={(e) => setFilterInstitution(e.target.value)}
                        >
                            <option value="">All Institutions</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="glass-form-group mb-0">
                        <label>Filter by Category</label>
                        <select 
                            className="glass-select" 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Equipment Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    Loading real-time equipment data...
                </div>
            ) : filteredEquipment.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                    {filteredEquipment.map(eq => (
                        <EquipmentCard 
                            key={eq.id} 
                            equipment={eq} 
                            isRecentUpdate={eq.id === recentlyUpdatedId}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-card text-center" style={{ padding: '60px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)', marginBottom: '15px' }}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    <h5 style={{ color: 'var(--text-main)' }}>No assets found matching filters</h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '5px 0 0 0' }}>Adjust or reset search and filters to view tracking items.</p>
                </div>
            )}

            {/* Keyframe Styling */}
            <style>{`
                @keyframes pulse-live {
                    0% { transform: scale(0.9); opacity: 0.6; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.9); opacity: 0.6; }
                }
                @keyframes pulse {
                    0% { opacity: 0.7; }
                    50% { opacity: 1; }
                    100% { opacity: 0.7; }
                }
                .glow-update {
                    animation: glowEffect 1.5s ease-in-out infinite alternate;
                }
                @keyframes glowEffect {
                    from {
                        border-color: rgba(59, 130, 246, 0.4);
                        box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
                    }
                    to {
                        border-color: rgba(59, 130, 246, 0.9);
                        box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
                    }
                }
            `}</style>
        </div>
    );
}
