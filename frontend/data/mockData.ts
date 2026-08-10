export const dashboardSummary = [
  { title: 'Active Labs', value: '24', change: '+12%' },
  { title: 'Pending Approvals', value: '18', change: '+5%' },
  { title: 'Equipment Online', value: '1,386', change: '+4%' },
  { title: 'Utilization Rate', value: '78%', change: '+6%' },
];

export const upcomingBookings = [
  { time: '08:00', resource: 'Confocal Microscope', owner: 'Dr. Nisha Patel', status: 'Confirmed' },
  { time: '10:30', resource: 'PCR Thermal Cycler', owner: 'Anika Singh', status: 'Awaiting Approval' },
  { time: '13:00', resource: 'HPLC System', owner: 'Ravi Kumar', status: 'Checked Out' },
];

export const equipmentList = [
  { id: 'eq1', name: 'Confocal Microscope', location: 'Lab C', status: 'Booked', vendor: 'Zeiss', warranty: '2025-12-15' },
  { id: 'eq2', name: 'PCR Thermal Cycler', location: 'Lab A', status: 'Available', vendor: 'Bio-Rad', warranty: '2026-04-01' },
  { id: 'eq3', name: 'HPLC System', location: 'Lab B', status: 'Maintenance', vendor: 'Agilent', warranty: '2024-10-31' },
];

export const bookingRequests = [
  { id: 'bk1', resource: 'Spectrophotometer', requester: 'Dr. Meera Iyer', department: 'Biochemistry', date: '2026-08-14', status: 'Pending' },
  { id: 'bk2', resource: 'Autoclave Suite', requester: 'Team Nano', department: 'Materials', date: '2026-08-15', status: 'Approved' },
  { id: 'bk3', resource: 'Cryogenic Freezer', requester: 'Sahil Rao', department: 'Physics', date: '2026-08-16', status: 'Waitlist' },
];

export const maintenanceTickets = [
  { id: 'mt1', asset: 'Mass Spectrometer', facility: 'Lab D', priority: 'High', status: 'In Progress', due: '2026-08-18' },
  { id: 'mt2', asset: 'Air Handler', facility: 'Building 3', priority: 'Medium', status: 'Scheduled', due: '2026-08-20' },
  { id: 'mt3', asset: 'Safety Shower', facility: 'Lab A', priority: 'Low', status: 'Completed', due: '2026-08-12' },
];

export const notifications = [
  { id: 'nt1', title: 'Calibration due for HPLC System', type: 'Maintenance', priority: 'High', time: '15 mins ago', unread: true },
  { id: 'nt2', title: 'Booking approval required for Spectrophotometer', type: 'Approval', priority: 'Medium', time: '1 hour ago', unread: true },
  { id: 'nt3', title: 'System maintenance scheduled tonight', type: 'Announcement', priority: 'Low', time: 'Yesterday', unread: false },
];
