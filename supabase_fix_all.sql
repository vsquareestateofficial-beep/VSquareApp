-- ========================================
-- FIX ALL TABLES - FULL SCHEMA
-- ========================================

-- Drop all tables
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS admin_settings;
DROP TABLE IF EXISTS sales_count;

-- Create Employees Table
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'Sales Executive',
  joinDate TEXT,
  team TEXT,
  teamLeadId TEXT,
  isFresher BOOLEAN DEFAULT true,
  isLead BOOLEAN DEFAULT false,
  isBlocked BOOLEAN DEFAULT false,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Leads Table
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  assignedTo TEXT,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  project TEXT NOT NULL,
  budget TEXT,
  location TEXT,
  source TEXT,
  status TEXT DEFAULT 'New',
  visitDate TEXT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Projects Table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  totalPrice TEXT,
  pricePerSqYd TEXT,
  startingSize TEXT,
  roadSize TEXT,
  totalPlots TEXT,
  availablePlots TEXT,
  soldPlots TEXT,
  facing TEXT DEFAULT 'East',
  approval TEXT DEFAULT 'DTCP',
  status TEXT DEFAULT 'Available',
  isVisible BOOLEAN DEFAULT false,
  imageUrl TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Notifications Table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  tag TEXT DEFAULT 'INFO',
  read BOOLEAN DEFAULT false,
  time TEXT,
  status TEXT,
  forEmployees BOOLEAN DEFAULT true,
  targetEmployeeIds TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Admin Settings Table
CREATE TABLE admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enableNotifications BOOLEAN DEFAULT true,
  autoApproveSales BOOLEAN DEFAULT false,
  lockEmployeeDeletion BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin settings
INSERT INTO admin_settings (id, enableNotifications, autoApproveSales, lockEmployeeDeletion)
VALUES (1, true, false, false);

-- Create Sales Count Table
CREATE TABLE sales_count (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default sales count
INSERT INTO sales_count (id, count) VALUES (1, 0);

-- Disable RLS for all tables
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_count DISABLE ROW LEVEL SECURITY;

-- ========================================
-- ALL TABLES FIXED SUCCESSFULLY!
-- ========================================
