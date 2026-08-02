import { useEffect, useState } from 'react';
import { completeOnboarding, getOnboardingStatus } from '../services/platformData';

export default function OnboardingPage() {
  const [done, setDone] = useState(true);

  useEffect(() => {
    void (async () => {
      setDone(await getOnboardingStatus());
    })();
  }, []);

  const handleComplete = async () => {
    await completeOnboarding();
    setDone(true);
  };

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Role-based onboarding</h2>
        <p>First-login guidance tailored to research, technician, and manager workflows.</p>
        {!done ? (
          <div>
            <p>Researcher: learn how to reserve equipment and monitor usage.</p>
            <p>Lab Manager: review approvals and maintenance windows.</p>
            <button className="primary-btn" onClick={() => void handleComplete()}>Mark onboarding complete</button>
          </div>
        ) : <div className="success-pill">Onboarding already completed.</div>}
      </div>
    </div>
  );
}
