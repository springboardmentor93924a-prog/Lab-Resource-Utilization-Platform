import { useEffect, useState } from 'react';
import { getBookingRecommendations, getPredictiveMaintenanceAlerts } from '../services/platformData';

export default function InsightsPage() {
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof getPredictiveMaintenanceAlerts>>>([]);
  const [recommendations, setRecommendations] = useState<Awaited<ReturnType<typeof getBookingRecommendations>>>([]);

  useEffect(() => {
    void (async () => {
      setAlerts(await getPredictiveMaintenanceAlerts());
      setRecommendations(await getBookingRecommendations());
    })();
  }, []);

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Predictive insights</h2>
        <p>Simple rule-based maintenance and booking recommendations that read like a real analytics layer.</p>
        <h3>Maintenance alerts</h3>
        <ul className="timeline-list">
          {alerts.map((alert) => <li key={alert.asset}><strong>{alert.asset}</strong> — {alert.reason}</li>)}
        </ul>
        <h3>Booking recommendations</h3>
        <ul className="timeline-list">
          {recommendations.map((recommendation) => <li key={recommendation.title}><strong>{recommendation.title}</strong> — {recommendation.detail}</li>)}
        </ul>
      </div>
    </div>
  );
}
