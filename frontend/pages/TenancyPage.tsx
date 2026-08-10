import { useEffect, useState } from 'react';
import { getApprovalWorkflowRules, getTenancyContext } from '../services/platformData';

export default function TenancyPage() {
  const [context, setContext] = useState<Awaited<ReturnType<typeof getTenancyContext>> | null>(null);
  const [rules, setRules] = useState<Awaited<ReturnType<typeof getApprovalWorkflowRules>>>([]);

  useEffect(() => {
    void (async () => {
      setContext(await getTenancyContext());
      setRules(await getApprovalWorkflowRules());
    })();
  }, []);

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Multi-tenancy and approval flow</h2>
        <p>Institution isolation and approval-chain logic modeled as reusable platform rules.</p>
        {context && <div className="success-pill">{context.institution}</div>}
        <p>{context?.boundary}</p>
        <p>{context?.sharingException}</p>
        <h3>Approval rules</h3>
        <ul className="timeline-list">
          {rules.map((rule) => <li key={rule.requestType}><strong>{rule.requestType}</strong> → {rule.approverRole} ({rule.status})</li>)}
        </ul>
      </div>
    </div>
  );
}
