type StatusPillProps = {
  status: string;
};

const statusColors: Record<string, string> = {
  Available: '#10b981',
  Booked: '#f59e0b',
  Maintenance: '#f97316',
  Pending: '#60a5fa',
  Approved: '#22c55e',
  'In Progress': '#38bdf8',
  Scheduled: '#8b5cf6',
};

export default function StatusPill({ status }: StatusPillProps) {
  return (
    <span className="status-pill" style={{ backgroundColor: `${statusColors[status] ?? '#334155'}22`, color: statusColors[status] ?? '#cbd5e1' }}>
      {status}
    </span>
  );
}
