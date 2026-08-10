import { useEffect, useState } from 'react';
import { fetchDeletedItems, restoreDeletedItem } from '../services/platformData';

export default function DeletedItemsPage() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchDeletedItems>>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      setItems(await fetchDeletedItems());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await restoreDeletedItem(id);
      setMessage('Item restored successfully.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to restore item.');
    }
  };

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Recently deleted</h2>
        <p>Soft-deleted records are retained here for recovery and auditability.</p>
        {message && <div className="success-pill">{message}</div>}
        {loading ? <p>Loading deleted items…</p> : (
          <div className="table-card">
            <div className="table-row"><strong>Item</strong><strong>Type</strong><strong>Deleted</strong></div>
            {items.map((item) => (
              <div className="table-row" key={item.id}>
                <span>{item.label}</span>
                <span>{item.type}</span>
                <span>{new Date(item.deletedAt).toLocaleString()}</span>
                <button className="secondary-btn" onClick={() => void handleRestore(item.id)}>Restore</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
