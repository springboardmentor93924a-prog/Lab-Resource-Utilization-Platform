import { Activity, CalendarClock, Package, Sparkles, TrendingUp, Waves } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const summaryCards = [
  { title: 'Active Labs', value: '24', change: '+12%', icon: Activity },
  { title: 'Bookings', value: '188', change: '+8%', icon: CalendarClock },
  { title: 'Equipment', value: '1,420', change: '+3%', icon: Package },
  { title: 'Utilization', value: '76%', change: '+5%', icon: TrendingUp },
];

const trendData = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 52 },
  { name: 'Mar', value: 60 },
  { name: 'Apr', value: 58 },
  { name: 'May', value: 70 },
  { name: 'Jun', value: 76 },
];

const pieData = [
  { name: 'Research', value: 42 },
  { name: 'Teaching', value: 33 },
  { name: 'Maintenance', value: 25 },
];

const colors = ['#6d5dfc', '#2dd4bf', '#f59e0b'];

export default function DashboardPage() {
  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h2>Research infrastructure is running smoothly.</h2>
          <p>Track utilization, critical bookings, and proactive maintenance across your institution.</p>
        </div>
        <div className="hero-metric">
          <div className="metric-badge"><Waves size={16} /> Live utilization 76%</div>
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
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-grid">
        <div className="panel-card">
          <h3>Monthly utilization trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
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
              <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {pieData.map((entry, index) => (
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
            <li><strong>08:00</strong> Microscope Lab A – Dr. Sharma</li>
            <li><strong>10:30</strong> Biochemistry Instrument Bay – Team Alpha</li>
            <li><strong>14:00</strong> BSL-2 Room – Department of Life Sciences</li>
          </ul>
        </div>
        <div className="panel-card ai-widget">
          <div className="ai-badge"><Sparkles size={16} /> AI recommendation</div>
          <h3>Shift maintenance window</h3>
          <p>Move the imaging suite check to Friday afternoon to reduce booking conflicts by 18%.</p>
        </div>
      </div>
    </div>
  );
}
