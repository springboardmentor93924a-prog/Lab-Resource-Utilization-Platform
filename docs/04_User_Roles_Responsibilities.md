4. User Roles and Permissions
4.1 Overview

The Lab Resource Utilization Platform supports multiple user roles to ensure secure and efficient management of laboratory resources. Each role has specific responsibilities and permissions based on its operational requirements. Role-Based Access Control (RBAC) ensures that users can access only the functionalities assigned to them.

4.2 User Roles
1. Platform Administrator

Responsibilities

Manage institutions and departments.
Create and manage user accounts.
Assign user roles and permissions.
Monitor system activities.
Access reports and analytics.

Permissions

Full system access.
CRUD operations on all modules.
Configure system settings.
2. Lab Manager

Responsibilities

Manage laboratory equipment.
Approve or reject booking requests.
Schedule maintenance and calibration.
Monitor equipment utilization.

Permissions

Manage equipment records.
Approve bookings.
View utilization reports.
Create maintenance records.
3. Technician

Responsibilities

Perform equipment maintenance.
Conduct calibration activities.
Update equipment status.
Record maintenance history.

Permissions

View assigned equipment.
Update maintenance records.
Update calibration records.
4. Researcher / Faculty

Responsibilities

Search laboratory equipment.
Create booking requests.
View booking history.
Use allocated equipment.

Permissions

View available equipment.
Create and manage personal bookings.
View booking status.
5. Student

Responsibilities

Search available equipment.
Submit booking requests.
View booking details.

Permissions

View equipment.
Create booking requests.
View own bookings.
6. External Institution User

Responsibilities

Request shared laboratory resources.
Create external booking requests.
View invoice and payment status.

Permissions

View shared equipment.
Create external bookings.
Access billing information.
4.3 Role-Permission Matrix
Module	Admin	Lab Manager	Technician	Researcher	Student	External User
User Management	✓	✗	✗	✗	✗	✗
Institution Management	✓	✗	✗	✗	✗	✗
Department Management	✓	✓	✗	✗	✗	✗
Equipment Management	✓	✓	✗	View	View	View Shared
Booking Management	✓	✓	✗	✓	✓	✓
Resource Sharing	✓	✓	✗	✗	✗	✓
Maintenance	✓	✓	✓	View	View	✗
Calibration	✓	✓	✓	View	View	✗
Utilization Tracking	✓	✓	✓	View	✗	✗
Cost & Billing	✓	✓	✗	View	✗	View
Reports & Dashboard	✓	✓	View	View	✗	✗
4.4 Role-Based Access Flow
User logs into the system.
Authentication validates credentials.
User role is identified.
Permissions are loaded based on the assigned role.
Access to system modules is granted accordingly.
Unauthorized requests are denied.
