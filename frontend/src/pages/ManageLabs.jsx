import Sidebar from "../components/Sidebar";
import "../styles/managelabs.css";

function ManageLabs() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

        <div className="page-header">
          <h1>Manage Laboratories</h1>
          <p>Add, update and manage laboratory details.</p>
        </div>

        <div className="toolbar">

          <input
            type="text"
            placeholder="🔍 Search Laboratory..."
          />

          <button className="add-btn">
            + Add Laboratory
          </button>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Laboratory</th>
                <th>Department</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              <tr>
                <td>LAB001</td>
                <td>AI Laboratory</td>
                <td>AI & DS</td>
                <td>60</td>
                <td className="active">Available</td>

                <td>

                  <button className="edit-btn">
                    Edit
                  </button>

                  <button className="delete-btn">
                    Delete
                  </button>

                </td>

              </tr>

              <tr>
                <td>LAB002</td>
                <td>Cloud Computing Lab</td>
                <td>CSE</td>
                <td>45</td>
                <td className="active">Available</td>

                <td>

                  <button className="edit-btn">
                    Edit
                  </button>

                  <button className="delete-btn">
                    Delete
                  </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default ManageLabs;