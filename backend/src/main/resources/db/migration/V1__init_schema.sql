-- =====================================================================
-- Lab Resource Utilization Platform — Initial Schema
-- Flyway migration: V1__init_schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Foundational tables (no dependencies)
-- ---------------------------------------------------------------------

CREATE TABLE roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE institutions (
    institution_id      SERIAL PRIMARY KEY,
    institution_name    VARCHAR(100) NOT NULL,
    address              VARCHAR(200)
);

CREATE TABLE equipment_categories (
    category_id     SERIAL PRIMARY KEY,
    category_name   VARCHAR(100) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------
-- Depends on institutions
-- ---------------------------------------------------------------------

CREATE TABLE departments (
    department_id     SERIAL PRIMARY KEY,
    institution_id     INT NOT NULL REFERENCES institutions(institution_id),
    department_name    VARCHAR(100) NOT NULL
);

-- ---------------------------------------------------------------------
-- Depends on departments + roles
-- ---------------------------------------------------------------------

CREATE TABLE users (
    user_id         SERIAL PRIMARY KEY,
    department_id   INT NOT NULL REFERENCES departments(department_id),
    role_id         INT NOT NULL REFERENCES roles(role_id),
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Depends on equipment_categories, departments, institutions
-- ---------------------------------------------------------------------

CREATE TABLE equipment (
    equipment_id            SERIAL PRIMARY KEY,
    asset_tag               VARCHAR(50) NOT NULL UNIQUE,
    name                    VARCHAR(100) NOT NULL,
    category_id             INT NOT NULL REFERENCES equipment_categories(category_id),
    department_id           INT NOT NULL REFERENCES departments(department_id),
    institution_id          INT NOT NULL REFERENCES institutions(institution_id),
    status                  VARCHAR(30) NOT NULL DEFAULT 'Available'
        CHECK (status IN ('Available', 'Booked', 'Under Maintenance', 'Out of Service', 'Retired')),
    manufacturer             VARCHAR(100),
    model_number             VARCHAR(100),
    specifications            TEXT,
    location                 VARCHAR(100),
    manual_url                VARCHAR(255),
    calibration_cert_url      VARCHAR(255),
    calibration_due_date      DATE,
    tags                      VARCHAR(255),
    created_at                TIMESTAMP NOT NULL DEFAULT now(),
    updated_at                TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_department ON equipment(department_id);
CREATE INDEX idx_equipment_institution ON equipment(institution_id);

-- ---------------------------------------------------------------------
-- Depends on equipment, users
-- ---------------------------------------------------------------------

CREATE TABLE bookings (
    booking_id      SERIAL PRIMARY KEY,
    equipment_id    INT NOT NULL REFERENCES equipment(equipment_id),
    user_id         INT NOT NULL REFERENCES users(user_id),
    booking_start   TIMESTAMP NOT NULL,
    booking_end     TIMESTAMP NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'Pending Approval'
        CHECK (status IN ('Pending Approval', 'Confirmed', 'In Use', 'Completed', 'Cancelled', 'No Show')),
    purpose          VARCHAR(255),
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (booking_end > booking_start)
);

CREATE INDEX idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ---------------------------------------------------------------------
-- Depends on equipment, users (technician)
-- ---------------------------------------------------------------------

CREATE TABLE maintenance (
    maintenance_id      SERIAL PRIMARY KEY,
    equipment_id        INT NOT NULL REFERENCES equipment(equipment_id),
    technician_id        INT REFERENCES users(user_id),
    maintenance_date      DATE NOT NULL,
    maintenance_type      VARCHAR(50) NOT NULL,
    status                VARCHAR(30) NOT NULL DEFAULT 'Scheduled'
        CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    notes                  TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_equipment ON maintenance(equipment_id);

-- ---------------------------------------------------------------------
-- Depends on equipment, bookings, departments
-- ---------------------------------------------------------------------

CREATE TABLE utilization (
    utilization_id     SERIAL PRIMARY KEY,
    equipment_id        INT NOT NULL REFERENCES equipment(equipment_id),
    booking_id           INT REFERENCES bookings(booking_id),
    department_id         INT NOT NULL REFERENCES departments(department_id),
    usage_date            DATE NOT NULL,
    hours_used             NUMERIC(5,2) NOT NULL CHECK (hours_used >= 0),
    created_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_utilization_equipment ON utilization(equipment_id);
CREATE INDEX idx_utilization_date ON utilization(usage_date);

-- ---------------------------------------------------------------------
-- Seed reference data (roles + basic categories, safe to run once)
-- ---------------------------------------------------------------------

INSERT INTO roles (role_name) VALUES
    ('Researcher/Student'),
    ('Lab Technician'),
    ('Lab Manager'),
    ('Department Head'),
    ('Institution Administrator'),
    ('System Administrator');

INSERT INTO equipment_categories (category_name) VALUES
    ('Imaging'),
    ('Spectroscopy'),
    ('Chromatography'),
    ('Centrifugation'),
    ('Sample Prep'),
    ('Measurement Tools');
