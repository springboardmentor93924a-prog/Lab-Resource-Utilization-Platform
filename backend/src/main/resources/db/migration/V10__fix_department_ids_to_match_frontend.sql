-- ------------------------------------------------------------------
-- V9 (as actually applied) only appended 10 more departments on top
-- of V8's original 5, landing on IDs 6-15 instead of 1-10. This
-- migration clears everything and reseeds correctly so IDs 1-10
-- match the frontend's hardcoded Register.jsx DEPARTMENTS array.
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
