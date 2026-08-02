import api from "./api";

const mockEquipment = [
    { 
        id: "56354298-9993-43e6-9501-788ac8d69539", 
        name: "Digital Microscope", 
        description: "High-resolution microscope for laboratory research",
        serialNumber: "MIC-2026-001",
        manufacturer: "Olympus",
        modelNumber: "CX23",
        purchaseDate: "2026-07-29",
        purchaseCost: 125000.00,
        location: "Lab Room 101",
        status: "ACTIVE",
        availabilityStatus: "AVAILABLE",
        imageUrl: "https://example.com/microscope.jpg",
        categoryId: "94c6976c-6455-481a-8736-1e088b804bfa",
        categoryName: "Microscopy Equipment",
        institutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654",
        institutionName: "DY Patil International University",
        departmentId: "74f27062-d528-4612-abe2-34ffb42e2dba",
        departmentName: "Computer Science and Engineering"
    }
];

const isDev = () => localStorage.getItem("devMode") === "true";

export const getEquipment = async () => {
    if (isDev()) return Promise.resolve(mockEquipment);
    const response = await api.get("/equipment");
    return response.data;
};

export const getEquipmentById = async (id) => {
    if (isDev()) return Promise.resolve(mockEquipment.find(e => e.id === id));
    const response = await api.get(`/equipment/${id}`);
    return response.data;
};

export const getAvailableEquipment = async () => {
    if (isDev()) return Promise.resolve(mockEquipment.filter(e => e.availabilityStatus === "AVAILABLE"));
    const response = await api.get("/equipment/available");
    return response.data;
};

export const createEquipment = async (data) => {
    if (isDev()) return Promise.resolve({ id: "mock-new-eq", ...data });
    const response = await api.post("/equipment", data);
    return response.data;
};

export const updateEquipment = async (id, data) => {
    if (isDev()) return Promise.resolve({ id, ...data });
    const response = await api.put(`/equipment/${id}`, data);
    return response.data;
};

export const deleteEquipment = async (id) => {
    if (isDev()) return Promise.resolve();
    await api.delete(`/equipment/${id}`);
};