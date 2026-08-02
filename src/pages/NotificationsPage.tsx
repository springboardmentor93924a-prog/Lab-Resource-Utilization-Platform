import { useEffect, useState } from 'react';
import { fetchNotifications, toggleNotificationState } from '../services/platformData';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof fetchNotifications>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      setNotifications(await fetchNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAction = async (id: string, action: 'read' | 'archive') => {
    try {
      await toggleNotificationState(id, action);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update notification.');
    }
  };

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Notification center</h2>
        <p>Announcements, booking alerts, maintenance updates, and compliance notices.</p>
        {loading && <p>Loading notifications…</p>}
        {error && <p className="field-error">{error}</p>}
        {!loading && !error && (
          <div className="table-card">
            <div className="table-row"><strong>Title</strong><strong>Type</strong><strong>Priority</strong></div>
            {notifications.filter((item) => !item.archived).map((item) => (
              <div className="table-row" key={item.id}>
                <span>{item.title}</span>
                <span>{item.type}</span>
                <span>{item.priority}</span>
                <div className="action-row">
                  <button className="secondary-btn" onClick={() => void handleAction(item.id, 'read')}>Mark read</button>
                  <button className="ghost-btn" onClick={() => void handleAction(item.id, 'archive')}>Archive</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
