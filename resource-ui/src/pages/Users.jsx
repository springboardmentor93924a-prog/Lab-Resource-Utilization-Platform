import { useEffect, useState } from "react";
import api from "../services/api";

function Users() {
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        department: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load users.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "",
            department: ""
        });

        setEditingId(null);
        setError("");
    };

    // ADD USER
    const addUser = async (e) => {
        e.preventDefault();

        try {
            await api.post("/users", formData);

            resetForm();
            await loadUsers();
        } catch (err) {
            console.error(err);
            setError("Unable to add user. Check the entered data.");
        }
    };

    // SELECT USER FOR EDITING
    const editUser = (user) => {
        setEditingId(user.id);

        setFormData({
            name: user.name ?? "",
            email: user.email ?? "",
            password: user.password ?? "",
            role: user.role ?? "",
            department: user.department ?? ""
        });

        setError("");
    };

    // UPDATE USER
    const updateUser = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/users/${editingId}`, formData);

            resetForm();
            await loadUsers();
        } catch (err) {
            console.error(err);
            setError("Unable to update user.");
        }
    };

    // DELETE USER
    const deleteUser = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/users/${id}`);
            await loadUsers();
        } catch (err) {
            console.error(err);
            setError(
                "Unable to delete user. The user may have existing bookings."
            );
        }
    };

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center">
                <h2>Users</h2>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* ADD / EDIT FORM */}

            <div className="card mt-3 mb-4">
                <div className="card-body">

                    <h4>
                        {editingId ? "Edit User" : "Add User"}
                    </h4>

                    <form onSubmit={editingId ? updateUser : addUser}>

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Role
                                </label>

                                <select
                                    className="form-select"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Role
                                    </option>

                                    <option value="Student">
                                        Student
                                    </option>

                                    <option value="Faculty">
                                        Faculty
                                    </option>

                                    <option value="Admin">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Department
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className={
                                editingId
                                    ? "btn btn-warning"
                                    : "btn btn-primary"
                            }
                        >
                            {editingId ? "Update User" : "Add User"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        )}

                    </form>

                </div>
            </div>

            {/* USERS TABLE */}

            <div className="table-responsive">

                <table className="table table-bordered table-striped">

                    <thead className="table-dark">

                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr key={user.id}>

                                <td>{user.id}</td>

                                <td>{user.name}</td>

                                <td>{user.email}</td>

                                <td>{user.role}</td>

                                <td>{user.department}</td>

                                <td>

                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => editUser(user)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteUser(user.id)}
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Users;