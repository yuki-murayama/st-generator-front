-- Employee Management System - Initial Database Schema
-- This migration creates the core tables for the employee management system

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) for all tables
-- This ensures that users can only access data they're authorized to see

-- 1. EMPLOYEES TABLE
-- Stores employee information including personal details and employment status
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL CHECK (length(trim(first_name)) > 0),
    last_name VARCHAR(50) NOT NULL CHECK (length(trim(last_name)) > 0),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(20) CHECK (phone IS NULL OR length(trim(phone)) > 0),
    department VARCHAR(100) NOT NULL CHECK (length(trim(department)) > 0),
    position VARCHAR(100) NOT NULL CHECK (length(trim(position)) > 0),
    hire_date DATE NOT NULL CHECK (hire_date <= CURRENT_DATE),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SITES TABLE
-- Stores construction site information including location and project details
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    location VARCHAR(255) NOT NULL CHECK (length(trim(location)) > 0),
    start_date DATE NOT NULL,
    end_date DATE CHECK (end_date IS NULL OR end_date >= start_date),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
    manager_name VARCHAR(100) CHECK (manager_name IS NULL OR length(trim(manager_name)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ASSIGNMENTS TABLE
-- Stores employee-to-site assignments with date ranges and roles
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE CHECK (end_date IS NULL OR end_date >= start_date),
    role VARCHAR(100) CHECK (role IS NULL OR length(trim(role)) > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE OPTIMIZATION

-- Employees table indexes
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_position ON employees(position);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_full_name ON employees(last_name, first_name);

-- Sites table indexes
CREATE INDEX idx_sites_name ON sites(name);
CREATE INDEX idx_sites_location ON sites(location);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_start_date ON sites(start_date);
CREATE INDEX idx_sites_end_date ON sites(end_date);
CREATE INDEX idx_sites_manager ON sites(manager_name);

-- Assignments table indexes
CREATE INDEX idx_assignments_employee_id ON assignments(employee_id);
CREATE INDEX idx_assignments_site_id ON assignments(site_id);
CREATE INDEX idx_assignments_start_date ON assignments(start_date);
CREATE INDEX idx_assignments_end_date ON assignments(end_date);
CREATE INDEX idx_assignments_active ON assignments(employee_id, site_id) WHERE end_date IS NULL;

-- Composite indexes for common queries
CREATE INDEX idx_employees_dept_status ON employees(department, status);
CREATE INDEX idx_sites_status_dates ON sites(status, start_date, end_date);
CREATE INDEX idx_assignments_employee_dates ON assignments(employee_id, start_date, end_date);
CREATE INDEX idx_assignments_site_dates ON assignments(site_id, start_date, end_date);

-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies - Allow authenticated users to read and write all data
-- In a production environment, these would be more restrictive based on user roles

-- Employees table policies
CREATE POLICY "Users can view all employees" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert employees" ON employees
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update employees" ON employees
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete employees" ON employees
    FOR DELETE USING (auth.role() = 'authenticated');

-- Sites table policies
CREATE POLICY "Users can view all sites" ON sites
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sites" ON sites
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sites" ON sites
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete sites" ON sites
    FOR DELETE USING (auth.role() = 'authenticated');

-- Assignments table policies
CREATE POLICY "Users can view all assignments" ON assignments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert assignments" ON assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update assignments" ON assignments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete assignments" ON assignments
    FOR DELETE USING (auth.role() = 'authenticated');

-- CONSTRAINTS FOR DATA INTEGRITY

-- Prevent overlapping assignments for the same employee
-- This constraint ensures an employee cannot be assigned to multiple sites during overlapping periods
CREATE UNIQUE INDEX idx_assignments_no_overlap
ON assignments (employee_id, daterange(start_date, COALESCE(end_date, '9999-12-31'), '[]'))
WHERE end_date IS NULL OR end_date > start_date;

-- VIEWS FOR COMMON QUERIES

-- View for active assignments with employee and site details
CREATE VIEW active_assignments AS
SELECT
    a.id,
    a.employee_id,
    a.site_id,
    a.start_date,
    a.end_date,
    a.role,
    a.notes,
    e.first_name,
    e.last_name,
    e.email,
    e.department,
    e.position,
    s.name as site_name,
    s.location as site_location,
    s.status as site_status
FROM assignments a
JOIN employees e ON a.employee_id = e.id
JOIN sites s ON a.site_id = s.id
WHERE a.end_date IS NULL OR a.end_date > CURRENT_DATE;

-- View for employee statistics
CREATE VIEW employee_stats AS
SELECT
    department,
    COUNT(*) as total_employees,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_employees
FROM employees
GROUP BY department;

-- View for site statistics
CREATE VIEW site_stats AS
SELECT
    status,
    COUNT(*) as total_sites,
    COUNT(CASE WHEN start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date > CURRENT_DATE) THEN 1 END) as current_sites
FROM sites
GROUP BY status;

-- SAMPLE DATA FOR TESTING (Optional - can be removed in production)

-- Insert sample departments and positions
INSERT INTO employees (first_name, last_name, email, phone, department, position, hire_date, status) VALUES
('太郎', '田中', 'tanaka.taro@example.com', '090-1234-5678', '建設部', '現場監督', '2023-01-15', 'active'),
('花子', '佐藤', 'sato.hanako@example.com', '090-2345-6789', '建設部', '作業員', '2023-02-01', 'active'),
('次郎', '鈴木', 'suzuki.jiro@example.com', '090-3456-7890', '管理部', 'マネージャー', '2022-12-01', 'active'),
('美咲', '高橋', 'takahashi.misaki@example.com', '090-4567-8901', '安全管理部', '安全管理者', '2023-03-01', 'active');

-- Insert sample sites
INSERT INTO sites (name, description, location, start_date, end_date, status, manager_name) VALUES
('東京駅前ビル建設', '商業複合施設の建設プロジェクト', '東京都千代田区', '2023-01-01', '2024-12-31', 'active', '田中太郎'),
('大阪港湾倉庫建設', '物流倉庫の建設プロジェクト', '大阪府大阪市港区', '2023-06-01', '2024-03-31', 'active', '佐藤花子'),
('名古屋住宅団地', '住宅団地の建設プロジェクト', '愛知県名古屋市', '2022-10-01', '2023-12-31', 'completed', '鈴木次郎');

-- Insert sample assignments
INSERT INTO assignments (employee_id, site_id, start_date, end_date, role, notes) VALUES
((SELECT id FROM employees WHERE email = 'tanaka.taro@example.com'),
 (SELECT id FROM sites WHERE name = '東京駅前ビル建設'),
 '2023-01-15', NULL, '現場監督', '主任監督として全体管理を担当'),
((SELECT id FROM employees WHERE email = 'sato.hanako@example.com'),
 (SELECT id FROM sites WHERE name = '大阪港湾倉庫建設'),
 '2023-06-01', NULL, '作業員', '基礎工事を担当'),
((SELECT id FROM employees WHERE email = 'suzuki.jiro@example.com'),
 (SELECT id FROM sites WHERE name = '名古屋住宅団地'),
 '2022-10-01', '2023-12-31', 'プロジェクトマネージャー', 'プロジェクト完了');

-- Add comments for documentation
COMMENT ON TABLE employees IS '従業員情報を管理するテーブル';
COMMENT ON TABLE sites IS '現場情報を管理するテーブル';
COMMENT ON TABLE assignments IS '従業員の現場配属情報を管理するテーブル';

COMMENT ON COLUMN employees.status IS 'active: 在籍中, inactive: 退職済み';
COMMENT ON COLUMN sites.status IS 'active: 進行中, completed: 完了, suspended: 中断';
COMMENT ON COLUMN assignments.end_date IS 'NULLの場合は現在も配属中を示す';