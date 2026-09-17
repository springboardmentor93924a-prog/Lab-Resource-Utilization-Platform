# Lab Resource Utilization Platform

A full-stack web application that lets research institutions, universities, and laboratories share expensive lab equipment, schedule access, monitor real-time utilization, track maintenance, and analyze resource efficiency through a centralized dashboard.

*Built as part of the Infosys Springboard Virtual Internship 7.0.*

**🌐 Live Demo:** https://lab-resource-utilization-platform-team4.onrender.com

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Production Deployment](#-production-deployment)
- [Team](#-team)
- [License](#-license)

---

## 🔍 Overview
Institutions often own expensive lab equipment that sits idle in one department while another department (or a partner institution) needs it. This platform solves that by providing:
- A real-time equipment inventory and booking system
- Utilization tracking so admins can see what's being used and what's idle
- Inter-institution equipment sharing workflows
- Maintenance and calibration tracking
- Cost/billing tracking for shared equipment usage
- Role-based dashboards with analytics and reporting

---

## ✨ Features
- **Authentication & Access Control** — JWT-based login, password reset via email, role-based access control across 6 roles.
- **Equipment Inventory Management** — Registration, cataloging, status tracking (*Available / Booked / Under Maintenance / Out of Service / Retired*).
- **Booking & Scheduling** — Real-time availability, booking approval workflows, waitlist management with priority handling for urgent equipment issues.
- **Utilization Monitoring** — Usage tracking and utilization rate calculation per equipment/department.
- **Inter-Institution Resource Sharing** — Cross-institution equipment listing, access requests, approval workflows.
- **Maintenance & Calibration** — Issue reporting, technician assignment, calibration/certification record-keeping.
- **Cost & Billing Management** — Usage-based cost tracking, department-wise allocation, invoice generation.
- **Reports & Export** — PDF and Excel export for utilization, cost, and sharing reports.
- **Notifications** — Real-time in-app alerts via WebSocket, plus email notifications for bookings, approvals, and maintenance.
- **Analytics Dashboards** — Role-specific dashboards (*Researcher, Lab Manager, Department Head, Institution Admin*) with usage summaries, no-show rates, ROI/lifecycle metrics, and system monitoring.

---

## 👥 User Roles

| Role | Access |
| :--- | :--- |
| **Researcher / Student** | Book equipment, view own bookings, report issues |
| **Lab Technician** | Pick up and resolve equipment issue reports |
| **Lab Manager** | Approve/reject bookings & sharing requests, oversee maintenance |
| **Department Head** | View department booking/utilization statistics |
| **Institution Administrator** | Manage institution-wide equipment, users, and analytics |
| **System Administrator** | Full platform administration |

---

## 🛠️ Tech Stack

### Frontend
- **React 19 + Vite**
- **React Router** & **Axios**
- **Recharts** (charts/analytics)
- **STOMP/SockJS client** (real-time notifications)

### Backend
- **Java 17 + Spring Boot**
- **Spring Security + JWT authentication**
- **Spring Data JPA / Hibernate**
- **Spring WebSocket (STOMP/SockJS)** (real-time updates)
- **OpenPDF & Apache POI** (PDF/Excel report export)
- **Gradle**

### Cloud Infrastructure & Database
- **Database:** Hosted on **Neon** (Serverless PostgreSQL instance)
- **Backend Deployment:** Containerized with **Docker** and hosted as a managed **Web Service** on **Render**
- **Frontend Deployment:** Hosted as a **Static Site** on **Render**

---

## 📂 Project Structure

```text
Lab-Resource-Utilization-Platform/
├── backend/                 # Spring Boot application (Dockerized)
│   ├── src/main/java/...    # Controllers, services, repositories, entities
│   ├── src/main/resources/  # application.properties
│   ├── Dockerfile
│   └── build.gradle
├── frontend/                 # React (Vite) application
│   ├── src/                  # Components, pages, context
│   └── package.json
└── README.md
```

---

## 🌐 Production Deployment

The architecture is fully live and interconnected via secure environment variable configurations injected directly into the Render dashboard:

```text
[ Frontend: Vite on Render ] ────(HTTPS / WebSockets via VITE_API_BASE_URL)────► [ Backend: Docker on Render ] ────(Secure TCP)────► [ Database: Neon PostgreSQL ]
```

- **Frontend (Vite on Render):** Deployed as a **Static Site** leveraging Render's global CDN for performance, utilizing the dashboard-configured `VITE_API_BASE_URL` environment variable to route client network requests securely to the backend web service.
- **Backend (Docker on Render):** Containerized via a production `Dockerfile` and running as a managed **Web Service** where Render tracks the repository branch, triggers automatic Docker multi-stage builds on code push, and handles dynamic internal `$PORT` routing.
- **Database (Neon PostgreSQL):** Managed serverless PostgreSQL infrastructure hosted on Neon where credentials (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) and the `JWT_SECRET` are stored as hidden, encrypted environment variables inside the Render panel to protect sensitive keys.

---

## 👥 Team
- Chinta Dharani
- Aman Tiwari
- Vinay Sahu

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
