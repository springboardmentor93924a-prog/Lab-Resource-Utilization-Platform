import { useEffect, useMemo, useState } from 'react';
import { fetchAuditEntries } from '../services/platformData';

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<Awaited<ReturnType<typeof fetchAuditEntries>>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await fetchAuditEntries();
        if (active) {
          setEntries(data);
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

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesText = `${entry.summary} ${entry.performedBy} ${entry.entityType}`.toLowerCase().includes(filter.toLowerCase());
      const matchesEntity = entityFilter === 'All' || entry.entityType === entityFilter;
      const matchesAction = actionFilter === 'All' || entry.action === actionFilter;
      return matchesText && matchesEntity && matchesAction;
    });
  }, [entries, filter, entityFilter, actionFilter]);

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Audit trail</h2>
        <p>Immutable activity log for approvals, updates, deletes, and recovery operations.</p>
        <div className="filter-row">
          <input className="search-input" placeholder="Search by user, action, or entity" value={filter} onChange={(event) => setFilter(event.target.value)} />
          <select value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)}>
            <option value="All">All entities</option>
            <option value="Equipment">Equipment</option>
            <option value="Booking">Booking</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
            <option value="All">All actions</option>
            <option value="Create">Create</option>
            <option value="Update">Update</option>
            <option value="Delete">Delete</option>
            <option value="Approve">Approve</option>
            <option value="Reject">Reject</option>
            <option value="Restore">Restore</option>
          </select>
        </div>

        {loading ? <p>Loading audit entries…</p> : (
          <div className="table-card">
            <div className="table-row"><strong>Action</strong><strong>Entity</strong><strong>Performed by</strong></div>
            {filteredEntries.map((entry) => (
              <div className="table-row" key={entry.id}>
                <span>{entry.summary}</span>
                <span>{entry.entityType}</span>
                <span>{entry.performedBy}</span>
                <span className="muted-text">{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
