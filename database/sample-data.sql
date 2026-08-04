-- ==========================================================
-- SAMPLE DATA
-- LAB RESOURCE UTILIZATION PLATFORM
-- ==========================================================

-- ==========================================================
-- 1. ROLES
-- ==========================================================

INSERT INTO roles (role_name, description)
VALUES
('SUPER_ADMIN', 'Complete platform administration'),
('INSTITUTION_ADMIN', 'Manage institution resources'),
('FACULTY', 'Faculty member'),
('STUDENT', 'Student');

-- ==========================================================
-- 2. INSTITUTIONS
-- ==========================================================

INSERT INTO institutions
(
institution_name,
address,
city,
state,
country,
email,
phone,
website
)
VALUES

(
'ABC University',
'Knowledge Park',
'Mumbai',
'Maharashtra',
'India',
'info@abc.edu',
'9876543210',
'https://www.abc.edu'
),

(
'XYZ Institute of Technology',
'Tech Valley',
'Pune',
'Maharashtra',
'India',
'contact@xyz.edu',
'9876543222',
'https://www.xyz.edu'
);

-- ==========================================================
-- 3. DEPARTMENTS
-- ==========================================================

INSERT INTO departments
(
institution_id,
department_name,
description
)
VALUES

(1,'Computer Science','Computer Science & Engineering'),

(1,'Mechanical Engineering','Mechanical Department'),

(1,'Electronics Engineering','Electronics Department'),

(2,'Computer Science','Computer Science Department'),

(2,'Civil Engineering','Civil Department');

-- ==========================================================
-- 4. USERS
-- ==========================================================

INSERT INTO users
(
role_id,
institution_id,
department_id,
first_name,
last_name,
email,
password,
phone
)
VALUES

(
1,
NULL,
NULL,
'System',
'Administrator',
'superadmin@platform.com',
'admin123',
'9999999999'
),

(
2,
1,
NULL,
'Rahul',
'Sharma',
'admin@abc.edu',
'admin123',
'9876500001'
),

(
2,
2,
NULL,
'Priya',
'Verma',
'admin@xyz.edu',
'admin123',
'9876500002'
),

(
3,
1,
1,
'Amit',
'Patil',
'faculty1@abc.edu',
'faculty123',
'9876500003'
),

(
3,
1,
2,
'Sneha',
'Kulkarni',
'faculty2@abc.edu',
'faculty123',
'9876500004'
),

(
3,
2,
4,
'Rohan',
'Joshi',
'faculty1@xyz.edu',
'faculty123',
'9876500005'
),

(
4,
1,
1,
'Faizan',
'Shaikh',
'student1@abc.edu',
'student123',
'9876500006'
),

(
4,
1,
1,
'Ali',
'Khan',
'student2@abc.edu',
'student123',
'9876500007'
),

(
4,
2,
4,
'Neha',
'Patel',
'student1@xyz.edu',
'student123',
'9876500008'
);

-- ==========================================================
-- 5. EQUIPMENT CATEGORIES
-- ==========================================================

INSERT INTO equipment_categories
(category_name,description)
VALUES

('Computer','Desktop Computers'),

('Laptop','Laptop Systems'),

('Projector','Projectors'),

('3D Printer','Rapid Prototyping'),

('Electronics Kit','Electronics Lab'),

('Microscope','Research Equipment');

-- ==========================================================
-- 6. EQUIPMENT
-- ==========================================================

INSERT INTO equipment
(
category_id,
institution_id,
department_id,
equipment_name,
model,
serial_number,
manufacturer,
purchase_date,
purchase_cost,
warranty_expiry,
status,
location,
description
)
VALUES

(
1,
1,
1,
'Dell Precision Workstation',
'T5820',
'CPU001',
'Dell',
'2024-01-15',
120000,
'2027-01-15',
'AVAILABLE',
'Computer Lab A',
'High Performance Workstation'
),

(
2,
1,
1,
'HP EliteBook',
'840 G10',
'LAP001',
'HP',
'2024-02-20',
85000,
'2027-02-20',
'AVAILABLE',
'Lab Store',
'Faculty Laptop'
),

(
4,
1,
2,
'Creality Ender 3',
'V2',
'3DP001',
'Creality',
'2023-10-12',
35000,
'2026-10-12',
'AVAILABLE',
'Innovation Lab',
'3D Printer'
),

(
6,
2,
5,
'Olympus Microscope',
'BX53',
'MIC001',
'Olympus',
'2023-05-01',
95000,
'2026-05-01',
'AVAILABLE',
'Research Lab',
'Digital Microscope'
);

-- ==========================================================
-- 7. BOOKINGS
-- ==========================================================

INSERT INTO bookings
(
user_id,
equipment_id,
booking_date,
start_time,
end_time,
purpose,
status,
remarks
)
VALUES

(
7,
1,
'2026-08-15',
'10:00',
'12:00',
'Machine Learning Project',
'APPROVED',
'Approved by Faculty'
),

(
8,
3,
'2026-08-18',
'14:00',
'16:00',
'Prototype Printing',
'PENDING',
NULL
),

(
9,
4,
'2026-08-20',
'09:00',
'11:00',
'Research Work',
'APPROVED',
NULL
);

-- ==========================================================
-- 8. MAINTENANCE
-- ==========================================================

INSERT INTO maintenance
(
equipment_id,
assigned_to,
maintenance_type,
start_date,
end_date,
remarks,
status
)
VALUES

(
1,
4,
'Software Update',
'2026-08-25',
'2026-08-25',
'Windows & Drivers Updated',
'COMPLETED'
),

(
3,
5,
'Calibration',
'2026-08-28',
'2026-08-28',
'Routine Maintenance',
'SCHEDULED'
);

-- ==========================================================
-- 9. NOTIFICATIONS
-- ==========================================================

INSERT INTO notifications
(
user_id,
title,
message,
type
)
VALUES

(
7,
'Booking Approved',
'Your booking has been approved.',
'BOOKING'
),

(
8,
'Booking Pending',
'Your booking is waiting for approval.',
'BOOKING'
),

(
4,
'Maintenance Assigned',
'Equipment maintenance has been assigned to you.',
'MAINTENANCE'
);