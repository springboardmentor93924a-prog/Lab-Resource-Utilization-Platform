import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarClock, Package, Sparkles, TrendingUp, Waves } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { fetchDashboardSnapshot } from '../services/platformData';

const iconMap = {
  Activity,
  CalendarClock,
  Package,
  TrendingUp,
};

const colors = ['#6d5dfc', '#2dd4bf', '#f59e0b'];

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await fetchDashboardSnapshot();
        if (active) {
          setSnapshot(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
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

  const summaryCards = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return snapshot.summaryCards.map((card) => ({
      ...card,
      icon: iconMap[card.title === 'Active Labs' ? 'Activity' : card.title === 'Bookings' ? 'CalendarClock' : card.title === 'Equipments' ? 'Package' : 'TrendingUp'] as typeof Activity,
    }));
  }, [snapshot]);

  if (loading) {
    return <div className="page-grid"><div className="panel-card"><h2>Loading dashboard…</h2><p>Refreshing live utilization metrics.</p></div></div>;
  }

  if (error) {
    return <div className="page-grid"><div className="panel-card"><h2>Unable to load dashboard</h2><p>{error}</p></div></div>;
  }

  if (!snapshot) {
    return null;
  }

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h2>Research infrastructure is running smoothly.</h2>
          <p>Track utilization, critical bookings, and proactive maintenance across your institution.</p>
        </div>
        <div className="hero-metric">
          <div className="metric-badge"><Waves size={16} /> Live utilization {snapshot.summaryCards[3]?.value ?? '76%'}</div>
        </div>
      </section>

      <div className="stats-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="stat-card">
              <div className="stat-icon"><Icon size={18} /></div>
              <div>
                <h3>{card.value}</h3>
                <p>{card.title}</p>
                <span>{card.change}</span>
                <div className="muted-text">{card.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-grid">
        <div className="panel-card">
          <h3>Monthly utilization trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={snapshot.trendData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6d5dfc" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="panel-card">
          <h3>Usage mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={snapshot.usageMix} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {snapshot.usageMix.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="panel-card">
          <h3>Upcoming bookings</h3>
          <ul className="timeline-list">
            {snapshot.bookings.map((item) => (
              <li key={`${item.resource}-${item.time}`}><strong>{item.time}</strong> {item.resource} – {item.owner} ({item.status})</li>
            ))}
          </ul>
        </div>
        <div className="panel-card ai-widget">
          <div className="ai-badge"><Sparkles size={16} /> AI recommendation</div>
          <h3>Shift maintenance window</h3>
          <p>{snapshot.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
