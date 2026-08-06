import api from "./api";

const isDevMode = () => localStorage.getItem("devMode") === "true";

const mockCategories = [
    { id: "94c6976c-6455-481a-8736-1e088b804bfa", name: "Microscopy Equipment", description: "Equipment used for microscopic analysis" },
    { id: "cat-2", name: "3D Printers", description: "Additive manufacturing" }
];

export const getCategories = async () => {
    if (isDevMode()) return mockCategories;
    const response = await api.get("/categories");
    return response.data;
};

export const getCategoryById = async (id) => {
    if (isDevMode()) return mockCategories.find(c => c.id === id);
    const response = await api.get(`/categories/${id}`);
    return response.data;
};

export const createCategory = async (data) => {
    if (isDevMode()) return { id: "new-cat", ...data };
    const response = await api.post("/categories", data);
    return response.data;
};

export const updateCategory = async (id, data) => {
    if (isDevMode()) return { id, ...data };
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    if (isDevMode()) return { success: true };
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};
