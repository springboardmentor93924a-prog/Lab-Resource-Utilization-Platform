import React, { useEffect, useState } from 'react'
import { Share2, CheckCircle2, XCircle, Building2, ArrowRight } from 'lucide-react'
import client from '../api/client'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Textarea, Input } from '../components/ui/Field'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'

export default function Sharing() {
  const [equipment, setEquipment] = useState([])
  const [requests, setRequests] = useState([])
  const [requestFor, setRequestFor] = useState(null)
  const [msg, setMsg] = useState('')

  const load = () => {
    client.get('/equipment/sharable').then(res => setEquipment(res.data.data))
    client.get('/sharing').then(res => setRequests(res.data.data)).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const review = (id, approve) => client.patch(`/sharing/${id}/review?approve=${approve}`).then(load)

  return (
    <div>
      <PageHeader title="Inter-Institution Resource Sharing" subtitle="A marketplace for accessing equipment across partner institutions" />

      {msg && <Alert type="success">{msg}</Alert>}

      {/* Marketplace-style directory, distinct from the plain grid used in the catalog */}
      <h3 className="font-display text-[15px] font-semibold mb-3">Available across the network</h3>
      {equipment.length === 0 ? (
        <EmptyState icon={Share2} title="Nothing shared yet" description="Institutions that opt their equipment into sharing will appear here." />
      ) : (
        <div className="divide-y divide-border border border-border rounded-card overflow-hidden mb-10 bg-surface">
          {equipment.map(e => (
            <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center shrink-0">
                <Building2 size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink">{e.name}</div>
                <div className="text-xs text-muted mt-0.5">Hosted by {e.institution?.name || 'partner institution'} · {e.category}</div>
              </div>
              <div className="hidden md:block text-xs text-muted max-w-xs truncate">{e.specifications}</div>
              <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => setRequestFor(e)}>Request access</Button>
            </div>
          ))}
        </div>
      )}

      {/* Requests shown as a status ledger rather than repeating the card-list pattern */}
      <h3 className="font-display text-[15px] font-semibold mb-3">Sharing requests</h3>
      {requests.length === 0 ? (
        <EmptyState icon={Share2} title="No sharing requests yet" />
      ) : (
        <div className="space-y-2">
          {requests.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 bg-surface border border-border rounded-card">
              <div className={`w-1.5 self-stretch rounded-full shrink-0 ${
                r.status === 'PENDING' ? 'bg-warn' : r.status === 'APPROVED' ? 'bg-accent' : r.status === 'REJECTED' ? 'bg-danger' : 'bg-gray-300'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink">{r.equipment?.name}</div>
                <div className="text-xs text-muted mt-0.5">{r.requestingInstitution?.name} · requested by {r.requestedBy?.fullName}</div>
                {r.justification && <div className="text-xs text-muted mt-1 italic">"{r.justification}"</div>}
              </div>
              <Badge status={r.status} />
              {r.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <Button variant="accent" size="sm" icon={CheckCircle2} onClick={() => review(r.id, true)}>Approve</Button>
                  <Button variant="danger" size="sm" icon={XCircle} onClick={() => review(r.id, false)}>Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {requestFor && (
        <RequestModal
          equipment={requestFor}
          onClose={() => setRequestFor(null)}
          onDone={() => { setRequestFor(null); setMsg('Sharing request submitted.'); load() }}
        />
      )}
    </div>
  )
}

function RequestModal({ equipment, onClose, onDone }) {
  const [justification, setJustification] = useState('')
  const [proposedFee, setProposedFee] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const params = new URLSearchParams({ equipmentId: equipment.id, justification, ...(proposedFee ? { proposedFee } : {}) })
      await client.post(`/sharing?${params.toString()}`)
      onDone()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={`Request access — ${equipment.name}`} subtitle={`Hosted by ${equipment.institution?.name || 'partner institution'}`} onClose={onClose}>
      {error && <Alert>{error}</Alert>}
      <Textarea label="Justification" full rows={3} value={justification} onChange={e => setJustification(e.target.value)} className="mb-3" />
      <Input label="Proposed usage fee ($, optional)" full value={proposedFee} onChange={e => setProposedFee(e.target.value)} className="mb-4" />
      <Button className="w-full justify-center" icon={Share2} onClick={submit} disabled={loading}>
        {loading ? 'Submitting…' : 'Submit request'}
      </Button>
    </Modal>
  )
}
