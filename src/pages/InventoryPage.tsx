import { useEffect, useState } from 'react';
import { fetchEquipment } from '../services/platformData';

export default function InventoryPage() {
  const [equipment, setEquipment] = useState<Awaited<ReturnType<typeof fetchEquipment>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await fetchEquipment();
        if (active) {
          setEquipment(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load equipment.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Inventory dashboard</h2>
        <p>Equipment list, availability, vendors, calibration status, and maintenance history.</p>
        {loading && <p>Loading inventory…</p>}
        {error && <p className="field-error">{error}</p>}
        {!loading && !error && (
          <div className="table-card">
            <div className="table-row"><strong>Equipment</strong><strong>Status</strong><strong>Location</strong></div>
            {equipment.map((item) => (
              <div className="table-row" key={item.id}>
                <span>{item.name}</span>
                <span>{item.status}</span>
                <span>{item.location}</span>
                <span className="muted-text">{item.availability}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
