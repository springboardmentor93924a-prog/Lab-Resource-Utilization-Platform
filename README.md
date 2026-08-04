
# Lab Resource Utilization Platform

## Project Overview

A web-based platform to manage laboratory resources across educational institutions. The system provides secure role-based access for administrators, faculty, and students to manage labs, equipment, and bookings.

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 4.1
- Spring Security
- JWT Authentication
- Spring Data JPA
- PostgreSQL
- Maven

### Frontend
- React (Vite)
- Material UI
- Axios
- React Router

---

## Features Completed (Backend)

- JWT Authentication
- Email-based Login
- BCrypt Password Encryption
- Role-Based Authentication
- Spring Security Configuration
- PostgreSQL Integration
- JPA Entities & Repositories

---

## User Roles

- SUPER_ADMIN
- INSTITUTION_ADMIN
- FACULTY
- STUDENT

---

## Database

Database scripts are available in the `database/` folder:

- `schema.sql`
- `sample_data.sql`

---

## Backend Setup

```bash
cd backend
mvn spring-boot:run
```

Server runs at:

```
http://localhost:8080
```

---

## Current Status

- ✅ Backend Authentication Completed
- 🔄 Frontend Development In Progress
- ⏳ Institution, Department, Lab, Equipment & Booking Modules Pending
