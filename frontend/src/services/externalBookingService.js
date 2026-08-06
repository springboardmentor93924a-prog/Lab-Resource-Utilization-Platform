import api from "./api";

const defaultExternalBookings = [
    {
        id: "eb-1",
        equipmentId: "eq-1",
        equipmentName: "Digital Microscope CX23",
        externalOrganization: "BioTech Research Labs",
        contactPerson: "Dr. Rachel Green",
        email: "rachel@biotech.com",
        startDate: "2026-08-12",
        endDate: "2026-08-14",
        status: "APPROVED",
        purpose: "Urgent biopsy analysis"
    },
    {
        id: "eb-2",
        equipmentId: "eq-3",
        equipmentName: "Fluorescence Microscope",
        externalOrganization: "Apex Clinical Diagnostics",
        contactPerson: "Dr. Bruce Wayne",
        email: "bruce@apex.org",
        startDate: "2026-08-05",
        endDate: "2026-08-07",
        status: "COMPLETED",
        purpose: "Pathological scan validation"
    }
];

const isDev = () => localStorage.getItem("devMode") === "true";

const getBookingsFromStorage = () => {
    const data = localStorage.getItem("mock_external_bookings");
    if (!data) {
        localStorage.setItem("mock_external_bookings", JSON.stringify(defaultExternalBookings));
        return defaultExternalBookings;
    }
    return JSON.parse(data);
};

// Shared overlap-detection helper used both here (mock safety net) and by the
// booking forms (UI-level blocking check) so double booking is prevented
// regardless of whether the app is talking to the mock store or the real API.
export const findBookingConflict = (bookings, equipmentId, startDate, endDate, ignoreId) => {
    const newStart = new Date(startDate).getTime();
    const newEnd = new Date(endDate).getTime();
    if (Number.isNaN(newStart) || Number.isNaN(newEnd)) return null;

    return (bookings || []).find(existing => {
        if (existing.equipmentId !== equipmentId) return false;
        if (ignoreId && existing.id === ignoreId) return false;
        if (["REJECTED", "CANCELLED"].includes(existing.status)) return false;

        const existingStart = new Date(existing.startDate || existing.startTime).getTime();
        const existingEnd = new Date(existing.endDate || existing.endTime).getTime();

        return newStart <= existingEnd && newEnd >= existingStart;
    }) || null;
};

// GET /api/external-bookings
export const getExternalBookings = async () => {
    if (isDev()) return Promise.resolve(getBookingsFromStorage());
    const response = await api.get("/external-bookings");
    return response.data;
};

// GET /api/external-bookings/{id}
export const getExternalBookingById = async (id) => {
    if (isDev()) return Promise.resolve(getBookingsFromStorage().find(b => b.id === id));
    const response = await api.get(`/external-bookings/${id}`);
    return response.data;
};

// POST /api/external-bookings
export const createExternalBooking = async (booking) => {
    if (isDev()) {
        const list = getBookingsFromStorage();

        const conflict = findBookingConflict(list, booking.equipmentId, booking.startDate, booking.endDate);
        if (conflict) {
            return Promise.reject(new Error(
                `Double booking blocked: this equipment is already ${conflict.status.toLowerCase()} from ${conflict.startDate} to ${conflict.endDate}.`
            ));
        }

        const newBooking = {
            id: `eb-${Math.floor(Math.random() * 100000)}`,
            status: "PENDING",
            ...booking
        };
        list.unshift(newBooking);
        localStorage.setItem("mock_external_bookings", JSON.stringify(list));
        return Promise.resolve(newBooking);
    }
    // The backend performs the authoritative overlap check; it should
    // respond 409 Conflict when the requested slot is already taken.
    const response = await api.post("/external-bookings", booking);
    return response.data;
};

// PATCH /api/external-bookings/{id}/status  { status }
export const updateExternalBookingStatus = async (id, status) => {
    if (isDev()) {
        const list = getBookingsFromStorage();
        const index = list.findIndex(b => b.id === id);
        if (index === -1) return Promise.reject(new Error("Booking not found"));
        list[index] = { ...list[index], status };
        localStorage.setItem("mock_external_bookings", JSON.stringify(list));
        return Promise.resolve(list[index]);
    }
    const response = await api.patch(`/external-bookings/${id}/status`, { status });
    return response.data;
};

// DELETE /api/external-bookings/{id}
export const deleteExternalBooking = async (id) => {
    if (isDev()) {
        const list = getBookingsFromStorage();
        const updated = list.filter(b => b.id !== id);
        localStorage.setItem("mock_external_bookings", JSON.stringify(updated));
        return Promise.resolve();
    }
    await api.delete(`/external-bookings/${id}`);
};
