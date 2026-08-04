-- ==========================================================
-- LAB RESOURCE UTILIZATION PLATFORM
-- DATABASE SCHEMA
-- PostgreSQL
-- ==========================================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS maintenance CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS equipment_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ==========================================================
-- 1. ROLES
-- ==========================================================

CREATE TABLE roles
(
    role_id SERIAL PRIMARY KEY,

    role_name VARCHAR(50) NOT NULL UNIQUE,

    description TEXT
);

-- ==========================================================
-- 2. INSTITUTIONS
-- ==========================================================

CREATE TABLE institutions
(
    institution_id SERIAL PRIMARY KEY,

    institution_name VARCHAR(150) NOT NULL,

    address TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    country VARCHAR(100),

    email VARCHAR(100),

    phone VARCHAR(20),

    website VARCHAR(150),

    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. DEPARTMENTS
-- ==========================================================

CREATE TABLE departments
(
    department_id SERIAL PRIMARY KEY,

    institution_id INT NOT NULL,

    department_name VARCHAR(100) NOT NULL,

    description TEXT,

    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_department_institution
        FOREIGN KEY (institution_id)
        REFERENCES institutions(institution_id)
        ON DELETE CASCADE
);

-- ==========================================================
-- 4. USERS
-- ==========================================================

CREATE TABLE users
(
    user_id SERIAL PRIMARY KEY,

    role_id INT NOT NULL,

    institution_id INT,

    department_id INT,

    first_name VARCHAR(50) NOT NULL,

    last_name VARCHAR(50),

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    phone VARCHAR(20),

    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY(role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_user_institution
        FOREIGN KEY(institution_id)
        REFERENCES institutions(institution_id),

    CONSTRAINT fk_user_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
);

-- ==========================================================
-- 5. EQUIPMENT CATEGORIES
-- ==========================================================

CREATE TABLE equipment_categories
(
    category_id SERIAL PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT
);

-- ==========================================================
-- 6. EQUIPMENT
-- ==========================================================

CREATE TABLE equipment
(
    equipment_id SERIAL PRIMARY KEY,

    category_id INT NOT NULL,

    institution_id INT NOT NULL,

    department_id INT NOT NULL,

    equipment_name VARCHAR(150) NOT NULL,

    model VARCHAR(100),

    serial_number VARCHAR(100) UNIQUE,

    manufacturer VARCHAR(100),

    purchase_date DATE,

    purchase_cost DECIMAL(12,2),

    warranty_expiry DATE,

    status VARCHAR(30) DEFAULT 'AVAILABLE',

    location VARCHAR(150),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_equipment_category
        FOREIGN KEY(category_id)
        REFERENCES equipment_categories(category_id),

    CONSTRAINT fk_equipment_institution
        FOREIGN KEY(institution_id)
        REFERENCES institutions(institution_id),

    CONSTRAINT fk_equipment_department
        FOREIGN KEY(department_id)
        REFERENCES departments(department_id)
);

-- ==========================================================
-- 7. BOOKINGS
-- ==========================================================

CREATE TABLE bookings
(
    booking_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    equipment_id INT NOT NULL,

    booking_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    purpose TEXT,

    status VARCHAR(30) DEFAULT 'PENDING',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_booking_equipment
        FOREIGN KEY(equipment_id)
        REFERENCES equipment(equipment_id)
);

-- ==========================================================
-- 8. MAINTENANCE
-- ==========================================================

CREATE TABLE maintenance
(
    maintenance_id SERIAL PRIMARY KEY,

    equipment_id INT NOT NULL,

    assigned_to INT,

    maintenance_type VARCHAR(100),

    start_date DATE,

    end_date DATE,

    remarks TEXT,

    status VARCHAR(30) DEFAULT 'SCHEDULED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_equipment
        FOREIGN KEY(equipment_id)
        REFERENCES equipment(equipment_id),

    CONSTRAINT fk_maintenance_user
        FOREIGN KEY(assigned_to)
        REFERENCES users(user_id)
);

-- ==========================================================
-- 9. NOTIFICATIONS
-- ==========================================================

CREATE TABLE notifications
(
    notification_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(200),

    message TEXT,

    type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_role
ON users(role_id);

CREATE INDEX idx_users_institution
ON users(institution_id);

CREATE INDEX idx_equipment_department
ON equipment(department_id);

CREATE INDEX idx_booking_user
ON bookings(user_id);

CREATE INDEX idx_booking_equipment
ON bookings(equipment_id);