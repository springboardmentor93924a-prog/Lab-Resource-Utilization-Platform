import api from "./api";

const isDevMode = () => localStorage.getItem("devMode") === "true";

const mockDepartments = [
    { id: "74f27062-d528-4612-abe2-34ffb42e2dba", name: "Computer Science and Engineering", description: "CSE Dept", institutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654" },
    { id: "dept-2", name: "Mechanical Engineering", description: "Mech Dept", institutionId: "62e07288-28d8-4d7f-b2ce-40a322cc6654" }
];

export const getDepartments = async () => {
    if (isDevMode()) return mockDepartments;
    const response = await api.get("/departments");
    return response.data;
};

export const getDepartmentsByInstitution = async (institutionId) => {
    if (isDevMode()) return mockDepartments.filter(d => d.institutionId === institutionId);
    const response = await api.get(`/departments/institution/${institutionId}`);
    return response.data;
};

export const getDepartmentById = async (id) => {
    if (isDevMode()) return mockDepartments.find(d => d.id === id);
    const response = await api.get(`/departments/${id}`);
    return response.data;
};

export const createDepartment = async (data) => {
    if (isDevMode()) return { id: "new-dept", ...data };
    const response = await api.post("/departments", data);
    return response.data;
};

export const updateDepartment = async (id, data) => {
    if (isDevMode()) return { id, ...data };
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
};

export const deleteDepartment = async (id) => {
    if (isDevMode()) return { success: true };
    const response = await api.delete(`/departments/${id}`);
    return response.data;
};
