import { useEffect, useState } from 'react';
import { fetchSystemStatus } from '../services/platformData';

export default function StatusPage() {
  const [status, setStatus] = useState<Awaited<ReturnType<typeof fetchSystemStatus>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await fetchSystemStatus();
        if (active) {
          setStatus(data);
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
        <h2>System status</h2>
        <p>Operational health indicators for monitoring, backup, and service availability.</p>
        {loading && <p>Loading status…</p>}
        {status && (
          <div className="stats-grid">
            <div className="stat-card"><div><h3>{status.uptime}</h3><p>Uptime</p></div></div>
            <div className="stat-card"><div><h3>{status.database}</h3><p>Database</p></div></div>
            <div className="stat-card"><div><h3>{status.redis}</h3><p>Redis</p></div></div>
            <div className="stat-card"><div><h3>{status.lastBackup}</h3><p>Last backup</p></div></div>
          </div>
        )}
      </div>
    </div>
  );
}
