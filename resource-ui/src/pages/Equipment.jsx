import { useEffect, useState } from "react";
import api from "../services/api";

function Equipment() {

    const [equipment, setEquipment] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        status: "Available",
        department: "",
        description: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    // Load equipment when page opens
    useEffect(() => {
        loadEquipment();
    }, []);

    // GET all equipment
    const loadEquipment = async () => {
        try {
            const response = await api.get("/equipment");
            setEquipment(response.data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to load equipment.");
        }
    };

    // Handle form input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Clear form
    const resetForm = () => {

        setFormData({
            name: "",
            category: "",
            status: "Available",
            department: "",
            description: ""
        });

        setEditingId(null);
        setError("");
    };

    // POST - Add equipment
    const addEquipment = async (e) => {

        e.preventDefault();

        try {

            await api.post("/equipment", formData);

            resetForm();

            await loadEquipment();

        } catch (err) {

            console.error(err);

            setError("Unable to add equipment.");
        }
    };

    // Put selected equipment into form
    const editEquipment = (item) => {

        setEditingId(item.id);

        setFormData({
            name: item.name ?? "",
            category: item.category ?? "",
            status: item.status ?? "Available",
            department: item.department ?? "",
            description: item.description ?? ""
        });

        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // PUT - Update equipment
    const updateEquipment = async (e) => {

        e.preventDefault();

        try {

            await api.put(
                `/equipment/${editingId}`,
                formData
            );

            resetForm();

            await loadEquipment();

        } catch (err) {

            console.error(err);

            setError("Unable to update equipment.");
        }
    };

    // DELETE equipment
    const deleteEquipment = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this equipment?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(`/equipment/${id}`);

            await loadEquipment();

        } catch (err) {

            console.error(err);

            setError(
                "Unable to delete equipment. It may be used in an existing booking."
            );
        }
    };

    return (

        <div className="container mt-4">

            <h2>Equipment</h2>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* ADD / EDIT EQUIPMENT FORM */}

            <div className="card mt-3 mb-4">

                <div className="card-body">

                    <h4>
                        {editingId
                            ? "Edit Equipment"
                            : "Add Equipment"}
                    </h4>

                    <form
                        onSubmit={
                            editingId
                                ? updateEquipment
                                : addEquipment
                        }
                    >

                        <div className="row">

                            {/* NAME */}

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
                                    placeholder="Example: Projector"
                                    required
                                />

                            </div>

                            {/* CATEGORY */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Category
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="Example: Electronics"
                                    required
                                />

                            </div>

                            {/* STATUS */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="Available">
                                        Available
                                    </option>

                                    <option value="Booked">
                                        Booked
                                    </option>

                                    <option value="Maintenance">
                                        Maintenance
                                    </option>

                                </select>

                            </div>

                            {/* DEPARTMENT */}

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
                                    placeholder="Example: CSE"
                                    required
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div className="col-12 mb-3">

                                <label className="form-label">
                                    Description
                                </label>

                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter equipment description"
                                    rows="3"
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

                            {editingId
                                ? "Update Equipment"
                                : "Add Equipment"}

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

            {/* EQUIPMENT TABLE */}

            <div className="table-responsive">

                <table className="table table-bordered table-striped">

                    <thead className="table-dark">

                        <tr>

                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Department</th>
                            <th>Description</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {equipment.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="text-center"
                                >
                                    No equipment found
                                </td>

                            </tr>

                        ) : (

                            equipment.map((item) => (

                                <tr key={item.id}>

                                    <td>{item.id}</td>

                                    <td>{item.name}</td>

                                    <td>{item.category}</td>

                                    <td>{item.status}</td>

                                    <td>{item.department}</td>

                                    <td>{item.description}</td>

                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() =>
                                                editEquipment(item)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                deleteEquipment(item.id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Equipment;