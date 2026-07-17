-- schema.sql
-- Run this script in your Neon PostgreSQL SQL Editor to create all necessary tables.

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS academic_records CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS doc_orders CASCADE;
DROP TABLE IF EXISTS repairs CASCADE;
DROP TABLE IF EXISTS admissions CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'Student', -- 'Student', 'Instructor', 'Admin'
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_months INT DEFAULT 12
);

-- 3. Courses Table
CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration_months INT DEFAULT 3,
    subjects JSONB NOT NULL DEFAULT '[]', -- Array of strings
    materials_required JSONB NOT NULL DEFAULT '[]', -- Array of strings
    fees_cfaf NUMERIC(12, 2) NOT NULL,
    schedule VARCHAR(255),
    instructor VARCHAR(100),
    career_opportunities JSONB NOT NULL DEFAULT '[]' -- Array of strings
);

-- 4. Admissions Applications Table
CREATE TABLE admissions (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    birth_date VARCHAR(30),
    national_id VARCHAR(50),
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE SET NULL,
    shift VARCHAR(50) DEFAULT 'Morning Shift',
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    passport_url TEXT,
    birth_certificate_url TEXT,
    screenshot_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    assigned_student_id VARCHAR(50),
    assigned_reg_number VARCHAR(100),
    assigned_classroom VARCHAR(100),
    assigned_instructor VARCHAR(100),
    admission_letter_url TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Repairs Ticket Table
CREATE TABLE repairs (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    device_model VARCHAR(150) NOT NULL,
    issue_description TEXT NOT NULL,
    price_cfaf NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Ready', 'Delivered'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Documentation Services Orders
CREATE TABLE doc_orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- 'Printing', 'Photocopy', 'Scanning', 'Lamination', 'Spiral Binding'
    file_url TEXT,
    total_pages INT NOT NULL DEFAULT 1,
    copies INT NOT NULL DEFAULT 1,
    color_mode VARCHAR(20) NOT NULL DEFAULT 'B&W', -- 'B&W', 'Color'
    bind_style VARCHAR(50) DEFAULT 'None',
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Processing', 'Ready', 'Delivered'
    total_cfaf NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Digital Certificates Table
CREATE TABLE certificates (
    id VARCHAR(50) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50),
    course_title VARCHAR(150) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    grade VARCHAR(20) NOT NULL DEFAULT 'Passed',
    issue_date VARCHAR(30) NOT NULL,
    reg_number VARCHAR(100) NOT NULL,
    qr_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. Shop Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'Laptops', 'Desktops', 'Printers', 'Accessories'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price_cfaf NUMERIC(12, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url TEXT,
    specifications JSONB NOT NULL DEFAULT '[]' -- Array of strings
);

-- 9. Shop Sales / Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]', -- JSON representation of ordered items
    total_cfaf NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Completed', -- 'Pending', 'Completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Blog Posts Table
CREATE TABLE blogs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. System Notifications Table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Academic Records Table
CREATE TABLE academic_records (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL,
    marks JSONB NOT NULL DEFAULT '{}', -- Key-value pairs for subjects and marks
    term VARCHAR(50) NOT NULL,
    comment TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Attendance Records Table
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL -- 'Present', 'Absent', 'Late', 'Excused'
);

-- 14. Timetable Entries Table
CREATE TABLE timetable (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    day VARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc.
    time VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    room VARCHAR(50) NOT NULL
);

-- 15. Student Assignments Table
CREATE TABLE assignments (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    due_date VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Submitted', 'Graded'
    marks INT DEFAULT 0,
    instructions TEXT
);
