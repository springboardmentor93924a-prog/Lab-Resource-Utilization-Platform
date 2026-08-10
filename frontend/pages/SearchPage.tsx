import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchPlatform } from '../services/platformData';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') ?? '');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchPlatform>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        const data = await searchPlatform(query);
        setResults(data);
        setLoading(false);
      })();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups = results.reduce<Record<string, typeof results>>((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});

    return Object.entries(groups);
  }, [results]);

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Global search</h2>
        <p>Search equipment, bookings, users, and labs from a single query entry point.</p>
        <input className="search-input" placeholder="Search across the platform" value={query} onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          const params = new URLSearchParams();
          if (nextQuery) {
            params.set('q', nextQuery);
          }
          navigate({ pathname: '/search', search: params.toString() }, { replace: true });
        }} />

        {loading ? <p>Searching…</p> : groupedResults.length === 0 ? <p>No results match your query yet.</p> : (
          <div className="table-card">
            {groupedResults.map(([type, items]) => (
              <div key={type}>
                <h3>{type}</h3>
                {items.map((item) => (
                  <div className="table-row" key={`${item.type}-${item.id}`}>
                    <span>{item.label}</span>
                    <span>{item.subtitle}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
