INSERT INTO roles (role_name, description)
VALUES
('Researcher', 'Can search and book equipment'),
('Student', 'Can request equipment booking'),
('Lab Technician', 'Maintains equipment'),
('Lab Manager', 'Approves bookings'),
('Department Head', 'Manages department'),
('Institution Administrator', 'Manages institution'),
('System Administrator', 'Full system access');


INSERT INTO institutions
(institution_name, email, phone, address, city, state, country)
VALUES
('Gudlavalleru Engineering College',
 'info@gec.edu',
 '9876543210',
 'Gudlavalleru',
 'Krishna',
 'Andhra Pradesh',
 'India');

 INSERT INTO institutions
(institution_name, email, phone, address, city, state, country)
VALUES
('Indian Institute of Technology Hyderabad', 'info@iith.ac.in', '04023016033', 'Kandi, Sangareddy', 'Hyderabad', 'Telangana', 'India'),

('Indian Institute of Technology Madras', 'info@iitm.ac.in', '04422578000', 'Sardar Patel Road', 'Chennai', 'Tamil Nadu', 'India'),

('National Institute of Technology Warangal', 'info@nitw.ac.in', '08702452000', 'Hanamkonda', 'Warangal', 'Telangana', 'India'),

('Vellore Institute of Technology', 'info@vit.ac.in', '04162202222', 'Katpadi Road', 'Vellore', 'Tamil Nadu', 'India'),

('SRM Institute of Science and Technology', 'info@srmist.edu.in', '04427417000', 'Kattankulathur', 'Chennai', 'Tamil Nadu', 'India'),

('Gudlavalleru Engineering College', 'info@gecgudlavalleru.ac.in', '08674273077', 'Gudlavalleru', 'Krishna', 'Andhra Pradesh', 'India'),

('Jawaharlal Nehru Technological University Hyderabad', 'registrar@jntuh.ac.in', '04023158661', 'Kukatpally', 'Hyderabad', 'Telangana', 'India'),

('Andhra University', 'registrar@andhrauniversity.edu.in', '08912844000', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh', 'India'),

('Anna University', 'registrar@annauniv.edu', '04422357004', 'Guindy', 'Chennai', 'Tamil Nadu', 'India'),

('Osmania University', 'registrar@osmania.ac.in', '04027098000', 'Tarnaka', 'Hyderabad', 'Telangana', 'India');



INSERT INTO departments
(institution_id, department_name, department_code, hod_name, email, phone, location)
VALUES
(1, 'Computer Science and Engineering', 'CSE', 'Dr. Rajesh Kumar', 'cse1@gec.edu', '08674273001', 'Block A'),

(1, 'Information Technology', 'IT', 'Dr. S. Ramesh', 'it1@gec.edu', '08674273002', 'Block B'),

(2, 'Artificial Intelligence', 'AI', 'Dr. Anil Sharma', 'ai@iith.ac.in', '04023016034', 'Academic Block 1'),

(2, 'Mechanical Engineering', 'ME', 'Dr. Kiran Rao', 'me@iith.ac.in', '04023016035', 'Academic Block 2'),

(3, 'Electronics and Communication Engineering', 'ECE', 'Dr. Priya Reddy', 'ece@nitw.ac.in', '08702452001', 'ECE Block'),

(4, 'Computer Science and Engineering', 'CSE', 'Dr. Vivek Kumar', 'cse@vit.ac.in', '04162202223', 'Silver Jubilee Block'),

(5, 'Cyber Security', 'CSY', 'Dr. Arvind Menon', 'cyber@srmist.edu.in', '04427417001', 'Technology Block');


INSERT INTO users
(role_id, institution_id, department_id, first_name, last_name,
 email, phone, employee_student_id, password_hash,
 gender, designation)
VALUES

(2,1,8,'Manosh','Reddy','manosh@gmail.com','9876543210','22IT001','password123','Male','Student'),

(4,1,7,'Rajesh','Kumar','rajesh@gecgudlavalleru.ac.in','9876543211','EMP101','password123','Male','Lab Manager'),

(3,2,9,'Anil','Sharma','anil@iith.ac.in','9876543212','EMP201','password123','Male','Lab Technician'),

(1,2,9,'Priya','Rao','priya@iith.ac.in','9876543213','RES301','password123','Female','Researcher'),

(5,3,11,'Suresh','Reddy','suresh@nitw.ac.in','9876543214','EMP401','password123','Male','Department Head');


INSERT INTO laboratories
(institution_id, department_id, lab_name, lab_code, lab_incharge, location, floor, capacity)
VALUES

(1,7,'Programming Lab','LAB101',7,'Block A','Ground Floor',60),

(1,8,'Database Lab','LAB102',7,'Block B','First Floor',50),

(2,9,'Artificial Intelligence Lab','LAB201',8,'Academic Block 1','Second Floor',45),

(2,10,'Robotics Lab','LAB202',8,'Academic Block 2','Ground Floor',35),

(3,11,'Embedded Systems Lab','LAB301',10,'ECE Block','First Floor',40);



INSERT INTO equipment_categories (category_name, description)
VALUES
('Desktop Computer','Desktop systems for laboratory work'),
('Laptop','Portable computers'),
('Projector','Digital projection device'),
('Printer','Printing device'),
('Scanner','Document scanner'),
('Router','Networking router'),
('Switch','Network switch'),
('Microscope','Biological microscope'),
('Oscilloscope','Electronic signal testing'),
('FPGA Board','Embedded hardware development'),
('Robotics Kit','Robotics learning kit'),
('3D Printer','Rapid prototyping machine'),
('Arduino Kit','Microcontroller development'),
('Raspberry Pi','Single-board computer'),
('Power Supply','Laboratory DC power supply');



INSERT INTO equipment
(laboratory_id, category_id, equipment_name, asset_tag, serial_number,
brand, model, purchase_date, warranty_expiry,
equipment_condition, availability_status,
purchase_cost, qr_code, remarks)
VALUES

(1,1,'Dell OptiPlex 7090','GEC-PC-001','DL7090A001','Dell','OptiPlex 7090',
'2024-01-15','2027-01-15','Excellent','Available',65000,'QR001','Student Programming PC'),

(1,1,'HP EliteDesk 800 G6','GEC-PC-002','HP800G6002','HP','EliteDesk 800 G6',
'2024-02-10','2027-02-10','Excellent','Available',62000,'QR002','Programming Practice'),

(1,2,'Lenovo ThinkPad E14','GEC-LT-001','LNE14001','Lenovo','ThinkPad E14',
'2024-03-05','2027-03-05','Good','Available',58000,'QR003','Faculty Laptop'),

(2,3,'Epson EB-X06 Projector','GEC-PJ-001','EPX06001','Epson','EB-X06',
'2023-07-18','2026-07-18','Excellent','Available',42000,'QR004','Database Presentations'),

(2,4,'HP LaserJet Pro M404','GEC-PR-001','HPLJ404001','HP','LaserJet Pro M404',
'2023-08-20','2026-08-20','Good','Available',18000,'QR005','Database Lab Printer'),

(2,6,'Cisco ISR 2901 Router','GEC-RT-001','CISCO2901','Cisco','ISR 2901',
'2023-05-15','2026-05-15','Excellent','Available',85000,'QR006','Networking Device'),

(3,1,'Dell Precision 3660','IITH-PC-001','DL3660001','Dell','Precision 3660',
'2024-01-25','2027-01-25','Excellent','Available',120000,'QR007','AI Workstation'),

(3,14,'Raspberry Pi 5','IITH-RPI-001','RPI5001','Raspberry Pi','Model B',
'2024-04-10','2027-04-10','Excellent','Available',9500,'QR008','Embedded AI'),

(3,2,'MacBook Pro M3','IITH-LT-001','MBPM3001','Apple','MacBook Pro M3',
'2024-05-18','2027-05-18','Excellent','Available',180000,'QR009','Research Laptop'),

(4,11,'LEGO Mindstorms EV3','IITH-RB-001','EV3001','LEGO','Mindstorms EV3',
'2024-02-14','2027-02-14','Excellent','Available',55000,'QR010','Robotics Training'),

(4,11,'Arduino Robotics Kit','IITH-RB-002','ARDKIT001','Arduino','Starter Kit',
'2024-03-08','2027-03-08','Good','Available',12000,'QR011','Robot Prototype'),

(5,9,'Tektronix TBS1102B Oscilloscope','NITW-OSC-001','TBS1102B001','Tektronix','TBS1102B',
'2023-01-12','2026-01-12','Excellent','Available',70000,'QR012','Signal Analysis'),

(5,7,'Cisco Catalyst 2960 Switch','NITW-SW-001','CAT2960001','Cisco','Catalyst 2960',
'2023-02-15','2026-02-15','Excellent','Available',42000,'QR013','Networking Lab'),

(5,6,'Cisco Router 2911','NITW-RT-001','ISR2911001','Cisco','2911',
'2023-03-10','2026-03-10','Good','Available',78000,'QR014','Routing Practice'),

(5,15,'DC Power Supply','NITW-PS-001','PS001','Keysight','E36312A',
'2023-04-20','2026-04-20','Excellent','Available',25000,'QR015','ECE Experiments');



INSERT INTO bookings
(user_id, equipment_id, booking_date, start_time, end_time,
purpose, booking_status, approved_by)
VALUES

(6,1,'2026-07-28','2026-07-28 09:00:00','2026-07-28 11:00:00',
'Programming Lab Practice','Approved',7),

(6,2,'2026-07-29','2026-07-29 10:00:00','2026-07-29 12:00:00',
'Java Project Development','Pending',NULL),

(8,7,'2026-07-30','2026-07-30 01:00:00','2026-07-30 04:00:00',
'AI Model Training','Approved',10),

(9,12,'2026-07-31','2026-07-31 09:30:00','2026-07-31 12:30:00',
'Signal Processing Research','Completed',10),

(6,10,'2026-08-01','2026-08-01 02:00:00','2026-08-01 05:00:00',
'Robotics Workshop','Approved',8);

INSERT INTO notifications
(user_id, title, message, notification_type)
VALUES

(6,
'Booking Approved',
'Your booking for Dell OptiPlex 7090 has been approved.',
'Booking'),

(6,
'Equipment Return Reminder',
'Please return the equipment before 5:00 PM.',
'Reminder'),

(7,
'Maintenance Assigned',
'Programming Lab Printer requires maintenance.',
'Maintenance'),

(8,
'Booking Request',
'A new booking request is awaiting your approval.',
'Booking'),

(10,
'System Update',
'New laboratory resources have been added successfully.',
'General');


INSERT INTO audit_logs
(user_id, action, table_name, record_id, description, ip_address)
VALUES

(6,
'LOGIN',
'users',
6,
'User logged into the system.',
'192.168.1.10'),

(7,
'ADD EQUIPMENT',
'equipment',
1,
'Added Dell OptiPlex 7090.',
'192.168.1.20'),

(7,
'APPROVE BOOKING',
'bookings',
1,
'Approved booking for Programming Lab.',
'192.168.1.20'),

(8,
'UPDATE MAINTENANCE',
'maintenance_records',
1,
'Maintenance status changed to Completed.',
'192.168.1.30'),

(10,
'GENERATE REPORT',
'equipment',
NULL,
'Generated monthly equipment utilization report.',
'192.168.1.40');