# 5. Functional and Non-Functional Requirements

## 5.1 Introduction

The Lab Resource Utilization Platform is designed to efficiently manage laboratory resources across institutions. The system provides secure authentication, equipment management, booking, maintenance, utilization tracking, billing, reporting, and analytics. The following sections describe the functional and non-functional requirements of the system.



# 5.2 Functional Requirements

Functional requirements describe the features and services that the system must provide.

## FR-01 User Authentication

- Users shall be able to register and log in securely.
- The system shall validate user credentials.
- JWT tokens shall be generated after successful login.
- Unauthorized users shall be denied access.



## FR-02 User Management

- Administrators shall create, update, and delete user accounts.
- User roles shall be assigned based on responsibilities.
- User permissions shall be managed using RBAC.



## FR-03 Institution Management

- Administrators shall create institutions.
- Institution details shall be updated whenever required.
- Institutions shall be linked with departments.



## FR-04 Department Management

- Departments shall be created under institutions.
- Users and equipment shall belong to departments.
- Department information shall be editable.



## FR-05 Equipment Management

- Equipment details shall be maintained.
- Equipment availability shall be tracked.
- Equipment status shall be updated automatically.
- Equipment shall be assigned to departments.



## FR-06 Booking Management

- Users shall search available equipment.
- Users shall submit booking requests.
- Lab Managers shall approve or reject bookings.
- Booking history shall be maintained.



## FR-07 Resource Sharing

- Institutions shall share laboratory equipment.
- Sharing requests shall require approval.
- Shared resources shall be visible to approved institutions.



## FR-08 External Booking

- External institutions shall create booking requests.
- Equipment availability shall be verified.
- External bookings shall be recorded.


## FR-09 Maintenance Management

- Maintenance schedules shall be created.
- Technicians shall update maintenance status.
- Maintenance history shall be stored.



## FR-10 Calibration Management

- Equipment calibration schedules shall be maintained.
- Calibration records shall be stored.
- Reminder notifications shall be generated.



## FR-11 Utilization Tracking

- Equipment usage start time shall be recorded.
- Equipment usage end time shall be recorded.
- Utilization duration shall be calculated.
- Utilization reports shall be generated.

## FR-12 Cost Tracking

- Equipment expenses shall be recorded.
- Maintenance costs shall be tracked.
- Cost reports shall be generated.



## FR-13 Billing Management

- Bills shall be generated for external bookings.
- Tax shall be calculated automatically.
- Payment status shall be maintained.



## FR-14 Reports

- Generate equipment reports.
- Generate booking reports.
- Generate maintenance reports.
- Generate billing reports.
- Export reports in multiple formats.



## FR-15 Dashboard & Analytics

- Display equipment statistics.
- Display booking statistics.
- Display utilization statistics.
- Display revenue and cost analysis.
- Provide graphical dashboards.



# 5.3 Non-Functional Requirements

Non-functional requirements define the quality attributes of the system.

## Performance

- Login response should be completed within 2 seconds.
- Search operations should return results quickly.
- Dashboard should load efficiently.



## Security

- JWT-based authentication.
- Role-Based Access Control (RBAC).
- Password encryption.
- Secure API communication.



## Reliability

- Database consistency shall be maintained.
- System shall prevent data loss.
- Backup mechanisms shall be supported.

---

## Scalability

- Support multiple institutions.
- Support thousands of users.
- Easily extendable with additional modules.



## Availability

- System should provide high availability.
- Users should access services with minimal downtime.


## Maintainability

- Modular architecture.
- Well-structured backend.
- Easy debugging and updates.


## Usability

- User-friendly interface.
- Simple navigation.
- Easy equipment search and booking.


## Compatibility

- Accessible through modern web browsers.
- Responsive design for different screen sizes.



# 5.4 Summary

The functional requirements define the major features provided by the Lab Resource Utilization Platform, while the non-functional requirements ensure that the application remains secure, reliable, scalable, and easy to maintain. Together, these requirements form the foundation for designing and implementing the complete system.
