import Sidebar from "../components/Sidebar";
import "../styles/manageequipment.css";

function ManageEquipment() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

        <div className="page-header">
          <h1>Manage Equipment</h1>
          <p>Add, update and manage laboratory equipment.</p>
        </div>

        <div className="toolbar">

          <input
            type="text"
            placeholder="🔍 Search Equipment..."
          />

          <button className="add-btn">
            + Add Equipment
          </button>

        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Laboratory</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>EQ001</td>
                <td>Desktop Computer</td>
                <td>AI Laboratory</td>
                <td>60</td>
                <td className="active">Available</td>

                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>

              <tr>
                <td>EQ002</td>
                <td>Projector</td>
                <td>Cloud Lab</td>
                <td>2</td>
                <td className="active">Available</td>

                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default ManageEquipment;