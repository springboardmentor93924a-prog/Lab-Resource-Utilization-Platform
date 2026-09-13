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





