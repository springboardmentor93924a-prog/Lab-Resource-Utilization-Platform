import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEquipment } from '../services/platformData';
import type { EquipmentItem } from '../services/platformData';

const categories = ['All', 'Biotech', 'Genomics', 'Chemistry', 'Physics'];
const availability = ['All', 'Available', 'Booked', 'Maintenance'];

const statusClass = (status: string) => {
  if (status === 'Available') return 'status-green';
  if (status === 'Booked') return 'status-orange';
  return 'status-red';
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await fetchEquipment();
        if (active) setEquipment(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load equipment.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      if (category !== 'All' && item.department !== category) return false;
      if (availabilityFilter !== 'All' && item.status !== availabilityFilter) return false;
      if (query.trim()) {
        const normalized = query.toLowerCase();
        return [item.name, item.location, item.vendor, item.department].some((value) => value.toLowerCase().includes(normalized));
      }
      return true;
    });
  }, [equipment, category, availabilityFilter, query]);

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Equipment catalog</h2>
        <p>Browse instruments, check availability, and request bookings from one intelligent catalog.</p>
        <div className="filter-bar">
          <label className="field select-field">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="field select-field">
            Availability
            <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
              {availability.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search equipment, location or vendor" />
        </div>
        {loading && <p>Loading equipment…</p>}
        {error && <p className="field-error">{error}</p>}
      </div>

      <div className="equipment-grid">
        {filteredEquipment.map((item) => (
          <div key={item.id} className="equipment-card">
            <div className="equipment-thumb">IMG</div>
            <div className="equipment-meta">
              <span className={`status-badge ${statusClass(item.status)}`}>{item.status.toUpperCase()}</span>
              <h3>{item.name}</h3>
              <p>{item.department}</p>
              <p className="muted-text">{item.location} • {item.vendor}</p>
              <p className="muted-text">{item.availability}</p>
            </div>
            <div className="equipment-footer">
              <span className="asset-tag">Asset Tag: {item.id}</span>
              <Link className="secondary-btn" to={`/equipment/${item.id}`}>View / Book</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
