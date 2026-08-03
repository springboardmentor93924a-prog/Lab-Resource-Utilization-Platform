import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5002;
const usersFile = path.resolve('./server/users.json');

app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON received:', err.message);
    return res.status(400).json({ message: 'Invalid JSON body.' });
  }
  next(err);
});

function readUsers() {
  try {
    const data = fs.readFileSync(usersFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read users file:', error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write users file:', error);
  }
}

let users = readUsers();

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'No account was found for this email.' });
  }
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials. Please use the password you registered with.' });
  }

  return res.json({ user: sanitizeUser(user), token: 'mock-jwt-token' });
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, phone, role, institution, department } = req.body;
  if (!firstName || !lastName || !email || !password || !phone || !role || !institution || !department) {
    return res.status(400).json({ message: 'All registration fields are required.' });
  }

  users = readUsers();
  const existingUser = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ message: 'This email is already registered.' });
  }

  const newUser = {
    id: `u${users.length + 1}`,
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email,
    phone,
    role,
    institution,
    department,
    avatarUrl: '',
    password,
  };
  users.push(newUser);
  writeUsers(users);

  return res.status(201).json({ user: sanitizeUser(newUser), token: 'mock-jwt-token' });
});

app.listen(PORT, () => {
  console.log(`Backend mock server running at http://localhost:${PORT}`);
});
