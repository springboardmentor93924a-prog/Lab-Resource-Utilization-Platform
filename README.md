# Lab-Resource-Utilization-Platform
Infosys Springboard Internship Project
# LabFlow Pro — Lab Resource Utilization Platform

A full-stack web application for managing laboratory resources, equipment, bookings, utilization, maintenance, users, and institutional workflows.

LabFlow Pro provides a centralized platform for educational and research institutions to manage laboratory resources efficiently through role-based access, approval workflows, equipment management, maintenance tracking, notifications, and utilization monitoring.

---

## 🌐 Live Application

The application is deployed and available online.

### Frontend

🔗 **LabFlow Pro:**  
https://lab-flow-pro-frontend.onrender.com

### Backend API

🔗 **Backend:**  
https://lab-flow-pro-backend.onrender.com

The frontend communicates with the deployed Spring Boot backend through REST APIs.

---

## 📌 Project Overview

Laboratories often manage equipment, bookings, maintenance, users, and resource utilization through disconnected systems or manual processes.

**LabFlow Pro** provides a centralized platform where institutions can:

- Manage institutions, departments, and laboratories
- Manage laboratory equipment
- Request and manage equipment bookings
- Handle booking approval and rejection workflows
- Monitor equipment utilization
- Track maintenance activities
- Report equipment issues
- Manage staff invitations
- Manage notifications
- Maintain audit records
- Manage equipment costs and billing
- Support resource-sharing workflows

The platform uses real backend APIs and persistent database data rather than frontend-only mock business data.

---

## ✨ Key Features

### 🔐 Authentication & Role-Based Access

The platform supports role-based access for:

- **Researcher**
- **Lab Manager**
- **Department Head**
- **Lab Technician**
- **Institution Admin**

Authentication and authorization are handled by the Spring Boot backend using Spring Security and JWT-based authentication.

---

### 🏢 Institution Management

Institution administrators can manage:

- Institution information
- Departments
- Laboratories
- Users
- Equipment
- Staff workflows

---

### 📅 Equipment Booking

Researchers can request laboratory equipment through the booking system.

The booking workflow supports:

- Equipment selection
- Date and time selection
- Booking requests
- Approval
- Rejection
- Rejection reasons
- Booking status tracking
- Agreement acceptance
- Booking history

---

### 🧪 Equipment Management

Equipment can be managed throughout its lifecycle.

Supported equipment statuses include:

- `AVAILABLE`
- `BOOKED`
- `UNDER_MAINTENANCE`
- `OUT_OF_SERVICE`
- `RETIRED`

Equipment information can include:

- Equipment details
- Laboratory assignment
- Availability
- Maintenance information
- Certification information
- Utilization information
- Issue reports
- Cost/rate information

---

### 📊 Utilization Monitoring

LabFlow Pro includes an **Equipment Utilization Heatmap** for monitoring resource usage.

Utilization can be viewed across different time periods:

- Day
- Week
- Month
- Year

The utilization system provides information such as:

- High utilization
- Low utilization
- Average utilization
- Idle periods

This helps institutions understand how laboratory equipment is being utilized.

---

### 🔧 Maintenance Management

The platform supports equipment maintenance workflows involving:

- Maintenance records
- Maintenance planning
- Technician assignments
- Manager review
- Maintenance dates
- Delay justification
- Equipment maintenance status

---

### 🐛 Equipment Issue Reporting

Users can report equipment-related issues through the platform.

Issue reporting and access are controlled according to the user's role and equipment access.

---

### 👥 Staff Management

Institution administrators can manage staff through an invitation-based workflow.

Supported staff roles include:

- Department Head
- Lab Manager
- Lab Technician

Staff accounts are managed through controlled invitation workflows rather than unrestricted public staff registration.

---

### 🔔 Notifications

LabFlow Pro provides backend-driven notifications for different user roles.

Notification functionality includes:

- Notification listing
- Unread notification count
- Read/unread status
- Marking notifications as read
- Role-specific notification views

Notifications are persisted through the backend database.

---

### 📝 Audit Logs

The platform maintains audit information for important administrative and operational actions.

Audit information can include:

- Timestamp
- User
- Role
- Institution
- Action
- Resource
- Result
- Metadata

This provides traceability for important system operations.

---

### 💰 Billing & Cost Management

The platform includes functionality for managing:

- Equipment rates
- Usage costs
- Billing information
- Invoices
- Cost records
- Payment status
- Budget-related information

---

### 🤝 Resource Sharing

The platform supports laboratory resource-sharing workflows where applicable.

Resource-sharing functionality includes concepts such as:

- Sharing requests
- MOU information
- Laboratory/resource details
- Sharing status

---

## 🏗️ System Architecture


                    ┌──────────────────────────┐
                    │      React Frontend      │
                    │                          │
                    │  Dashboards              │
                    │  Booking                 │
                    │  Equipment               │
                    │  Maintenance             │
                    │  Notifications           │
                    │  Administration          │
                    └────────────┬─────────────┘
                                 │
                              REST API
                                 │
                    ┌────────────▼─────────────┐
                    │     Spring Boot Backend  │
                    │                          │
                    │  Authentication          │
                    │  Authorization           │
                    │  Booking                 │
                    │  Equipment               │
                    │  Maintenance             │
                    │  Notifications           │
                    │  Audit                   │
                    │  Billing                 │
                    │  Utilization             │
                    └────────────┬─────────────┘
                                 │
                              JPA / SQL
                                 │
                    ┌────────────▼─────────────┐
                    │       PostgreSQL         │
                    │                          │
                    │  Institutions            │
                    │  Departments             │
                    │  Laboratories            │
                    │  Users                   │
                    │  Equipment               │
                    │  Bookings                │
                    │  Maintenance             │
                    │  Notifications           │
                    │  Audit Logs              │
                    └──────────────────────────┘

                    Technology Stack
Frontend
React
Vite
JavaScript
HTML5
CSS
REST API integration
WebSocket/STOMP integration where applicable
Backend
Java 21
Spring Boot
Spring Security
Spring Data JPA
Hibernate
REST APIs
WebSocket
JWT authentication
Flyway
Database
PostgreSQL
Neon PostgreSQL
Cloud & Deployment
Render
Neon
Cloudinary
Development Tools
IntelliJ IDEA
Visual Studio Code
Git
GitHub
Maven
🔒 Security

Security is primarily handled by the backend.

The application uses:

JWT authentication
Spring Security
Role-based authorization
Protected API endpoints
Controlled staff invitation workflows
Backend authorization checks
Audit logging
Environment-based configuration

Sensitive credentials such as:

Database passwords
JWT secrets
Cloudinary credentials
SMTP credentials
API keys

are not stored directly in the source code.

⚙️ Local Development
Prerequisites

Install:

Java 21
Node.js
npm
PostgreSQL
Git
Maven
Clone the Repository
git clone https://github.com/springboardmentor93924a-prog/Lab-Resource-Utilization-Platform/tree/team2-Nivetha
cd Lab-Resource-Utilization-Platform
Backend Setup
cd backend

Configure the required environment variables for:

PostgreSQL
JWT
Cloudinary
Mail services

Then run:

mvnw.cmd spring-boot:run

For Linux/macOS:

./mvnw spring-boot:run
Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

The frontend will start using the Vite development server.

🗄️ Database

The application uses PostgreSQL for persistent data storage.

Database migrations are managed using Flyway.

The production database is hosted using Neon PostgreSQL.

☁️ Deployment

The application is deployed using cloud services.

Frontend

The React/Vite frontend is deployed on:

Render Static Site

https://lab-flow-pro-frontend.onrender.com
Backend

The Spring Boot backend is deployed on:

Render Web Service

https://lab-flow-pro-backend.onrender.com
Database

Production PostgreSQL database:

Neon PostgreSQL

File & Image Storage

The application uses:

Cloudinary

for cloud-based file/image storage where applicable.

👤 User Roles
Role	Responsibility
Researcher	Search resources, request bookings, and use approved laboratory resources
Lab Manager	Manage laboratory operations, equipment, and maintenance workflows
Department Head	Manage department-level laboratory activities
Lab Technician	Handle equipment and maintenance-related operational tasks
Institution Admin	Manage institution-level users, departments, laboratories, and staff workflows
🎯 Project Goals

LabFlow Pro aims to provide:

Centralized laboratory resource management
Efficient equipment utilization
Transparent booking workflows
Better maintenance tracking
Role-based administration
Institutional resource visibility
Auditability and accountability
Data-driven laboratory management
Scalable cloud deployment
📌 Project Status

The project is actively developed and deployed.

Current capabilities
Authentication and authorization
Role-based dashboards
Institution management
Department management
Laboratory management
Equipment management
Equipment booking
Booking approval/rejection
Utilization monitoring
Maintenance management
Equipment issue reporting
Notifications
Staff invitations
Audit logging
Billing and cost management
Resource sharing
Cloud deployment
Deployment Status
Component	Platform	Status
Frontend	Render	🟢 Live
Backend	Render	🟢 Live
Database	Neon PostgreSQL	🟢 Connected
Image/File Storage	Cloudinary	🟢 Configured
