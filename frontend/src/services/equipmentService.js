import api from "./api";

const mockEquipment = [
    { 
        id: "eq-1", 
        name: "Digital Microscope CX23", 
        description: "High-resolution microscope for laboratory research",
        serialNumber: "MIC-2026-001",
        manufacturer: "Olympus",
        modelNumber: "CX23",
        purchaseDate: "2026-07-29",
        purchaseCost: 125000.00,
        location: "Bio Lab Room 101",
        status: "ACTIVE",
        availabilityStatus: "AVAILABLE",
        imageUrl: "https://example.com/microscope.jpg",
        categoryId: "94c6976c-6455-481a-8736-1e088b804bfa",
        categoryName: "Microscopy Equipment",
        institutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654",
        institutionName: "DY Patil International University",
        departmentId: "74f27062-d528-4612-abe2-34ffb42e2dba",
        departmentName: "Computer Science and Engineering"
    },
    { 
        id: "eq-2", 
        name: "Ender 3 Pro 3D Printer", 
        description: "Desktop FDM 3D printer for prototyping model parts",
        serialNumber: "PRN-3D-004",
        manufacturer: "Creality",
        modelNumber: "Ender 3 Pro",
        purchaseDate: "2026-05-15",
        purchaseCost: 45000.00,
        location: "Maker Space Lab",
        status: "ACTIVE",
        availabilityStatus: "IN_USE",
        imageUrl: "https://example.com/printer.jpg",
        categoryId: "cat-2",
        categoryName: "3D Printers",
        institutionId: "inst-2",
        institutionName: "MIT University",
        departmentId: "74f27062-d528-4612-abe2-34ffb42e2dba",
        departmentName: "Computer Science and Engineering"
    },
    { 
        id: "eq-3", 
        name: "Fluorescence Microscope", 
        description: "Advanced fluorescence microscope for imaging cell samples",
        serialNumber: "FLM-2026-009",
        manufacturer: "Nikon",
        modelNumber: "Eclipse Ti2",
        purchaseDate: "2026-02-10",
        purchaseCost: 320000.00,
        location: "Advanced Optics Lab",
        status: "ACTIVE",
        availabilityStatus: "BOOKED",
        imageUrl: "https://example.com/fl-microscope.jpg",
        categoryId: "94c6976c-6455-481a-8736-1e088b804bfa",
        categoryName: "Microscopy Equipment",
        institutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654",
        institutionName: "DY Patil International University",
        departmentId: "74f27062-d528-4612-abe2-34ffb42e2dba",
        departmentName: "Computer Science and Engineering"
    },
    { 
        id: "eq-4", 
        name: "Form 3+ SLA 3D Printer", 
        description: "Stereolithography desktop 3D printer for ultra-precise details",
        serialNumber: "PRN-SLA-012",
        manufacturer: "Formlabs",
        modelNumber: "Form 3+",
        purchaseDate: "2026-01-20",
        purchaseCost: 185000.00,
        location: "3D Print Lab Room 3",
        status: "ACTIVE",
        availabilityStatus: "MAINTENANCE",
        imageUrl: "https://example.com/form3.jpg",
        categoryId: "cat-2",
        categoryName: "3D Printers",
        institutionId: "inst-2",
        institutionName: "MIT University",
        departmentId: "74f27062-d528-4612-abe2-34ffb42e2dba",
        departmentName: "Computer Science and Engineering"
    },
    { 
        id: "eq-5", 
        name: "High-Speed Centrifuge", 
        description: "Refrigerated microcentrifuge for molecular biology works",
        serialNumber: "CEN-HS-087",
        manufacturer: "Eppendorf",
        modelNumber: "5425 R",
        purchaseDate: "2026-06-01",
        purchaseCost: 95000.00,
        location: "Centrifuge Lab",
        status: "ACTIVE",
        availabilityStatus: "AVAILABLE",
        imageUrl: "https://example.com/centrifuge.jpg",
        categoryId: "94c6976c-6455-481a-8736-1e088b804bfa",
        categoryName: "Microscopy Equipment",
        institutionId: "inst-2",
        institutionName: "MIT University",
        departmentId: "74f27062-d528-4612-abe2-34ffb42e2dba",
        departmentName: "Computer Science and Engineering"
    },
    { 
        id: "eq-6", 
        name: "Thermal Cycler PCR", 
        description: "Automated PCR thermal cycler for DNA and RNA amplification",
        serialNumber: "PCR-TC-441",
        manufacturer: "Bio-Rad",
        modelNumber: "T100",
        purchaseDate: "2026-04-12",
        purchaseCost: 78000.00,
        location: "Genetics Lab 202",
        status: "ACTIVE",
        availabilityStatus: "IN_USE",
        imageUrl: "https://example.com/pcr.jpg",
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