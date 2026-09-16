import { useState } from "react";
import { Modal } from "../../common/Modal.jsx";
import { Field, inputClass } from "../../common/Field.jsx";

/* ================================================================== */
/*  Researcher -> Waitlist -> Join Waitlist Modal                      */
/* ================================================================== */
export default function JoinWaitlistModal({ equipment, onClose, onConfirm }) {
  const [startDate, setStartDate] = useState("2026-08-19");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("2026-08-19");
  const [endTime, setEndTime] = useState("11:00");

  return (
    <Modal title="Join Waitlist" subtitle={equipment.name} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Requested Start Date"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass()} /></Field>
          <Field label="Start Time"><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass()} /></Field>
          <Field label="Requested End Date"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass()} /></Field>
          <Field label="End Time"><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass()} /></Field>
        </div>
        <button
          onClick={() => onConfirm({ equipmentId: equipment.id, start: `${startDate}T${startTime}`, end: `${endDate}T${endTime}` })}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Confirm Waitlist
        </button>
      </div>
    </Modal>
  );
}
