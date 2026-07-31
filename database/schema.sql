CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    description TEXT
);
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role_id INT,
    department_id INT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_user_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
);
CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Available',
    department_id INT,
    purchase_date DATE,

    CONSTRAINT fk_equipment_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
);
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT,
    equipment_id INT,
    booking_date DATE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    booking_status VARCHAR(30),
    purpose TEXT,

    CONSTRAINT fk_booking_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_booking_equipment
        FOREIGN KEY(equipment_id)
        REFERENCES equipment(equipment_id)
);
CREATE TABLE maintenance (
    maintenance_id SERIAL PRIMARY KEY,
    equipment_id INT,
    maintenance_date DATE,
    maintenance_type VARCHAR(100),
    description TEXT,
    maintenance_status VARCHAR(30),
    next_maintenance_date DATE,

    CONSTRAINT fk_maintenance_equipment
        FOREIGN KEY(equipment_id)
        REFERENCES equipment(equipment_id)
);