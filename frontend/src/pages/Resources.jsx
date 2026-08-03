import ResourceCard from "../components/ResourceCard";
import Sidebar from "../components/Sidebar";
import "../styles/resources.css";

function Resources() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-content">

        <div className="resource-header">
          <h1>Laboratory Resources</h1>
          <p>Browse available laboratories and reserve them easily.</p>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search laboratory..."
          />

          <select>
            <option>All Departments</option>
            <option>AI & DS</option>
            <option>CSE</option>
            <option>IT</option>
            <option>ECE</option>
            <option>EEE</option>
          </select>
        </div>

        <div className="resource-grid">

          <ResourceCard
            title="AI Laboratory"
            department="AI & DS"
            status="Available"
          />

          <ResourceCard
            title="Cloud Computing Lab"
            department="CSE"
            status="Available"
          />

          <ResourceCard
            title="IoT Laboratory"
            department="ECE"
            status="Busy"
          />

          <ResourceCard
            title="Networking Laboratory"
            department="IT"
            status="Available"
          />

          <ResourceCard
            title="Database Laboratory"
            department="CSE"
            status="Maintenance"
          />

          <ResourceCard
            title="Robotics Laboratory"
            department="AI & DS"
            status="Available"
          />

        </div>

      </div>

    </div>
  );
}

export default Resources;