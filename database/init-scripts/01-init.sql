-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Table: vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) DEFAULT 'car',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Table: parking_logs
CREATE TABLE IF NOT EXISTS parking_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP WITH TIME ZONE,
    entry_image_url TEXT,
    exit_image_url TEXT,
    status VARCHAR(20) DEFAULT 'parked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT check_status CHECK (status IN ('parked', 'exited', 'cancelled'))
);
-- Table: users (برای مرحله بعد - پنل ادمین)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);
CREATE INDEX IF NOT EXISTS idx_parking_logs_vehicle_id ON parking_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_parking_logs_status ON parking_logs(status);
CREATE INDEX IF NOT EXISTS idx_parking_logs_entry_time ON parking_logs(entry_time);
CREATE INDEX IF NOT EXISTS idx_parking_logs_exit_time ON parking_logs(exit_time);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Insert default admin user (password: admin123 - بعداً هش می‌کنیم)
INSERT INTO users (username, email, password_hash, role)
VALUES (
        'admin',
        'admin@parking.com',
        '$2b$10$YourHashedPasswordHere',
        'admin'
    ) ON CONFLICT (username) DO NOTHING;
-- Insert sample data for testing
INSERT INTO vehicles (plate_number, vehicle_type)
VALUES ('12ب12345', 'car'),
    ('21د54321', 'car'),
    ('35ط98765', 'motorcycle') ON CONFLICT (plate_number) DO NOTHING;