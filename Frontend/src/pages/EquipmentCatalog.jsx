import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./EquipmentCatalog.css";

function EquipmentCatalog() {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/equipment");

      console.log("Equipment API response:", response.data);

      if (Array.isArray(response.data)) {
        setEquipment(response.data);
      } else {
        setEquipment([]);
        setError("Equipment data format is incorrect.");
      }
    } catch (err) {
      console.error("Equipment API error:", err);
      setError("Unable to load equipment.");
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const values = equipment
      .map((item) => item.category)
      .filter(Boolean);

    return ["ALL", ...new Set(values)];
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const manufacturer = item.manufacturer?.toLowerCase() || "";
      const assetTag = item.assetTag?.toLowerCase() || "";
      const searchText = search.toLowerCase();

      const matchesSearch =
        name.includes(searchText) ||
        manufacturer.includes(searchText) ||
        assetTag.includes(searchText);

      const matchesCategory =
        category === "ALL" ||
        item.category === category;

      const matchesStatus =
        status === "ALL" ||
        item.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [equipment, search, category, status]);

  const getStatusClass = (equipmentStatus) => {
    switch (equipmentStatus) {
      case "AVAILABLE":
        return "status-available";

      case "IN_USE":
        return "status-in-use";

      case "BOOKED":
        return "status-booked";

      case "UNDER_MAINTENANCE":
        return "status-maintenance";

      default:
        return "status-default";
    }
  };

  const getStatusText = (equipmentStatus) => {
    switch (equipmentStatus) {
      case "AVAILABLE":
        return "Available";

      case "IN_USE":
        return "In Use";

      case "BOOKED":
        return "Booked";

      case "UNDER_MAINTENANCE":
        return "Under Maintenance";

      default:
        return equipmentStatus || "Unknown";
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/equipment/${id}`);
  };

  const handleBook = (item) => {
    if (item.status !== "AVAILABLE") {
      return;
    }

    navigate(`/booking/${item.id}`);
  };

  return (
    <div className="equipment-page">

      {/* Header */}

      <div className="equipment-header">

        <div>
          <h1>Equipment Catalog</h1>

          <p>
            Browse and reserve laboratory equipment
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadEquipment}
        >
          ↻ Refresh
        </button>

      </div>


      {/* Filters */}

      <div className="equipment-filters">

        <div className="search-box">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search equipment, manufacturer or asset tag..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item === "ALL"
                ? "All Categories"
                : item}
            </option>
          ))}
        </select>


        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="ALL">
            All Status
          </option>

          <option value="AVAILABLE">
            Available
          </option>

          <option value="IN_USE">
            In Use
          </option>

          <option value="BOOKED">
            Booked
          </option>

          <option value="UNDER_MAINTENANCE">
            Under Maintenance
          </option>
        </select>

      </div>


      {/* Result count */}

      {!loading && !error && (
        <div className="equipment-count">

          Showing{" "}
          <strong>
            {filteredEquipment.length}
          </strong>{" "}
          of{" "}
          <strong>
            {equipment.length}
          </strong>{" "}
          equipment

        </div>
      )}


      {/* Loading */}

      {loading && (
        <div className="catalog-message">
          Loading equipment...
        </div>
      )}


      {/* Error */}

      {!loading && error && (
        <div className="catalog-error">

          <p>{error}</p>

          <button onClick={loadEquipment}>
            Try Again
          </button>

        </div>
      )}


      {/* Empty */}

      {!loading &&
        !error &&
        filteredEquipment.length === 0 && (

          <div className="catalog-message">

            <div className="empty-icon">
              🔬
            </div>

            <h2>
              No equipment found
            </h2>

            <p>
              Try changing your search or filters.
            </p>

          </div>
        )}


      {/* Equipment Grid */}

      {!loading &&
        !error &&
        filteredEquipment.length > 0 && (

          <div className="equipment-grid">

            {filteredEquipment.map((item) => (

              <div
                className="equipment-card"
                key={item.id}
              >

                {/* Image */}

                <div className="equipment-image">

                  {item.imageUrl ? (

                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";

                        e.currentTarget
                          .nextSibling
                          ?.classList.remove(
                            "hidden-placeholder"
                          );
                      }}
                    />

                  ) : null}

                  <div
                    className={
                      item.imageUrl
                        ? "image-placeholder hidden-placeholder"
                        : "image-placeholder"
                    }
                  >
                    🔬
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {getStatusText(item.status)}
                  </span>

                </div>


                {/* Details */}

                <div className="equipment-content">

                  <div className="equipment-category">
                    {item.category || "Laboratory"}
                  </div>

                  <h2>
                    {item.name}
                  </h2>

                  <p className="equipment-manufacturer">
                    {item.manufacturer || "Manufacturer N/A"}

                    {item.modelNumber && (
                      <>
                        {" • "}
                        {item.modelNumber}
                      </>
                    )}
                  </p>


                  <div className="equipment-info">

                    <div>
                      <span>
                        Asset Tag
                      </span>

                      <strong>
                        {item.assetTag || "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Location
                      </span>

                      <strong>
                        Lab
                      </strong>
                    </div>

                  </div>


                  <div className="equipment-actions">

                    <button
                      className="details-button"
                      onClick={() =>
                        handleViewDetails(item.id)
                      }
                    >
                      View Details
                    </button>

                    <button
                      className="book-button"
                      disabled={
                        item.status !== "AVAILABLE"
                      }
                      onClick={() =>
                        navigate(`/booking?equipmentId=${item.id}`)
                      }
                    >
                      {item.status === "AVAILABLE"
                        ? "Book Now"
                        : "Unavailable"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

    </div>
  );
}

export default EquipmentCatalog;