import { useEffect, useState } from 'react';
import { completeOnboarding, getOnboardingStatus } from '../services/platformData';

export default function OnboardingPage() {
  const [done, setDone] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const status = await getOnboardingStatus();
      if (mounted) {
        setDone(status);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleComplete = async () => {
    await completeOnboarding();
    setDone(true);
    setMessage('Onboarding marked complete. You can now continue to the platform.');
  };

  if (done === null) {
    return (
      <div className="page-grid">
        <div className="panel-card">
          <h2>Role-based onboarding</h2>
          <p>Loading onboarding status...</p>
        </div>
      </div>
    );
  }

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
        ) : (
          <>
            <div className="success-pill">Onboarding already completed.</div>
            {message ? <div className="success-pill">{message}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}
