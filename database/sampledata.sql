INSERT INTO roles (role_name, description)
VALUES
('Admin', 'Manages users, equipment, bookings, and maintenance'),
('Faculty', 'Can view and book laboratory equipment'),
('Student', 'Can view and book available laboratory equipment'),
('Lab Technician', 'Manages equipment availability and maintenance');

INSERT INTO departments (department_name, description)
VALUES
('Computer Science and Business Systems',
 'Department for CSBS students and faculty'),

('Computer Science and Engineering',
 'Department for CSE students and faculty'),

('Electronics and Communication Engineering',
 'Department for ECE students and faculty'),

('Information Technology',
 'Department for IT students and faculty');

 INSERT INTO users
(full_name, email, password, phone, role_id, department_id, status)
VALUES
('Admin User', 'admin@labplatform.com', 'admin123', '9876543210', 1, 1, 'Active'),

('Dr. Ravi Kumar', 'ravi.kumar@college.edu', 'faculty123', '9876543211', 2, 1, 'Active'),

('Dr. Priya Sharma', 'priya.sharma@college.edu', 'faculty123', '9876543212', 2, 2, 'Active'),

('Arjun Reddy', 'arjun.reddy@college.edu', 'student123', '9876543213', 3, 1, 'Active'),

('Sneha Rao', 'sneha.rao@college.edu', 'student123', '9876543214', 3, 1, 'Active'),

('Kiran Kumar', 'kiran.kumar@college.edu', 'student123', '9876543215', 3, 2, 'Active'),

('Vijay Technician', 'vijay.tech@college.edu', 'tech123', '9876543216', 4, 1, 'Active');

INSERT INTO equipment
(equipment_name, category, serial_number, location, status, department_id, purchase_date)
VALUES
('Dell Desktop Computer', 'Computer', 'LAB-PC-001', 'Computer Lab 1', 'Available', 1, '2024-01-15'),

('HP Desktop Computer', 'Computer', 'LAB-PC-002', 'Computer Lab 1', 'Available', 1, '2024-02-10'),

('Dell Laptop', 'Laptop', 'LAB-LAP-001', 'Computer Lab 2', 'Available', 1, '2024-03-05'),

('HP Laptop', 'Laptop', 'LAB-LAP-002', 'Computer Lab 2', 'Reserved', 1, '2024-03-15'),

('Arduino Uno', 'Microcontroller', 'ARD-UNO-001', 'IoT Lab', 'Available', 1, '2023-11-20'),

('Raspberry Pi 4', 'Embedded System', 'RPI-004-001', 'IoT Lab', 'Available', 1, '2023-12-10'),

('Digital Oscilloscope', 'Measurement Equipment', 'OSC-001', 'ECE Lab', 'Available', 3, '2023-08-12'),

('Function Generator', 'Measurement Equipment', 'FG-001', 'ECE Lab', 'Maintenance', 3, '2023-09-18'),

('Projector', 'Display Equipment', 'PROJ-001', 'Seminar Hall', 'Available', 1, '2024-01-05'),

('Network Switch', 'Networking Equipment', 'SW-001', 'Networking Lab', 'Available', 4, '2024-04-20');

INSERT INTO bookings
(user_id, equipment_id, booking_date, start_time, end_time, booking_status, purpose)
VALUES
(4, 1, '2026-08-04', '2026-08-04 09:00:00', '2026-08-04 11:00:00',
 'Completed', 'Programming laboratory work'),

(5, 3, '2026-08-04', '2026-08-04 11:00:00', '2026-08-04 13:00:00',
 'Confirmed', 'Final year project development'),

(6, 5, '2026-08-05', '2026-08-05 10:00:00', '2026-08-05 12:00:00',
 'Confirmed', 'IoT project testing'),

(2, 6, '2026-08-05', '2026-08-05 14:00:00', '2026-08-05 16:00:00',
 'Confirmed', 'Embedded systems demonstration'),

(4, 9, '2026-08-06', '2026-08-06 10:00:00', '2026-08-06 11:00:00',
 'Pending', 'Project presentation'),

(5, 4, '2026-08-07', '2026-08-07 09:00:00', '2026-08-07 11:00:00',
 'Confirmed', 'Machine learning project work');

 INSERT INTO maintenance
(equipment_id, maintenance_date, maintenance_type, description,
 maintenance_status, next_maintenance_date)
VALUES
(1, '2026-07-10', 'Routine Maintenance',
 'System cleaning and hardware inspection',
 'Completed', '2026-10-10'),

(3, '2026-07-15', 'Software Maintenance',
 'Operating system and required software updates',
 'Completed', '2026-10-15'),

(5, '2026-07-20', 'Routine Maintenance',
 'Arduino board inspection and testing',
 'Completed', '2026-10-20'),

(6, '2026-07-25', 'Routine Maintenance',
 'Raspberry Pi hardware and operating system check',
 'Completed', '2026-10-25'),

(8, '2026-08-01', 'Repair',
 'Equipment calibration and component inspection',
 'In Progress', '2026-11-01'),

(10, '2026-07-28', 'Network Maintenance',
 'Firmware update and connectivity testing',
 'Completed', '2026-10-28');