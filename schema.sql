-- ==========================================
-- Lab Resource Utilization Platform
-- PostgreSQL Database Schema
-- Part 1
-- ==========================================

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institutions (
    institution_id SERIAL PRIMARY KEY,
    institution_name VARCHAR(150) NOT NULL,
    institution_code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(10),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,

    institution_id INT NOT NULL,

    department_name VARCHAR(100) NOT NULL,

    department_code VARCHAR(20) NOT NULL,

    hod_name VARCHAR(100),

    email VARCHAR(100),

    phone VARCHAR(20),

    location VARCHAR(100),

    status VARCHAR(20) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_department_institution
        FOREIGN KEY (institution_id)
        REFERENCES institutions(institution_id),

    CONSTRAINT uq_department_per_institution
        UNIQUE (institution_id, department_code)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,

    role_id INT NOT NULL,

    institution_id INT NOT NULL,

    department_id INT NOT NULL,

    first_name VARCHAR(50) NOT NULL,

    last_name VARCHAR(50),

    email VARCHAR(100) UNIQUE NOT NULL,

    phone VARCHAR(20),

    employee_student_id VARCHAR(30) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    gender VARCHAR(20),

    designation VARCHAR(100),

    status VARCHAR(20) DEFAULT 'Active',

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


CREATE TABLE laboratories (
    laboratory_id SERIAL PRIMARY KEY,

    institution_id INT NOT NULL,
    department_id INT NOT NULL,

    lab_name VARCHAR(150) NOT NULL,
    lab_code VARCHAR(30) NOT NULL,

    lab_incharge INT,

    location VARCHAR(100),

    floor VARCHAR(20),

    capacity INT,

    status VARCHAR(20) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lab_institution
        FOREIGN KEY (institution_id)
        REFERENCES institutions(institution_id),

    CONSTRAINT fk_lab_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id),

    CONSTRAINT fk_lab_incharge
        FOREIGN KEY (lab_incharge)
        REFERENCES users(user_id),

    CONSTRAINT uq_lab
        UNIQUE (institution_id, lab_code)
);

CREATE TABLE equipment_categories (
    category_id SERIAL PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    status VARCHAR(20) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,

    laboratory_id INT NOT NULL,

    category_id INT NOT NULL,

    equipment_name VARCHAR(150) NOT NULL,

    asset_tag VARCHAR(50) UNIQUE NOT NULL,

    serial_number VARCHAR(100) UNIQUE,

    brand VARCHAR(100),

    model VARCHAR(100),

    purchase_date DATE,

    warranty_expiry DATE,

    equipment_condition VARCHAR(20) DEFAULT 'Good',

    availability_status VARCHAR(20) DEFAULT 'Available',

    purchase_cost DECIMAL(12,2),

    qr_code VARCHAR(255),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_equipment_lab
        FOREIGN KEY (laboratory_id)
        REFERENCES laboratories(laboratory_id),

    CONSTRAINT fk_equipment_category
        FOREIGN KEY (category_id)
        REFERENCES equipment_categories(category_id)
);



CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,
    equipment_id INT NOT NULL,

    booking_date DATE DEFAULT CURRENT_DATE,

    start_time TIMESTAMP NOT NULL,

    end_time TIMESTAMP NOT NULL,

    purpose TEXT,

    booking_status VARCHAR(20)
        DEFAULT 'Pending'
        CHECK (booking_status IN
        ('Pending','Approved','Rejected','Cancelled','Completed')),

    approved_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_booking_equipment
        FOREIGN KEY (equipment_id)
        REFERENCES equipment(equipment_id),

    CONSTRAINT fk_booking_approved_by
        FOREIGN KEY (approved_by)
        REFERENCES users(user_id)
);

CREATE TABLE maintenance_records (
    maintenance_id SERIAL PRIMARY KEY,

    equipment_id INT NOT NULL,

    reported_by INT,

    issue_description TEXT NOT NULL,

    maintenance_status VARCHAR(20)
        DEFAULT 'Open'
        CHECK (maintenance_status IN
        ('Open','In Progress','Completed')),

    technician_name VARCHAR(100),

    maintenance_cost DECIMAL(10,2),

    reported_date DATE DEFAULT CURRENT_DATE,

    completion_date DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_equipment
        FOREIGN KEY (equipment_id)
        REFERENCES equipment(equipment_id),

    CONSTRAINT fk_maintenance_user
        FOREIGN KEY (reported_by)
        REFERENCES users(user_id)
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    notification_type VARCHAR(30)
        DEFAULT 'General'
        CHECK (notification_type IN
        ('Booking','Maintenance','Reminder','General')),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,

    user_id INT,

    action VARCHAR(100) NOT NULL,

    table_name VARCHAR(100),

    record_id INT,

    description TEXT,

    ip_address VARCHAR(45),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);