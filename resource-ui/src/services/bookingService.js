import api from "./api";

const mockBookings = [
    { 
        id: "b1", 
        userId: "d8c34b2a-de74-4382-8832-a5392f99cec1", 
        userName: "Dev User", 
        equipmentId: "56354298-9993-43e6-9501-788ac8d69539", 
        equipmentName: "Digital Microscope", 
        startTime: "2026-08-01T09:00:00", 
        endTime: "2026-08-01T11:00:00", 
        purpose: "Research Project Alpha",
        status: "APPROVED" 
    },
    { 
        id: "b2", 
        userId: "d8c34b2a-de74-4382-8832-a5392f99cec1", 
        userName: "Dev User", 
        equipmentId: "56354298-9993-43e6-9501-788ac8d69539", 
        equipmentName: "Digital Microscope", 
        startTime: "2026-08-02T13:00:00", 
        endTime: "2026-08-02T15:00:00", 
        purpose: "Training",
        status: "PENDING" 
    }
];

const isDev = () => localStorage.getItem("devMode") === "true";

export const getBookings = async () => {
    if (isDev()) return Promise.resolve(mockBookings);
    const response = await api.get("/bookings");
    return response.data;
};

export const getBookingById = async (id) => {
    if (isDev()) return Promise.resolve(mockBookings.find(b => b.id === id));
    const response = await api.get(`/bookings/${id}`);
    return response.data;
};

export const createBooking = async (data) => {
    if (isDev()) return Promise.resolve({ id: "mock-" + Date.now(), ...data, status: "PENDING" });
    const response = await api.post("/bookings", data);
    return response.data;
};

export const updateBooking = async (id, data) => {
    if (isDev()) return Promise.resolve({ id, ...data });
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
};

export const deleteBooking = async (id) => {
    if (isDev()) return Promise.resolve();
    await api.delete(`/bookings/${id}`);
};

export const approveBooking = async (id) => {
    if (isDev()) return Promise.resolve({ id, status: "APPROVED" });
    const response = await api.patch(`/bookings/${id}/approve`);
    return response.data;
};

export const rejectBooking = async (id) => {
    if (isDev()) return Promise.resolve({ id, status: "REJECTED" });
    const response = await api.patch(`/bookings/${id}/reject`);
    return response.data;
};

export const cancelBooking = async (id) => {
    if (isDev()) return Promise.resolve({ id, status: "CANCELLED" });
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
};