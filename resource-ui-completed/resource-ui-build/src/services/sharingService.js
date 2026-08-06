import api from "./api";

const defaultSharingRequests = [
    {
        id: "sr-1",
        equipmentId: "eq-1",
        equipmentName: "Digital Microscope CX23",
        requesterInstitutionId: "inst-2",
        requesterInstitutionName: "MIT University",
        ownerInstitutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654",
        ownerInstitutionName: "DY Patil International University",
        requestedBy: "Bob Smith",
        startDate: "2026-08-10",
        endDate: "2026-08-15",
        status: "PENDING",
        purpose: "Research study on soil microbes"
    },
    {
        id: "sr-2",
        equipmentId: "eq-2",
        equipmentName: "Ender 3 Pro 3D Printer",
        requesterInstitutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654",
        requesterInstitutionName: "DY Patil International University",
        ownerInstitutionId: "inst-2",
        ownerInstitutionName: "MIT University",
        requestedBy: "Alice Johnson",
        startDate: "2026-08-01",
        endDate: "2026-08-05",
        status: "APPROVED",
        purpose: "Rapid prototyping mechanical gears"
    }
];

const isDev = () => localStorage.getItem("devMode") === "true";

const getRequestsFromStorage = () => {
    const data = localStorage.getItem("mock_sharing_requests");
    if (!data) {
        localStorage.setItem("mock_sharing_requests", JSON.stringify(defaultSharingRequests));
        return defaultSharingRequests;
    }
    return JSON.parse(data);
};

// GET /api/sharing-requests
export const getSharingRequests = async () => {
    if (isDev()) return Promise.resolve(getRequestsFromStorage());
    const response = await api.get("/sharing-requests");
    return response.data;
};

// GET /api/sharing-requests/{id}
export const getSharingRequestById = async (id) => {
    if (isDev()) return Promise.resolve(getRequestsFromStorage().find(r => r.id === id));
    const response = await api.get(`/sharing-requests/${id}`);
    return response.data;
};

// GET /api/equipment/shareable?excludeInstitutionId=...
// Equipment from other institutions that is currently AVAILABLE and marked shareable.
export const getShareableEquipment = async (excludeInstitutionId) => {
    if (isDev()) return Promise.resolve([]);
    const response = await api.get("/equipment/shareable", {
        params: excludeInstitutionId ? { excludeInstitutionId } : undefined
    });
    return response.data;
};

// POST /api/sharing-requests
export const createSharingRequest = async (request) => {
    if (isDev()) {
        const list = getRequestsFromStorage();
        const newRequest = {
            id: `sr-${Math.floor(Math.random() * 100000)}`,
            status: "PENDING",
            ...request
        };
        list.unshift(newRequest);
        localStorage.setItem("mock_sharing_requests", JSON.stringify(list));
        return Promise.resolve(newRequest);
    }
    const response = await api.post("/sharing-requests", request);
    return response.data;
};

// PATCH /api/sharing-requests/{id}/status  { status: "APPROVED" | "REJECTED" | "COMPLETED" }
export const updateSharingRequestStatus = async (id, status) => {
    if (isDev()) {
        const list = getRequestsFromStorage();
        const index = list.findIndex(r => r.id === id);
        if (index === -1) return Promise.reject(new Error("Request not found"));
        list[index] = { ...list[index], status };
        localStorage.setItem("mock_sharing_requests", JSON.stringify(list));
        return Promise.resolve(list[index]);
    }
    const response = await api.patch(`/sharing-requests/${id}/status`, { status });
    return response.data;
};

// DELETE /api/sharing-requests/{id}
export const deleteSharingRequest = async (id) => {
    if (isDev()) {
        const list = getRequestsFromStorage();
        const updated = list.filter(r => r.id !== id);
        localStorage.setItem("mock_sharing_requests", JSON.stringify(updated));
        return Promise.resolve();
    }
    await api.delete(`/sharing-requests/${id}`);
};
