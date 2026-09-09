import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AvailabilityCalendar({ equipmentId, onSlotSelect, selectedSlot }) {
    const [bookings, setBookings] = useState([]);
    const [loadedEquipmentId, setLoadedEquipmentId] = useState(null);
    const loading = Boolean(equipmentId) && loadedEquipmentId !== equipmentId;

    
    useEffect(() => {
        if (!equipmentId) return;

        api.get(`/bookings/equipment/${equipmentId}`)
            .then(res => {
                setBookings(res.data || []);
            })
            .catch(err => {
                console.error("Failed to load bookings for equipment", err);
                setBookings([]);
            })
            .finally(() => {
                setLoadedEquipmentId(equipmentId);
            });
    }, [equipmentId]);

    // Generate next 7 days
    const generateDays = () => {
        const days = [];
        const pad = (n) => String(n).padStart(2, '0');
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            days.push({
                dateObj: d,
                dateStr: dateStr,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate()
            });
        }
        return days;
    };

    const days = generateDays();
    
    // Generate hours (09:00 to 17:00)
    const hours = [
        { label: "09-10", start: 9 },
        { label: "10-11", start: 10 },
        { label: "11-12", start: 11 },
        { label: "12-13", start: 12 },
        { label: "13-14", start: 13 },
        { label: "14-15", start: 14 },
        { label: "15-16", start: 15 },
        { label: "16-17", start: 16 }
    ];

    const getSlotStatus = (dateStr, hourStart) => {
        const slotStartStr = `${dateStr}T${String(hourStart).padStart(2, '0')}:00:00`;
        const slotEndStr = `${dateStr}T${String(hourStart + 1).padStart(2, '0')}:00:00`;
        
        const slotStartTime = new Date(slotStartStr).getTime();
        const slotEndTime = new Date(slotEndStr).getTime();

        for (const b of bookings) {
            // Ignore rejected or cancelled bookings for availability calculation
            const status = (b.status || b.bookingStatus || b.approvalStatus || "").toLowerCase();
            if (status === 'cancelled' || status === 'rejected') {
                continue;
            }

            const bookStart = new Date(b.startTime).getTime();
            const bookEnd = new Date(b.endTime).getTime();

            // Check if slot overlaps with booking
            if (slotStartTime < bookEnd && slotEndTime > bookStart) {
                if (status === 'pending') {
                    return { status: 'PENDING', booking: b };
                }
                return { status: 'BOOKED', booking: b };
            }
        }
        
        return { status: 'AVAILABLE', booking: null };
    };

    const handleSlotClick = (day, hour, statusInfo) => {
        const slotStartStr = `${String(hour.start).padStart(2, '0')}:00`;
        const slotEndStr = `${String(hour.start + 1).padStart(2, '0')}:00`;
        
        onSlotSelect({
            date: day.dateStr,
            startTime: slotStartStr,
            endTime: slotEndStr,
            status: statusInfo.status
        });
    };

    const isSelected = (day, hour) => {
        if (!selectedSlot) return false;
        const slotStartStr = `${String(hour.start).padStart(2, '0')}:00`;
        return selectedSlot.date === day.dateStr && selectedSlot.startTime === slotStartStr;
    };

    if (!equipmentId) {
        return <div className="text-muted small">Select an equipment to view availability.</div>;
    }

    return (
        <div className="availability-calendar mt-3">
            <h6 className="text-muted fw-bold mb-3">7-Day Availability</h6>
            
            {loading ? (
                <div className="text-center py-3"><span className="spinner-border spinner-border-sm text-primary"></span></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-sm text-center" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: '80px' }} className="align-middle">Time</th>
                                {days.map(d => (
                                    <th key={d.dateStr}>
                                        <div className="small fw-bold">{d.dayName}</div>
                                        <div className="small text-muted">{d.dayNum}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {hours.map(h => (
                                <tr key={h.start}>
                                    <td className="small text-muted align-middle">{h.label}</td>
                                    {days.map(d => {
                                        const statusInfo = getSlotStatus(d.dateStr, h.start);
                                        const selected = isSelected(d, h);
                                        
                                        let bgClass = "bg-white";
                                        let indicator = "⚪";
                                        
                                        if (statusInfo.status === 'AVAILABLE') {
                                            indicator = "🟢";
                                            bgClass = selected ? "bg-success text-white" : "hover-bg-light cursor-pointer";
                                        } else if (statusInfo.status === 'BOOKED') {
                                            indicator = "🔴";
                                            bgClass = selected ? "bg-danger text-white" : "bg-light text-muted cursor-pointer";
                                        } else if (statusInfo.status === 'PENDING') {
                                            indicator = "🟡";
                                            bgClass = selected ? "bg-warning text-white" : "bg-light text-muted cursor-pointer";
                                        }

                                        return (
                                            <td 
                                                key={d.dateStr} 
                                                className={`${bgClass} align-middle p-2 border`}
                                                onClick={() => handleSlotClick(d, h, statusInfo)}
                                                style={{ cursor: 'pointer' }}
                                                title={statusInfo.status}
                                            >
                                                {indicator}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="d-flex gap-3 justify-content-center mt-2 small">
                        <div><span>🟢</span> Available</div>
                        <div><span>🔴</span> Booked</div>
                        <div><span>🟡</span> Pending</div>
                        <div><span>⚪</span> Outside Hours</div>
                    </div>
                </div>
            )}
        </div>
    );
}
