import "./Equipment.css";

function Equipment() {

  const equipmentList = [
    {
      id: 1,
      name: "Projector",
      category: "Display",
      status: "Available",
    },
    {
      id: 2,
      name: "Arduino Uno",
      category: "Kit",
      status: "Reserved",
    },
    {
      id: 3,
      name: "Laptop",
      category: "Computer",
      status: "Available",
    },
  ];

  return (
    <div className="container">

      <h2>Equipment Management</h2>

      <div className="top-bar">

        <input
          className="search-box"
          type="text"
          placeholder="Search equipment..."
        />

        <button className="add-btn">
          Add Equipment
        </button>

      </div>

      <table>

        <thead>

          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>

        </thead>

        <tbody>

          {equipmentList.map((item) => (

            <tr key={item.id}>

              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.status}</td>

              <td>
                <button className="edit-btn">
                  Edit
                </button>

                <button className="delete-btn">
                  Delete
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Equipment;