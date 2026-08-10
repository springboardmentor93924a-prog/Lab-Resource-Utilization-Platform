import type { UserProfile, UserRole } from '../features/auth/types';

type MockUser = UserProfile & { password: string };

const seedUsers: MockUser[] = [
  { id: 'u1', name: 'Dr. Nisha Patel', firstName: 'Nisha', lastName: 'Patel', email: 'nisha.patel@university.edu', phone: '+1-555-0101', role: 'Lab Manager', institution: 'Global Science University', department: 'Biotech', avatarUrl: '', password: 'Password123!' },
  { id: 'u2', name: 'Ravi Kumar', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi.kumar@university.edu', phone: '+1-555-0102', role: 'Lab Technician', institution: 'Global Science University', department: 'Chemical Engineering', avatarUrl: '', password: 'Password123!' },
  { id: 'u3', name: 'Anika Singh', firstName: 'Anika', lastName: 'Singh', email: 'anika.singh@university.edu', phone: '+1-555-0103', role: 'Researcher', institution: 'Global Science University', department: 'Physics', avatarUrl: '', password: 'Password123!' },
];

const users: MockUser[] = [...seedUsers];

export async function mockLogin(email: string, password: string) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('No account was found for this email.');
  }

  if (user.password !== normalizedPassword) {
    throw new Error('Invalid credentials. Please use the password you registered with.');
  }

  const { password: _password, ...safeUser } = user;
  return { user: safeUser as UserProfile, token: 'mock-jwt-token' };
}

export async function mockRegister(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  institution: string;
  department: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const normalizedEmail = payload.email.trim().toLowerCase();
  const isDuplicate = users.some((item) => item.email.toLowerCase() === normalizedEmail);

  if (isDuplicate) {
    throw new Error('This email is already registered.');
  }

  const newUser: MockUser = {
    id: `u${users.length + 1}`,
    name: `${payload.firstName} ${payload.lastName}`.trim(),
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email.trim(),
    phone: payload.phone,
    role: payload.role,
    institution: payload.institution,
    department: payload.department,
    avatarUrl: '',
    password: payload.password,
  };

  users.push(newUser);
  const { password: _password, ...safeUser } = newUser;
  return { user: safeUser as UserProfile, token: 'mock-jwt-token' };
}
