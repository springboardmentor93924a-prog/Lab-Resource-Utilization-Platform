# Lab Resource Utilization Platform

Full-stack platform for research institutions to manage shared lab equipment — inventory, booking, utilization tracking, and maintenance.

## Team
**Team 7**

## Tech Stack
- **Frontend:** React, React Router, Axios, Tailwind CSS
- **Backend:** Spring Boot, Spring Security, JWT, PostgreSQL, Hibernate/JPA
- **Build tools:** Maven (backend), Vite (frontend)


## Project Structure
├── frontend/ # React application
└── backend/ # Spring Boot application

## My Contribution (Kundan Yadav — team7-Kundan)
- Built Login and Register pages (React + Tailwind), matching Week 1 wireframes
- Implemented JWT-based authentication backend (Spring Boot + Spring Security)
- Password hashing with BCrypt
- Connected backend to PostgreSQL via Hibernate/JPA
- Tested full registration and login flow end-to-end


## How to Run
### Backend
cd backend
./mvnw spring-boot:run

Requires PostgreSQL running locally with a database named `lab_resource_db`. Update credentials in `backend/src/main/resources/application.properties`.

### Frontend
cd frontend
npm install
npm run dev

Runs on `http://localhost:5173`. Backend expected on `http://localhost:8080`.

## API Endpoints (Auth)
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — authenticate, returns JWT
