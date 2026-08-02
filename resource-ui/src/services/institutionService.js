import api from "./api";

const isDevMode = () => localStorage.getItem("devMode") === "true";

const mockInstitutions = [
    { id: "62e07288-28d8-4d7f-b2ce-40a322cc6654", name: "DY Patil International University", email: "admin@dypiu.edu", phone: "9876543210", address: "Akurdi", city: "Pune", state: "Maharashtra", country: "India", status: "ACTIVE" },
    { id: "inst-2", name: "MIT University", email: "admin@mit.edu", phone: "9876543211", address: "Kothrud", city: "Pune", state: "Maharashtra", country: "India", status: "ACTIVE" }
];

export const getInstitutions = async () => {
    if (isDevMode()) return mockInstitutions;
    const response = await api.get("/institutions");
    return response.data;
};

export const getInstitutionById = async (id) => {
    if (isDevMode()) return mockInstitutions.find(i => i.id === id);
    const response = await api.get(`/institutions/${id}`);
    return response.data;
};

export const createInstitution = async (data) => {
    if (isDevMode()) return { id: "new-inst", ...data };
    const response = await api.post("/institutions", data);
    return response.data;
};

export const updateInstitution = async (id, data) => {
    if (isDevMode()) return { id, ...data };
    const response = await api.put(`/institutions/${id}`, data);
    return response.data;
};

export const deleteInstitution = async (id) => {
    if (isDevMode()) return { success: true };
    const response = await api.delete(`/institutions/${id}`);
    return response.data;
};
