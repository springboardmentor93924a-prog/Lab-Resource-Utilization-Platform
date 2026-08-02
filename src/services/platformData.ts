export type ResourceStatus = 'Available' | 'Booked' | 'Maintenance' | 'Offline';

export interface EquipmentItem {
  id: string;
  name: string;
  location: string;
  status: ResourceStatus;
  vendor: string;
  warranty: string;
  department: string;
  calibrationDue: string;
  availability: string;
}

export interface BookingItem {
  id: string;
  resourceId: string;
  resourceName: string;
  requester: string;
  requesterRole: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  notes: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  asset: string;
  facility: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  due: string;
  assignedTo: string;
  description: string;
  createdAt: string;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  type: 'Maintenance' | 'Booking' | 'Announcement' | 'Compliance';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  unread: boolean;
  archived: boolean;
}

export interface DashboardSnapshot {
  summaryCards: Array<{ title: string; value: string; change: string; detail: string }>;
  trendData: Array<{ name: string; value: number }>;
  usageMix: Array<{ name: string; value: number }>;
  bookings: Array<{ time: string; resource: string; owner: string; status: string }>;
  recommendation: string;
}

export interface AuditEntry {
  id: string;
  entityType: 'Equipment' | 'Booking' | 'Maintenance';
  entityId: string;
  action: 'Create' | 'Update' | 'Delete' | 'Approve' | 'Reject' | 'Restore';
  performedBy: string;
  summary: string;
  timestamp: string;
}

export interface SearchResultItem {
  type: 'Equipment' | 'Booking' | 'User' | 'Lab';
  id: string;
  label: string;
  subtitle: string;
}

export interface DeletedItem {
  id: string;
  type: 'Equipment' | 'Booking' | 'Maintenance';
  label: string;
  deletedAt: string;
}

export interface NotificationPreferenceState {
  categories: Array<'Bookings' | 'Maintenance' | 'Compliance' | 'Announcements'>;
  channels: Array<'Email' | 'In-app' | 'SMS'>;
}

export interface PredictiveAlert {
  asset: string;
  risk: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface BookingRecommendation {
  title: string;
  detail: string;
}

interface PlatformState {
  equipment: EquipmentItem[];
  bookings: BookingItem[];
  maintenance: MaintenanceTicket[];
  notifications: PlatformNotification[];
  auditEntries: AuditEntry[];
  deletedItems: DeletedItem[];
}

const STORAGE_KEY = 'lab-platform-state-v1';

const initialEquipment: EquipmentItem[] = [
  { id: 'eq1', name: 'Confocal Microscope', location: 'Lab C', status: 'Booked', vendor: 'Zeiss', warranty: '2025-12-15', department: 'Biotech', calibrationDue: '2026-08-14', availability: 'Booked until 13:00' },
  { id: 'eq2', name: 'PCR Thermal Cycler', location: 'Lab A', status: 'Available', vendor: 'Bio-Rad', warranty: '2026-04-01', department: 'Genomics', calibrationDue: '2026-09-02', availability: 'Available now' },
  { id: 'eq3', name: 'HPLC System', location: 'Lab B', status: 'Maintenance', vendor: 'Agilent', warranty: '2024-10-31', department: 'Chemistry', calibrationDue: '2026-07-30', availability: 'Under maintenance' },
  { id: 'eq4', name: 'Cryogenic Freezer', location: 'Lab D', status: 'Available', vendor: 'Thermo Fisher', warranty: '2026-11-20', department: 'Physics', calibrationDue: '2026-08-19', availability: 'Available now' },
];

const initialBookings: BookingItem[] = [
  { id: 'bk1', resourceId: 'eq1', resourceName: 'Confocal Microscope', requester: 'Dr. Nisha Patel', requesterRole: 'Lab Manager', department: 'Biotech', date: '2026-08-01', startTime: '08:00', endTime: '10:00', status: 'Approved', notes: 'Cell imaging workflow', createdAt: '2026-07-29T10:00:00.000Z' },
  { id: 'bk2', resourceId: 'eq2', resourceName: 'PCR Thermal Cycler', requester: 'Anika Singh', requesterRole: 'Researcher', department: 'Genomics', date: '2026-08-01', startTime: '10:30', endTime: '12:30', status: 'Pending', notes: 'DNA extraction run', createdAt: '2026-07-29T12:00:00.000Z' },
  { id: 'bk3', resourceId: 'eq4', resourceName: 'Cryogenic Freezer', requester: 'Ravi Kumar', requesterRole: 'Lab Technician', department: 'Physics', date: '2026-08-02', startTime: '09:00', endTime: '11:00', status: 'Pending', notes: 'Sample storage access', createdAt: '2026-07-30T07:30:00.000Z' },
];

const initialMaintenance: MaintenanceTicket[] = [
  { id: 'mt1', asset: 'Mass Spectrometer', facility: 'Lab D', priority: 'High', status: 'In Progress', due: '2026-08-18', assignedTo: 'Ravi Kumar', description: 'Calibration drift detected at 2.3%', createdAt: '2026-07-29T08:00:00.000Z' },
  { id: 'mt2', asset: 'Air Handler', facility: 'Building 3', priority: 'Medium', status: 'Open', due: '2026-08-20', assignedTo: 'Mina Chen', description: 'Filter replacement scheduled', createdAt: '2026-07-30T09:00:00.000Z' },
];

const initialNotifications: PlatformNotification[] = [
  { id: 'nt1', title: 'Calibration due for HPLC System', message: 'Service window opens in 2 days.', type: 'Maintenance', priority: 'High', createdAt: '2026-07-30T08:00:00.000Z', unread: true, archived: false },
  { id: 'nt2', title: 'Booking approval required', message: 'A pending PCR request needs review.', type: 'Booking', priority: 'Medium', createdAt: '2026-07-30T09:00:00.000Z', unread: true, archived: false },
  { id: 'nt3', title: 'Audit reminder', message: 'Weekly equipment compliance report is due.', type: 'Compliance', priority: 'Low', createdAt: '2026-07-29T16:00:00.000Z', unread: false, archived: false },
];

const defaultState: PlatformState = {
  equipment: initialEquipment,
  bookings: initialBookings,
  maintenance: initialMaintenance,
  notifications: initialNotifications,
  auditEntries: [
    { id: 'ae1', entityType: 'Equipment', entityId: 'eq1', action: 'Create', performedBy: 'Dr. Nisha Patel', summary: 'Equipment registered', timestamp: '2026-07-29T10:00:00.000Z' },
    { id: 'ae2', entityType: 'Booking', entityId: 'bk2', action: 'Approve', performedBy: 'Dr. Nisha Patel', summary: 'Booking approved', timestamp: '2026-07-30T09:00:00.000Z' },
  ],
  deletedItems: [],
};

function readState(): PlatformState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }
    return JSON.parse(raw) as PlatformState;
  } catch {
    return defaultState;
  }
}

function writeState(nextState: PlatformState) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }
}

function delay(ms = 600) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  await delay();
  const state = readState();
  return {
    summaryCards: [
      { title: 'Active Labs', value: '24', change: '+12%', detail: '2 new rooms online' },
      { title: 'Bookings', value: String(state.bookings.filter((item) => item.status === 'Approved').length + 3), change: '+8%', detail: 'Higher occupancy than last week' },
      { title: 'Equipments', value: String(state.equipment.length), change: '+3%', detail: 'One device moved to maintenance' },
      { title: 'Utilization', value: '76%', change: '+5%', detail: 'Peak demand during afternoons' },
    ],
    trendData: [
      { name: 'Jan', value: 45 },
      { name: 'Feb', value: 52 },
      { name: 'Mar', value: 60 },
      { name: 'Apr', value: 58 },
      { name: 'May', value: 70 },
      { name: 'Jun', value: 76 },
    ],
    usageMix: [
      { name: 'Research', value: 42 },
      { name: 'Teaching', value: 33 },
      { name: 'Maintenance', value: 25 },
    ],
    bookings: state.bookings.slice(0, 3).map((item) => ({ time: `${item.startTime}–${item.endTime}`, resource: item.resourceName, owner: item.requester, status: item.status })),
    recommendation: 'Shift the imaging suite maintenance window to Friday afternoon to reduce booking conflicts by 18%.',
  };
}

export async function fetchEquipment() {
  await delay();
  return readState().equipment;
}

export async function fetchBookings() {
  await delay();
  return readState().bookings;
}

export async function fetchMaintenanceTickets() {
  await delay();
  return readState().maintenance;
}

export async function fetchNotifications() {
  await delay();
  return readState().notifications;
}

export async function getNotificationPreferences(): Promise<NotificationPreferenceState> {
  await delay();
  if (typeof window === 'undefined') {
    return { categories: ['Bookings', 'Maintenance', 'Compliance', 'Announcements'], channels: ['Email', 'In-app', 'SMS'] };
  }

  const stored = window.localStorage.getItem('lab-notification-prefs');
  if (!stored) {
    return { categories: ['Bookings', 'Maintenance', 'Compliance', 'Announcements'], channels: ['Email', 'In-app', 'SMS'] };
  }

  try {
    return JSON.parse(stored) as NotificationPreferenceState;
  } catch {
    return { categories: ['Bookings', 'Maintenance', 'Compliance', 'Announcements'], channels: ['Email', 'In-app', 'SMS'] };
  }
}

export async function saveNotificationPreferences(preferences: NotificationPreferenceState) {
  await delay();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('lab-notification-prefs', JSON.stringify(preferences));
  }
  return preferences;
}

export async function getOnboardingStatus() {
  await delay();
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem('lab-onboarding-complete') === 'true';
}

export async function completeOnboarding() {
  await delay();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('lab-onboarding-complete', 'true');
  }
  return true;
}

export async function getTenancyContext() {
  await delay();
  return {
    institution: 'Global Science University',
    boundary: 'All queries are scoped to the current institution by default.',
    sharingException: 'Cross-institution sharing requires an explicit agreement check before access is granted.',
  };
}

export async function getApprovalWorkflowRules() {
  await delay();
  return [
    { requestType: 'Booking', approverRole: 'Lab Manager', status: 'Pending approval' },
    { requestType: 'Equipment sharing', approverRole: 'Department Head', status: 'Pending approval' },
  ];
}

export async function getPredictiveMaintenanceAlerts(): Promise<PredictiveAlert[]> {
  await delay();
  return [
    { asset: 'HPLC System', risk: 'High', reason: 'Usage hours are above the service interval and a calibration check is overdue.' },
    { asset: 'Cryogenic Freezer', risk: 'Medium', reason: 'Recent temperature deviations suggest an inspection is likely within 14 days.' },
  ];
}

export async function getBookingRecommendations(): Promise<BookingRecommendation[]> {
  await delay();
  return [
    { title: 'Thursday slots are typically quieter', detail: 'The PCR Thermal Cycler is often free on Thursdays after 14:00.' },
    { title: 'Users also booked the freezer', detail: 'Users who booked the Cryogenic Freezer also reserved the microscope bay later in the day.' },
  ];
}

export async function fetchAuditEntries() {
  await delay();
  return readState().auditEntries;
}

export async function fetchDeletedItems() {
  await delay();
  return readState().deletedItems;
}

export async function searchPlatform(query: string): Promise<SearchResultItem[]> {
  await delay();
  const state = readState();
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const equipment = state.equipment.filter((item) => `${item.name} ${item.location} ${item.vendor}`.toLowerCase().includes(q)).map((item) => ({ type: 'Equipment' as const, id: item.id, label: item.name, subtitle: `${item.location} • ${item.status}` }));
  const bookings = state.bookings.filter((item) => `${item.resourceName} ${item.requester} ${item.department}`.toLowerCase().includes(q)).map((item) => ({ type: 'Booking' as const, id: item.id, label: item.resourceName, subtitle: `${item.requester} • ${item.status}` }));
  const users = [{ type: 'User' as const, id: 'u1', label: 'Dr. Nisha Patel', subtitle: 'Lab Manager' }];
  const labs = [{ type: 'Lab' as const, id: 'l1', label: 'Lab C', subtitle: 'Biotech' }];

  return [...equipment, ...bookings, ...users, ...labs].slice(0, 8);
}

export async function fetchSystemStatus() {
  await delay();
  return {
    database: 'Healthy',
    redis: 'Healthy',
    uptime: '99.98%',
    lastBackup: '2026-07-30 02:00 UTC',
  };
}

export async function createBooking(payload: {
  resourceId: string;
  requester: string;
  requesterRole: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}) {
  await delay();
  const state = readState();
  const resource = state.equipment.find((item) => item.id === payload.resourceId);

  if (!resource) {
    throw new Error('The selected resource does not exist.');
  }

  if (payload.startTime >= payload.endTime) {
    throw new Error('End time must be after the start time.');
  }

  const hasConflict = state.bookings.some((booking) => {
    if (booking.resourceId !== payload.resourceId || booking.status === 'Rejected' || booking.status === 'Cancelled') {
      return false;
    }
    return booking.date === payload.date && !(payload.endTime <= booking.startTime || payload.startTime >= booking.endTime);
  });

  if (hasConflict) {
    throw new Error('This time slot overlaps with an existing booking for the selected resource.');
  }

  if (resource.status === 'Maintenance' || resource.status === 'Offline') {
    throw new Error('The selected resource is unavailable for booking right now.');
  }

  const booking: BookingItem = {
    id: `bk${Date.now()}`,
    resourceId: resource.id,
    resourceName: resource.name,
    requester: payload.requester,
    requesterRole: payload.requesterRole,
    department: payload.department,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: 'Pending',
    notes: payload.notes,
    createdAt: new Date().toISOString(),
  };

  state.bookings = [booking, ...state.bookings];
  state.equipment = state.equipment.map((item) => (item.id === resource.id ? { ...item, status: 'Booked', availability: `Booked ${payload.date} ${payload.startTime}` } : item));
  state.auditEntries = [{ id: `ae${Date.now()}`, entityType: 'Booking', entityId: booking.id, action: 'Create', performedBy: payload.requester, summary: `Booking created for ${resource.name}`, timestamp: new Date().toISOString() }, ...state.auditEntries];

  writeState(state);
  return booking;
}

export async function updateBookingStatus(id: string, status: BookingItem['status']) {
  await delay();
  const state = readState();
  const booking = state.bookings.find((item) => item.id === id);
  if (!booking) {
    throw new Error('The booking could not be found.');
  }

  state.bookings = state.bookings.map((item) => (item.id === id ? { ...item, status } : item));

  if (status === 'Approved') {
    state.equipment = state.equipment.map((item) => (item.id === booking.resourceId ? { ...item, status: 'Booked', availability: `${booking.date} ${booking.startTime}` } : item));
  }

  if (status === 'Rejected' || status === 'Cancelled') {
    state.equipment = state.equipment.map((item) => (item.id === booking.resourceId ? { ...item, status: 'Available', availability: 'Available now' } : item));
  }

  state.auditEntries = [{ id: `ae${Date.now()}`, entityType: 'Booking', entityId: booking.id, action: status === 'Approved' ? 'Approve' : status === 'Rejected' ? 'Reject' : 'Update', performedBy: 'Dr. Nisha Patel', summary: `Booking ${status.toLowerCase()}`, timestamp: new Date().toISOString() }, ...state.auditEntries];

  writeState(state);
  return state.bookings.find((item) => item.id === id) ?? booking;
}

export async function createMaintenanceTicket(payload: {
  asset: string;
  facility: string;
  priority: MaintenanceTicket['priority'];
  description: string;
  assignedTo: string;
  due: string;
}) {
  await delay();
  const state = readState();
  const ticket: MaintenanceTicket = {
    id: `mt${Date.now()}`,
    asset: payload.asset,
    facility: payload.facility,
    priority: payload.priority,
    status: 'Open',
    due: payload.due,
    assignedTo: payload.assignedTo,
    description: payload.description,
    createdAt: new Date().toISOString(),
  };

  state.maintenance = [ticket, ...state.maintenance];
  state.auditEntries = [{ id: `ae${Date.now()}`, entityType: 'Maintenance', entityId: ticket.id, action: 'Create', performedBy: 'System', summary: `Maintenance ticket created for ${ticket.asset}`, timestamp: new Date().toISOString() }, ...state.auditEntries];
  writeState(state);
  return ticket;
}

export async function updateMaintenanceTicketStatus(id: string, status: MaintenanceTicket['status']) {
  await delay();
  const state = readState();
  const ticket = state.maintenance.find((item) => item.id === id);
  if (!ticket) {
    throw new Error('The maintenance ticket could not be found.');
  }

  state.maintenance = state.maintenance.map((item) => (item.id === id ? { ...item, status } : item));
  state.auditEntries = [{ id: `ae${Date.now()}`, entityType: 'Maintenance', entityId: ticket.id, action: status === 'Resolved' ? 'Update' : 'Update', performedBy: 'Dr. Nisha Patel', summary: `Maintenance status set to ${status}`, timestamp: new Date().toISOString() }, ...state.auditEntries];
  writeState(state);
  return state.maintenance.find((item) => item.id === id) ?? ticket;
}

export async function toggleNotificationState(id: string, action: 'read' | 'archive') {
  await delay();
  const state = readState();
  state.notifications = state.notifications.map((item) => {
    if (item.id !== id) {
      return item;
    }
    if (action === 'read') {
      return { ...item, unread: false };
    }
    return { ...item, archived: true };
  });
  writeState(state);
  return state.notifications.find((item) => item.id === id);
}

export async function softDeleteItem(id: string, type: DeletedItem['type'], label: string) {
  await delay();
  const state = readState();
  state.deletedItems = [{ id, type, label, deletedAt: new Date().toISOString() }, ...state.deletedItems];
  state.auditEntries = [{ id: `ae${Date.now()}`, entityType: type === 'Equipment' ? 'Equipment' : type === 'Booking' ? 'Booking' : 'Maintenance', entityId: id, action: 'Delete', performedBy: 'Dr. Nisha Patel', summary: `${type} deleted`, timestamp: new Date().toISOString() }, ...state.auditEntries];
  writeState(state);
  return state.deletedItems[0];
}

export async function restoreDeletedItem(id: string) {
  await delay();
  const state = readState();
  state.deletedItems = state.deletedItems.filter((item) => item.id !== id);
  state.auditEntries = [{ id: `ae${Date.now()}`, entityType: 'Equipment', entityId: id, action: 'Restore', performedBy: 'Dr. Nisha Patel', summary: 'Deleted item restored', timestamp: new Date().toISOString() }, ...state.auditEntries];
  writeState(state);
  return true;
}
