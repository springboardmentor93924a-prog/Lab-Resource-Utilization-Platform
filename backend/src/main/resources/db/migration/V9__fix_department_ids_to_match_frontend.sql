-- ------------------------------------------------------------------
-- V8 seeded the wrong department list/order. Clear it and reseed
-- with the exact list the frontend's Register.jsx expects, so IDs
-- 1-10 line up correctly.
-- ------------------------------------------------------------------

DELETE FROM departments;
ALTER SEQUENCE departments_department_id_seq RESTART WITH 1;

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
