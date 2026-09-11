-- ------------------------------------------------------------------
-- Correct the department seed to match the exact list/IDs expected
-- by the frontend's Register.jsx DEPARTMENTS array (values 1-10).
-- ------------------------------------------------------------------

INSERT INTO departments (institution_id, department_name) VALUES
    (1, 'Computer Science'),
    (1, 'External Research Department'),
    (1, 'Mechanical Engineering'),
    (1, 'Electrical Engineering'),
    (1, 'Computer Science Engineering'),
    (1, 'Information Technology'),
    (1, 'CSE (AI & ML)'),
    (1, 'Civil Engineering'),
    (1, 'Electronics and Communication Engineering'),
    (1, 'Computer Science Engineering');
