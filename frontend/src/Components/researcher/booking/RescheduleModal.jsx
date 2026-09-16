import { useState } from "react";
import { Modal } from "../../common/Modal.jsx";
import { Field, inputClass } from "../../common/Field.jsx";

/* ================================================================== */
/*  Researcher -> Booking -> Reschedule Modal                          */
/* ================================================================== */
export default function RescheduleModal({ booking, equipment, onClose, onConfirm }) {
  const [start, setStart] = useState(booking.start);
  const [end, setEnd] = useState(booking.end);
  return (
    <Modal title="Reschedule Booking" subtitle={equipment?.name} onClose={onClose}>
      <div className="space-y-4">
        <Field label="New Start"><input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass()} /></Field>
        <Field label="New End"><input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass()} /></Field>
        <button onClick={() => onConfirm(start, end)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
          Submit Reschedule Request
        </button>
      </div>
    </Modal>
  );
}
