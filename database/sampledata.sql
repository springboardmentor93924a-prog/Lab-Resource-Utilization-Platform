INSERT INTO roles (role_name, description) VALUES
('STUDENT', 'Can browse and book available lab equipment'),
('LAB_TECHNICIAN', 'Manages equipment availability and maintenance'),
('LAB_MANAGER', 'Approves bookings, manages waitlist and equipment'),
('DEPARTMENT_HEAD', 'Oversees department-level resource usage'),
('INSTITUTION_ADMIN', 'Oversees the whole institution'),
('SYSTEM_ADMIN', 'Full system access');

INSERT INTO institutions (institution_name, location) VALUES
('Sunrise Institute of Technology', 'Hyderabad, India'),
('Metro College of Engineering', 'Bengaluru, India');

INSERT INTO departments (department_name) VALUES
('Computer Science'),
('Electronics & Communication'),
('Mechanical Engineering');

INSERT INTO institution_departments (institution_id, department_id) VALUES
(1, 1), -- Sunrise - Computer Science
(1, 2), -- Sunrise - Electronics & Communication
(2, 1), -- Metro   - Computer Science
(2, 3); -- Metro   - Mechanical Engineering

INSERT INTO equipment (equipment_name, category, serial_number, location, status, department_id, institution_id, purchase_date, requires_approval) VALUES
('Dell Precision Workstation', 'Computer', 'SUN-PC-001', 'CS Lab 1', 'Available', 1, 1, '2025-01-15', false),
('Digital Storage Oscilloscope', 'Measurement', 'SUN-OSC-001', 'ECE Lab', 'Available', 2, 1, '2025-02-10', true),
('3D Printer - Ultimaker S5', 'Fabrication', 'SUN-3DP-001', 'CS Lab 2', 'Under Maintenance', 1, 1, '2024-11-05', true),
('CNC Milling Machine', 'Fabrication', 'MET-CNC-001', 'Mech Workshop', 'Available', 3, 2, '2024-09-20', true),
('HP EliteBook Laptop', 'Computer', 'MET-LAP-001', 'CS Lab', 'Available', 1, 2, '2025-03-01', false),
('Function Generator FG-500', 'Measurement', 'SUN-FG-001', 'ECE Lab', 'Available', 2, 1, '2025-01-25', false);
