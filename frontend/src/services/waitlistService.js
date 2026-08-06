import api from "./api";

const defaultWaitlist = [
    {
        id: "wl-1",
        equipmentId: "eq-2",
        equipmentName: "Ender 3 Pro 3D Printer",
        userId: "d8c34b2a-de74-4382-8832-a5392f99cec1",
        userName: "Dev User",
        userEmail: "admin@example.com",
        joinedAt: "2026-08-05T12:00:00Z",
        queuePosition: 1,
        estimatedDays: 2,
        status: "WAITING"
    },
    {
        id: "wl-2",
        equipmentId: "eq-2",
        equipmentName: "Ender 3 Pro 3D Printer",
        userId: "bob-smith-id",
        userName: "Bob Smith",
        userEmail: "bob@example.com",
        joinedAt: "2026-08-05T14:30:00Z",
        queuePosition: 2,
        estimatedDays: 4,
        status: "WAITING"
    },
    {
        id: "wl-3",
        equipmentId: "eq-4",
        equipmentName: "Form 3+ SLA 3D Printer",
        userId: "carol-davis-id",
        userName: "Carol Davis",
        userEmail: "carol@example.com",
        joinedAt: "2026-08-06T09:15:00Z",
        queuePosition: 1,
        estimatedDays: 3,
        status: "WAITING"
    }
];

const isDev = () => localStorage.getItem("devMode") === "true";

const getWaitlistFromStorage = () => {
    const data = localStorage.getItem("mock_waitlist");
    if (!data) {
        localStorage.setItem("mock_waitlist", JSON.stringify(defaultWaitlist));
        return defaultWaitlist;
    }
    return JSON.parse(data);
};

// GET /api/waitlist
export const getWaitlist = async () => {
    if (isDev()) return Promise.resolve(getWaitlistFromStorage());
    const response = await api.get("/waitlist");
    return response.data;
};

// GET /api/waitlist/equipment/{equipmentId}
export const getWaitlistForEquipment = async (equipmentId) => {
    if (isDev()) return Promise.resolve(getWaitlistFromStorage().filter(w => w.equipmentId === equipmentId));
    const response = await api.get(`/waitlist/equipment/${equipmentId}`);
    return response.data;
};

// POST /api/waitlist  { equipmentId, userId, userName, userEmail }
export const joinWaitlist = async (equipmentId, equipmentName, userId, userName, userEmail) => {
    if (isDev()) {
        const list = getWaitlistFromStorage();

        const currentQueue = list.filter(w => w.equipmentId === equipmentId && w.status === "WAITING");
        const nextPosition = currentQueue.length + 1;

        const newEntry = {
            id: `wl-${Math.floor(Math.random() * 100000)}`,
            equipmentId,
            equipmentName,
            userId,
            userName,
            userEmail,
            joinedAt: new Date().toISOString(),
            queuePosition: nextPosition,
            estimatedDays: nextPosition * 2, // assume 2 days wait per queue position
            status: "WAITING"
        };

        list.push(newEntry);
        localStorage.setItem("mock_waitlist", JSON.stringify(list));
        return Promise.resolve(newEntry);
    }
    const response = await api.post("/waitlist", { equipmentId, equipmentName, userId, userName, userEmail });
    return response.data;
};

// DELETE /api/waitlist/{id}
export const leaveWaitlist = async (id) => {
    if (isDev()) {
        const list = getWaitlistFromStorage();
        const target = list.find(w => w.id === id);
        if (!target) return Promise.reject(new Error("Waitlist entry not found"));

        const remaining = list.filter(w => w.id !== id);
        const equipmentId = target.equipmentId;

        let count = 1;
        const recalculated = remaining.map(w => {
            if (w.equipmentId === equipmentId && w.status === "WAITING") {
                return { ...w, queuePosition: count, estimatedDays: count++ * 2 };
            }
            return w;
        });

        localStorage.setItem("mock_waitlist", JSON.stringify(recalculated));
        return Promise.resolve();
    }
    await api.delete(`/waitlist/${id}`);
};

// POST /api/waitlist/equipment/{equipmentId}/allocate
// Allocates the equipment to the person at the head of the queue (called
// automatically whenever equipment transitions back to AVAILABLE, and can
// also be triggered manually by staff from the Allocation Queue panel).
export const autoAllocateWaitlist = async (equipmentId) => {
    if (isDev()) {
        const list = getWaitlistFromStorage();
        const nextIndex = list.findIndex(w => w.equipmentId === equipmentId && w.status === "WAITING" && w.queuePosition === 1);

        if (nextIndex !== -1) {
            const allocated = list[nextIndex];
            list[nextIndex] = { ...allocated, status: "ALLOCATED" };

            let count = 1;
            const recalculated = list.map((w, idx) => {
                if (idx === nextIndex) return w;
                if (w.equipmentId === equipmentId && w.status === "WAITING") {
                    return { ...w, queuePosition: count, estimatedDays: count++ * 2 };
                }
                return w;
            });

            localStorage.setItem("mock_waitlist", JSON.stringify(recalculated));

            const notification = {
                id: `nt-${Math.floor(Math.random() * 100000)}`,
                equipmentName: allocated.equipmentName,
                userName: allocated.userName,
                userEmail: allocated.userEmail,
                message: `Resource Allocated: '${allocated.equipmentName}' has become available and is allocated to you. Queue position cleared!`,
                timestamp: new Date().toISOString()
            };
            const currentNotifications = JSON.parse(localStorage.getItem("mock_waitlist_notifications") || "[]");
            currentNotifications.unshift(notification);
            localStorage.setItem("mock_waitlist_notifications", JSON.stringify(currentNotifications));

            return Promise.resolve(allocated);
        }
        return Promise.resolve(null);
    }
    const response = await api.post(`/waitlist/equipment/${equipmentId}/allocate`);
    return response.data;
};

// GET /api/waitlist/notifications
export const getWaitlistNotifications = async () => {
    if (isDev()) {
        const data = localStorage.getItem("mock_waitlist_notifications");
        return Promise.resolve(data ? JSON.parse(data) : []);
    }
    const response = await api.get("/waitlist/notifications");
    return response.data;
};

// DELETE /api/waitlist/notifications
export const clearNotifications = async () => {
    if (isDev()) {
        localStorage.removeItem("mock_waitlist_notifications");
        return Promise.resolve();
    }
    await api.delete("/waitlist/notifications");
};
