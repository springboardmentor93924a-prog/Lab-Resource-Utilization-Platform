import api from "./api";

const isDev = () => localStorage.getItem("devMode") === "true";

const mockIdleEquipment = [
    { id: "idle-1", name: "Form 3+ SLA 3D Printer", institutionName: "MIT University", idleDays: 14, recommendation: "Initiate inter-institution sharing with DY Patil Optics Lab." },
    { id: "idle-2", name: "Digital Microscope CX23", institutionName: "DY Patil International University", idleDays: 12, recommendation: "Perform scheduled cleaning, or rent out to BioTech Labs." },
    { id: "idle-3", name: "High-Speed Centrifuge", institutionName: "MIT University", idleDays: 10, recommendation: "List on shared resource page for internal biology department." },
    { id: "idle-4", name: "Thermal Cycler PCR", institutionName: "DY Patil International University", idleDays: 8, recommendation: "Calibrate and transfer to active genetic research group." }
];

const mockHourlyUtilization = [
    { hour: "08:00", rate: 20 },
    { hour: "10:00", rate: 55 },
    { hour: "12:00", rate: 85 },
    { hour: "14:00", rate: 90 },
    { hour: "16:00", rate: 70 },
    { hour: "18:00", rate: 40 },
    { hour: "20:00", rate: 15 }
];

const mockDailyUtilization = [
    { day: "Mon", rate: 72 },
    { day: "Tue", rate: 78 },
    { day: "Wed", rate: 82 },
    { day: "Thu", rate: 80 },
    { day: "Fri", rate: 68 },
    { day: "Sat", rate: 25 },
    { day: "Sun", rate: 12 }
];

const mockDemandTrends = [
    { name: "Microscopy Equipment", bookings: 142, hours: 560 },
    { name: "3D Printers", bookings: 98, hours: 380 },
    { name: "Centrifuges", bookings: 65, hours: 240 },
    { name: "Thermal Cyclers", bookings: 50, hours: 180 }
];

const mockHeatmap = {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    hours: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
    matrix: [
        [20, 50, 80, 85, 60, 40, 10],
        [25, 65, 85, 90, 70, 45, 15],
        [30, 70, 90, 95, 75, 50, 20],
        [20, 60, 85, 80, 65, 40, 10],
        [15, 55, 75, 70, 60, 35, 10],
        [5, 15, 25, 20, 15, 10, 5],
        [2, 5, 10, 8, 5, 2, 0]
    ]
};

// GET /api/analytics/idle-equipment
export const getIdleEquipment = async () => {
    if (isDev()) return Promise.resolve(mockIdleEquipment);
    const response = await api.get("/analytics/idle-equipment");
    return response.data;
};

// GET /api/analytics/stats
export const getAnalyticsStats = async () => {
    if (isDev()) {
        return Promise.resolve({
            totalEquipment: 85,
            availableCount: 45,
            inUseCount: 25,
            maintenanceCount: 15,
            utilizationRate: 74,
            totalUsageHours: 1450,
            idleHours: 320,
            hourlyUtilization: mockHourlyUtilization,
            dailyUtilization: mockDailyUtilization,
            demandTrends: mockDemandTrends,
            peakUsageTime: "12:00 PM - 03:00 PM",
            frequentlyRequested: "Digital Microscope CX23",
            bookingFrequency: "Moderate-High"
        });
    }
    const response = await api.get("/analytics/stats");
    return response.data;
};

// GET /api/analytics/heatmap
// Day x hour utilization grid backing the Utilization Heatmap widget.
export const getUtilizationHeatmap = async () => {
    if (isDev()) return Promise.resolve(mockHeatmap);
    const response = await api.get("/analytics/heatmap");
    return response.data;
};

// GET /api/analytics/optimal-slots/{equipmentId}
// Recommends the lowest-utilization windows for a piece of equipment so
// bookings can be steered away from already-busy peaks -- this is what
// powers the "reduce idle time / maximize usage" schedule optimizer.
export const getOptimalBookingSlots = async (equipmentId) => {
    if (isDev()) {
        const { days, hours, matrix } = mockHeatmap;
        const slots = [];
        days.forEach((day, dayIdx) => {
            hours.forEach((hour, hourIdx) => {
                slots.push({ day, hour, utilization: matrix[dayIdx][hourIdx] });
            });
        });
        // Lowest utilization first = best opportunity to book without
        // clashing with peak demand, while still favoring waking hours.
        const ranked = slots
            .filter(s => s.utilization < 50)
            .sort((a, b) => a.utilization - b.utilization)
            .slice(0, 5);
        return Promise.resolve({ equipmentId, recommendedSlots: ranked });
    }
    const response = await api.get(`/analytics/optimal-slots/${equipmentId}`);
    return response.data;
};
