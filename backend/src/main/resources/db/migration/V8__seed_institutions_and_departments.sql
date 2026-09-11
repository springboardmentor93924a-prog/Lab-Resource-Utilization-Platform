-- ------------------------------------------------------------------
-- Seed institutions and departments (required for user registration
-- to work: users.department_id is NOT NULL and references departments,
-- and departments.institution_id is NOT NULL and references institutions)
-- ------------------------------------------------------------------

INSERT INTO institutions (institution_name, address) VALUES
    ('Default Institution', 'N/A');

INSERT INTO departments (institution_id, department_name) VALUES
    (1, 'Chemical Engineering'),
    (1, 'Mechanical Engineering'),
    (1, 'Electrical Engineering'),
    (1, 'Electronics and Communication Engineering'),
    (1, 'Information Technology');
