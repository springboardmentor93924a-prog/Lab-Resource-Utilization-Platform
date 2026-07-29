\# Lab Resource Utilization Platform - PostgreSQL Database



\## Overview



This folder contains the PostgreSQL database scripts for the \*\*Lab Resource Utilization Platform\*\*.



The database is designed to support laboratory resource management, equipment tracking, booking management, maintenance tracking, notifications, and audit logging.



\---



\## Technologies Used



\- PostgreSQL 17

\- pgAdmin 4



\---



\## Database Name



```

lab\_resource\_db

```



\---



\## Folder Structure



```

database/

│

├── schema.sql

├── sample\_data.sql

└── README.md

```



\---



\## Database Tables



The project contains the following tables:



1\. roles

2\. institutions

3\. departments

4\. users

5\. laboratories

6\. equipment\_categories

7\. equipment

8\. bookings

9\. maintenance\_records

10\. notifications

11\. audit\_logs



\---



\## Database Relationships



```

Roles

&#x20;  │

&#x20;  ▼

Users

&#x20;  │

&#x20;  ├──────────────┐

&#x20;  ▼              ▼

Bookings     Notifications

&#x20;  │

&#x20;  ▼

Equipment

&#x20;  ▲

Laboratories

&#x20;  ▲

Departments

&#x20;  ▲

Institutions



Equipment

&#x20;     │

&#x20;     ▼

Maintenance Records



Users

&#x20;     │

&#x20;     ▼

Audit Logs

```



\---



\## Setup Instructions



\### Step 1



Create a PostgreSQL database.



```sql

CREATE DATABASE lab\_resource\_db;

```



\---



\### Step 2



Connect to the database using pgAdmin or psql.



\---



\### Step 3



Execute the schema file.



```sql

\\i schema.sql

```



or open \*\*schema.sql\*\* in pgAdmin and execute it.



\---



\### Step 4



Execute the sample data file.



```sql

\\i sample\_data.sql

```



or open \*\*sample\_data.sql\*\* in pgAdmin and execute it.



\---



\## Features Covered



\- User Management

\- Institution Management

\- Department Management

\- Laboratory Management

\- Equipment Inventory

\- Equipment Categories

\- Equipment Booking

\- Maintenance Tracking

\- Notification Management

\- Audit Logging



\---



\## Developed By



\*\*Manosh Reddy Gandra\*\*



B.Tech - Information Technology



Database Developer



Lab Resource Utilization Platform



\---



\## Notes



\- Execute `schema.sql` before `sample\_data.sql`.

\- Foreign key constraints are already defined.

\- Sample data is included for testing.

\- The backend application can directly connect to this database.



\---



\## Future Enhancements



\- QR Code Integration

\- Equipment Availability Dashboard

\- Email Notifications

\- Role-Based Access Control (RBAC)

\- Analytics Dashboard

\- Report Generation



\---



\## License



This project is developed for academic and educational purposes.

