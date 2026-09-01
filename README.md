# Lab Resource Utilization Platform

Full-stack platform for research institutions to manage shared lab equipment — inventory, booking, utilization tracking, and maintenance.

## Team
**Team 7**

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS
- Vite

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- REST APIs
- Hibernate / JPA
- Maven

### Database
- PostgreSQL
- pgAdmin 4

### Authentication & Security
- JWT-based authentication
- Spring Security
- Role-based access control

### File Management
- Multipart file upload
- PDF document storage
- File download and viewing
- Equipment manuals and calibration certificates

### Development Tools
- Visual Studio Code
- IntelliJ IDEA
- Git
- GitHub
- Postman
- pgAdmin 4

### API & Communication
- RESTful APIs
- Axios
- HTTP/JSON

### Version Control
- Git
- GitHub
- Feature-based Git branches

## Project Structure
├── frontend/ # React application
└── backend/ # Spring Boot application



## HOW TO RUN THE PROJECT
### Backend
cd backend |
.\mvnw spring-boot:run |

Requires PostgreSQL running locally with a database named `lab_resource_db`. Update credentials in `backend/src/main/resources/application.properties`.

### Frontend
cd frontend |
npm install |
npm run dev |

Frontend Runs on `http://localhost:5173`. Backend expected on `http://localhost:8080`.



## API Endpoints

### Authentication
- `POST /api/auth/register` — create a new user account
- `POST /api/auth/google/register` — register using Google authentication
- `POST /api/auth/login` — authenticate user and return JWT
- `POST /api/auth/forgot-password` — initiate password recovery
- `POST /api/auth/reset-password` — reset user password
- `GET /api/auth/me` — get current authenticated user

### Equipment
- `GET /api/equipment` — get all equipment
- `GET /api/equipment/{id}` — get equipment by ID
- `POST /api/equipment` — add new equipment
- `PUT /api/equipment/{id}` — update equipment
- `DELETE /api/equipment/{id}` — delete equipment
- `GET /api/equipment/utilization` — get equipment utilization data
- `GET /api/equipment/utilization/heatmap` — get utilization heatmap data
- `GET /api/equipment/calibration-alerts` — get calibration alerts
- `GET /api/equipment/reports/utilization-cost` — generate utilization and cost report
- `GET /api/equipment/reports/utilization-cost/csv` — export utilization and cost report as CSV
- `GET /api/equipment/reports/procurement-cost` — generate procurement cost report
- `GET /api/equipment/reports/procurement-cost/csv` — export procurement cost report as CSV

### Bookings
- `POST /api/bookings` — create a booking
- `GET /api/bookings` — get bookings
- `GET /api/bookings/{id}` — get booking by ID
- `GET /api/bookings/user/{userId}` — get bookings for a user
- `GET /api/bookings/equipment/{equipmentId}` — get bookings for equipment
- `GET /api/bookings/reports/department-usage` — get department usage report
- `PUT /api/bookings/{id}/cancel` — cancel a booking
- `DELETE /api/bookings/{id}` — delete a booking
- `PUT /api/bookings/{id}/approve` — approve a booking
- `PUT /api/bookings/{id}/reject` — reject a booking

### Waitlist
- `POST /api/waitlist` — add a user to the waitlist
- `GET /api/waitlist/my` — get current user's waitlist entries

### Maintenance & Work Orders
- `POST /api/work-orders` — create a maintenance work order
- `GET /api/work-orders` — get work orders
- `GET /api/work-orders/my` — get current user's work orders
- `GET /api/work-orders/equipment/{equipmentId}` — get work orders for equipment
- `GET /api/work-orders/reports/maintenance-downtime` — get maintenance downtime report
- `PUT /api/work-orders/{id}/assign` — assign a work order
- `PUT /api/work-orders/{id}/complete` — complete a work order

### Calibration & Feedback
- `POST /api/feedback` — submit equipment feedback
- `GET /api/feedback` — get feedback
- `GET /api/feedback/new` — get new feedback
- `GET /api/feedback/equipment/{equipmentId}` — get feedback for equipment
- `GET /api/feedback/submitter/{submittedById}` — get feedback submitted by a user
- `PUT /api/feedback/{id}/status` — update feedback status

### Billing
- `GET /api/billing/my-institution` — get billing information for user's institution
- `GET /api/billing/owed-to-me` — get amounts owed
- `GET /api/billing/department-summary` — get department billing summary
- `PUT /api/billing/{id}/mark-paid` — mark a billing record as paid

### Analytics
- `GET /api/analytics/me` — get analytics for the current user

### Notifications
- `GET /api/notifications/my` — get current user's notifications
- `GET /api/notifications/unread-count` — get unread notification count
- `PUT /api/notifications/{id}/read` — mark a notification as read
- `DELETE /api/notifications/{id}` — delete a notification
- `DELETE /api/notifications/read` — delete/read-clear notifications

### Access Requests & Sharing
- `POST /api/access-requests` — create an access request
- `GET /api/access-requests/pending` — get pending access requests
- `GET /api/access-requests/my` — get current user's access requests
- `PUT /api/access-requests/{id}/approve` — approve an access request
- `PUT /api/access-requests/{id}/reject` — reject an access request
- `GET /api/access-requests/reports/inter-institution-sharing` — get inter-institution sharing report

### File Management
- `POST /api/files/upload` — upload a file
- `GET /api/files/{filename}` — retrieve/download an uploaded file
