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
    ]
};

export const getDashboard = async () => {
    if (localStorage.getItem("devMode") === "true") {
        return Promise.resolve(mockDashboard);
    }
    const response = await api.get("/dashboard");
    return response.data;
};