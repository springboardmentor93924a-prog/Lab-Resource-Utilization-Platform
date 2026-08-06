import api from "./api";

const mockDashboard = {
    totalUsers: 142,
    totalInstitutions: 5,
    totalDepartments: 28,
    totalEquipment: 85,
    availableEquipment: 60,
    bookedEquipment: 25,
    totalBookings: 320,
    pendingBookings: 12,
    approvedBookings: 308,
    recentBookings: [
        { id: 101, userName: "Alice Johnson", equipmentName: "Microscope X1", bookingDate: "2026-08-01", status: "APPROVED" },
        { id: 102, userName: "Bob Smith", equipmentName: "Centrifuge 5000", bookingDate: "2026-08-01", status: "PENDING" },
        { id: 103, userName: "Carol Davis", equipmentName: "Oscilloscope Pro", bookingDate: "2026-07-30", status: "APPROVED" },
        { id: 104, userName: "Dave Wilson", equipmentName: "Spectrometer", bookingDate: "2026-07-29", status: "APPROVED" },
    ],
    utilizationTrends: [
        { name: "Jan", bookings: 45, usageHours: 120 },
        { name: "Feb", bookings: 52, usageHours: 150 },
        { name: "Mar", bookings: 38, usageHours: 110 },
        { name: "Apr", bookings: 65, usageHours: 180 },
        { name: "May", bookings: 80, usageHours: 240 },
        { name: "Jun", bookings: 75, usageHours: 210 }
    ],
    equipmentDistribution: [
        { name: "Available", value: 60, color: "#34d399" },
        { name: "Booked", value: 20, color: "#fbbf24" },
        { name: "Maintenance", value: 5, color: "#f87171" }
    ],
    resourceSharingRequests: 8,
    waitlistCount: 3,
    idleEquipmentCount: 4,
    recentActivities: [
        { id: "act-1", type: "BOOKING", message: "Bob Smith booked Centrifuge 5000", timestamp: "2026-08-06T09:10:00Z" },
        { id: "act-2", type: "SHARING", message: "MIT University requested Digital Microscope CX23", timestamp: "2026-08-06T08:40:00Z" },
        { id: "act-3", type: "WAITLIST", message: "Carol Davis joined the waitlist for Form 3+ SLA 3D Printer", timestamp: "2026-08-06T07:55:00Z" },
        { id: "act-4", type: "MAINTENANCE", message: "Form 3+ SLA 3D Printer flagged for maintenance", timestamp: "2026-08-05T16:20:00Z" },
        { id: "act-5", type: "BOOKING", message: "External booking approved for BioTech Research Labs", timestamp: "2026-08-05T14:05:00Z" }
    ]
};

export const getDashboard = async () => {
    if (localStorage.getItem("devMode") === "true") {
        return Promise.resolve(mockDashboard);
    }
    const response = await api.get("/dashboard");
    return response.data;
};