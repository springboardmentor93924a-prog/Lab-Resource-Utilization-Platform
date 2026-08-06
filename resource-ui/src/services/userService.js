import api from "./api";

const mockUsers = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "ADMIN", department: "IT" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", role: "USER", department: "Science" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", role: "USER", department: "Engineering" },
];

const isDev = () => localStorage.getItem("devMode") === "true";

export const getUsers = async () => {
    if (isDev()) return Promise.resolve(mockUsers);
    const response = await api.get("/users");
    return response.data;
};

export const getUserById = async (id) => {
    if (isDev()) return Promise.resolve(mockUsers.find(u => u.id === parseInt(id)));
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (data) => {
    if (isDev()) return Promise.resolve({ id: Math.floor(Math.random() * 1000), ...data });
    const response = await api.post("/users", data);
    return response.data;
};

export const updateUser = async (id, data) => {
    if (isDev()) return Promise.resolve({ id: parseInt(id), ...data });
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id) => {
    if (isDev()) return Promise.resolve();
    await api.delete(`/users/${id}`);
};