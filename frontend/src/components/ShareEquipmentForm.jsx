import { useState, useEffect } from "react";
import { getEquipment } from "../services/equipmentService";
import { getInstitutions } from "../services/institutionService";
import { createSharingRequest } from "../services/sharingService";
import { useToast } from "../context/ToastContext";

export default function ShareEquipmentForm({ onRequestCreated }) {
    const [equipmentList, setEquipmentList] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [form, setForm] = useState({
        equipmentId: "",
        targetInstitutionId: "",
        startDate: "",
        endDate: "",
        purpose: ""
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [eq, inst] = await Promise.all([getEquipment(), getInstitutions()]);
                // Filter out items already in use or maintenance if needed, but let's show all
                setEquipmentList(eq || []);
                setInstitutions(inst || []);
            } catch (err) {
                console.error("Failed to load form data:", err);
            }
        };
        loadFormData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.equipmentId || !form.targetInstitutionId || !form.startDate || !form.endDate) {
            addToast("Please fill in all required fields", "warning");
            return;
        }

        setLoading(true);
        try {
            const selectedEq = equipmentList.find(item => item.id === form.equipmentId);
            const selectedInst = institutions.find(item => item.id === form.targetInstitutionId);
            const currentInstId = localStorage.getItem("institutionId") || "62e07288-28d8-4d7f-b2ce-40a322cc6654";
            const currentInstName = "DY Patil International University"; // default name for current user
            const userName = localStorage.getItem("name") || "Admin User";

            await createSharingRequest({
                equipmentId: selectedEq.id,
                equipmentName: selectedEq.name,
                requesterInstitutionId: currentInstId,
                requesterInstitutionName: currentInstName,
                ownerInstitutionId: selectedInst.id,
                ownerInstitutionName: selectedInst.name,
                requestedBy: userName,
                startDate: form.startDate,
                endDate: form.endDate,
                purpose: form.purpose
            });

            addToast("Sharing request submitted successfully!", "success");
            setForm({
                equipmentId: "",
                targetInstitutionId: "",
                startDate: "",
                endDate: "",
                purpose: ""
            });
            if (onRequestCreated) onRequestCreated();
        } catch (err) {
            console.error(err);
            addToast("Failed to create sharing request.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card mb-4" style={{ padding: '20px' }}>
            <h5 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '15px', fontWeight: '600' }}>Request Equipment from Another Lab</h5>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="glass-form-group mb-0">
                    <label>Select Equipment *</label>
                    <select 
                        className="glass-select" 
                        value={form.equipmentId}
                        onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
                        required
                    >
                        <option value="">Select Equipment</option>
                        {equipmentList.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.name} ({eq.institutionName})</option>
                        ))}
                    </select>
                </div>

                <div className="glass-form-group mb-0">
                    <label>Owner Institution *</label>
                    <select 
                        className="glass-select" 
                        value={form.targetInstitutionId}
                        onChange={(e) => setForm({ ...form, targetInstitutionId: e.target.value })}
                        required
                    >
                        <option value="">Select Institution</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>

                <div className="glass-form-group mb-0">
                    <label>Start Date *</label>
                    <input 
                        type="date" 
                        className="glass-input" 
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        required 
                    />
                </div>

                <div className="glass-form-group mb-0">
                    <label>End Date *</label>
                    <input 
                        type="date" 
                        className="glass-input" 
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        required 
                    />
                </div>
            </div>

            <div className="glass-form-group mt-3">
                <label>Purpose / Research Objectives</label>
                <textarea 
                    className="glass-input" 
                    rows="2"
                    placeholder="Describe how the equipment will be utilized..."
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
            </div>

            <button type="submit" className="glass-btn mt-2" disabled={loading}>
                {loading ? "Submitting..." : "Send Request"}
            </button>
        </form>
    );
}
