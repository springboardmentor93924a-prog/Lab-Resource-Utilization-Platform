import "../styles/resourcesharing.css";

function ShareCard({ equipment }) {
  return (
    <div className="share-card">

      <h3>{equipment.name}</h3>

      <p>
        <strong>Institution:</strong> {equipment.institution}
      </p>

      <p>
        <strong>Status:</strong>
        <span className="share-status">
          {equipment.status}
        </span>
      </p>

      <button className="request-btn">
        Send Request
      </button>

    </div>
  );
}

export default ShareCard;