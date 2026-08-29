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

## My Contribution (Kundan Yadav — team7-Kundan)
- Built Login and Register pages (React + Tailwind), matching Week 1 wireframes
- Implemented JWT-based authentication backend (Spring Boot + Spring Security)
- Password hashing with BCrypt
- Connected backend to PostgreSQL via Hibernate/JPA
- Tested full registration and login flow end-to-end


## How to Run
### Backend
cd backend |
./mvnw spring-boot:run

Requires PostgreSQL running locally with a database named `lab_resource_db`. Update credentials in `backend/src/main/resources/application.properties`.

### Frontend
cd frontend |
npm install |
npm run dev |

Runs on `http://localhost:5173`. Backend expected on `http://localhost:8080`.

## API Endpoints (Auth)
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — authenticate, returns JWT
