# Lab Resource Utilization Platform - Frontend

React + Vite frontend with both Tailwind CSS and regular CSS.

## Requirements
- Node.js 18 or newer (compatible with Node 22.11)
- npm

## Run
```bash
cd lab-resource-frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Backend URL
Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Expected authentication endpoints:
- `POST /api/auth/login`
- `POST /api/auth/register`

Expected equipment endpoint:
- `GET /api/equipment`

## Important
The protected dashboard requires a token in localStorage. For UI testing before backend is ready, open browser console and run:
```js
localStorage.setItem('token', 'demo-token')
location.href = '/dashboard'
```
