import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createMaintenanceTicket, fetchMaintenanceTickets, updateMaintenanceTicketStatus } from '../services/platformData';

type MaintenanceFormValues = {
  asset: string;
  facility: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  due: string;
  description: string;
};

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<Awaited<ReturnType<typeof fetchMaintenanceTickets>>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceFormValues>({
    defaultValues: { asset: '', facility: '', priority: 'Medium', assignedTo: '', due: '', description: '' },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      setTickets(await fetchMaintenanceTickets());
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onSubmit = async (data: MaintenanceFormValues) => {
    setSubmitting(true);
    try {
      await createMaintenanceTicket(data);
      reset();
      await loadData();
      setMessage('Maintenance ticket created.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    try {
      await updateMaintenanceTicketStatus(id, status);
      await loadData();
      setMessage(`Ticket updated to ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update ticket.');
    }
  };

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Maintenance center</h2>
        <p>Create tickets, assign owners, and track issue resolution from one place.</p>
        {message && <div className="success-pill">{message}</div>}
        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <div className="field-row">
            <label className="field"><input placeholder="Asset" {...register('asset', { required: 'Asset is required' })} /></label>
            <label className="field"><input placeholder="Facility" {...register('facility', { required: 'Facility is required' })} /></label>
          </div>
          {errors.asset && <p className="field-error">{errors.asset.message}</p>}
          {errors.facility && <p className="field-error">{errors.facility.message}</p>}
          <div className="field-row">
            <label className="field">
              <select {...register('priority', { required: 'Priority is required' })}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label className="field"><input placeholder="Assigned to" {...register('assignedTo', { required: 'Assigned to is required' })} /></label>
          </div>
          <label className="field"><input type="date" {...register('due', { required: 'Due date is required' })} /></label>
          <label className="field"><textarea rows={3} placeholder="Issue description" {...register('description', { required: 'Description is required' })} /></label>
          <button className="primary-btn" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Create ticket'}</button>
        </form>
      </div>

      <div className="panel-card">
        <h3>Open tickets</h3>
        {loading ? <p>Loading tickets…</p> : (
          <div className="table-card">
            <div className="table-row"><strong>Asset</strong><strong>Priority</strong><strong>Status</strong></div>
            {tickets.map((ticket) => (
              <div className="table-row" key={ticket.id}>
                <span>{ticket.asset}</span>
                <span>{ticket.priority}</span>
                <span>{ticket.status}</span>
                <div className="action-row">
                  <button className="secondary-btn" onClick={() => void handleStatusChange(ticket.id, 'In Progress')}>Work on it</button>
                  <button className="ghost-btn" onClick={() => void handleStatusChange(ticket.id, 'Resolved')}>Resolve</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
