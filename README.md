# Lab Resource Utilization Platform

Full-stack platform for research institutions to manage shared lab equipment - inventory, booking, utilization tracking, inter-institution sharing, maintenance, cost and billing, and notifications.

## Team

Team 7

## Tech Stack

- Frontend: React, React Router, Axios, Tailwind CSS
- Backend: Spring Boot, Spring Security, JWT, PostgreSQL, Hibernate/JPA, Flyway
- Build tools: Maven (backend), Vite (frontend)

## Project Structure

backend/  - Spring Boot application
frontend/ - React application

## Contribution (Kush Saxena - team7-Kush)

- Built JWT-based authentication backend (Spring Boot + Spring Security), fixed critical role-normalization bug affecting all role-based access checks app-wide
- Built equipment inventory management (CRUD, categories, calibration alerts, photo upload)
- Built booking and scheduling system, including automatic waitlist handling for high-demand equipment
- Built real-time utilization tracking, heatmap visualization, and idle-time detection
- Built inter-institution equipment sharing: direct booking of shared equipment plus a full request to approve/reject workflow
- Built maintenance and work order management (log issues, assign technicians, track status through completion)
- Built cost and billing tracking: per-equipment hourly rates, automatic cost calculation on completed bookings, cost summary reporting by department and equipment
- Built in-app notification system with real-time triggers on booking and access-request approval/rejection
- Fixed numerous integration bugs between frontend and backend (field-name mismatches, missing endpoints, encoding issues)
- Added responsive mobile navigation (hamburger menu) and logout functionality across the app

## How to Run

### Backend

cd backend
./mvnw spring-boot:run

Requires PostgreSQL running locally with a database named LAB_RESOURCE_UTILISATIONDB. Update credentials in backend/src/main/resources/application.properties.

### Frontend

cd frontend
npm install
npm run dev

Runs on http://localhost:5173. Backend expected on http://localhost:8080.

## API Endpoints (selected)

- POST /auth/register - create account
- POST /auth/login - authenticate, returns JWT
- GET /auth/me - current user profile
- GET/POST /api/equipment - equipment inventory
- GET/POST/PUT /api/bookings - booking management
- GET /api/utilization/summary - utilization reporting
- GET/POST/PUT /api/access-requests - inter-institution sharing workflow
- GET/POST/PUT /api/work-orders - maintenance work orders
- GET /api/cost/summary - cost and billing reporting
- GET/PUT /api/notifications - in-app notifications
