function StatsCard({ title, value, description }) {
  return (
    <div className="stats-card">
      <div className="stats-card-content">
        <p className="stats-title">{title}</p>
        <h2>{value}</h2>
        <p className="stats-description">{description}</p>
      </div>
    </div>
  );
}

export default StatsCard;