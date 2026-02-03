-- 1. ایجاد دیتابیس پروژه پارکینگ
CREATE DATABASE parking_system;
-- 2. اتصال به دیتابیس جدید
\ c parking_system;
-- 3. ایجاد جدول وسایل نقلیه
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) DEFAULT 'car',
    owner_name VARCHAR(100),
    phone_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 4. ایجاد جدول لاگ پارکینگ
CREATE TABLE parking_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP,
    entry_image_url TEXT,
    exit_image_url TEXT,
    status VARCHAR(20) DEFAULT 'parked',
    fee DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    notes TEXT,
    CONSTRAINT fk_vehicle FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (
        status IN ('parked', 'exited', 'reserved', 'cancelled')
    )
);
-- 5. ایجاد جدول کاربران (برای پنل ادمین)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 6. ایجاد ایندکس‌ها برای بهبود عملکرد
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_created ON vehicles(created_at);
CREATE INDEX idx_logs_vehicle ON parking_logs(vehicle_id);
CREATE INDEX idx_logs_status ON parking_logs(status);
CREATE INDEX idx_logs_entry ON parking_logs(entry_time);
CREATE INDEX idx_logs_exit ON parking_logs(exit_time);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
-- 7. ایجاد کاربر پیش‌فرض ادمین
-- رمز: admin123 (بعداً با bcrypt هش می‌کنیم)
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES (
        'admin',
        'admin@parking.com',
        '$2b$10$7V6Vq5g5z5O5X5O5X5O5O.FcLt9Lt9Lt9Lt9Lt9Lt9Lt9Lt9Lt9Lt9',
        -- placeholder
        'مدیر سیستم',
        'admin'
    ) ON CONFLICT (username) DO NOTHING;
-- 8. اضافه کردن داده‌های نمونه برای تست
INSERT INTO vehicles (
        plate_number,
        vehicle_type,
        owner_name,
        phone_number
    )
VALUES ('12ب12345', 'car', 'علی محمدی', '09123456789'),
    ('21د54321', 'car', 'مریم احمدی', '09129876543'),
    (
        '35ط98765',
        'motorcycle',
        'رضا کریمی',
        '09127654321'
    ),
    ('77س45678', 'car', 'سارا نظری', '09126543219'),
    ('15الف123', 'car', 'محمد حسینی', '09125432198') ON CONFLICT (plate_number) DO NOTHING;
-- 9. اضافه کردن لاگ‌های نمونه
-- ابتدا vehicle_idها را بگیریم
DO $$
DECLARE v1_id INTEGER;
v2_id INTEGER;
v3_id INTEGER;
BEGIN -- گرفتن id وسایل
SELECT id INTO v1_id
FROM vehicles
WHERE plate_number = '12ب12345';
SELECT id INTO v2_id
FROM vehicles
WHERE plate_number = '21د54321';
SELECT id INTO v3_id
FROM vehicles
WHERE plate_number = '35ط98765';
-- ایجاد لاگ‌های فعال (پارک شده)
INSERT INTO parking_logs (vehicle_id, entry_time, status)
VALUES (v1_id, NOW() - INTERVAL '2 hours', 'parked'),
    (v2_id, NOW() - INTERVAL '45 minutes', 'parked'),
    (v3_id, NOW() - INTERVAL '1.5 hours', 'parked');
-- ایجاد لاگ‌های تاریخی (خارج شده)
INSERT INTO parking_logs (
        vehicle_id,
        entry_time,
        exit_time,
        status,
        fee,
        payment_status
    )
VALUES (
        v1_id,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days 23 hours',
        'exited',
        50000,
        'paid'
    ),
    (
        v2_id,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day 22 hours',
        'exited',
        45000,
        'paid'
    );
END $$;
-- 10. نمایش اطلاعات ایجاد شده
\ dt -- نمایش همه tables
SELECT 'vehicles' as table_name,
    COUNT(*) as count
FROM vehicles
UNION ALL
SELECT 'parking_logs',
    COUNT(*)
FROM parking_logs
UNION ALL
SELECT 'users',
    COUNT(*)
FROM users;
-- 11. مشاهده وسایل پارک شده فعلی
SELECT v.plate_number,
    v.vehicle_type,
    v.owner_name,
    p.entry_time,
    EXTRACT(
        HOUR
        FROM (NOW() - p.entry_time)
    ) || ' ساعت و ' || EXTRACT(
        MINUTE
        FROM (NOW() - p.entry_time)
    ) || ' دقیقه' as parking_duration
FROM parking_logs p
    JOIN vehicles v ON p.vehicle_id = v.id
WHERE p.status = 'parked'
ORDER BY p.entry_time;
-- 12. خروج از psql
\ q