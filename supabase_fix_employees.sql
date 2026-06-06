-- ========================================
-- FIX EMPLOYEES TABLE
-- ========================================

-- Drop and recreate employees table with all columns
DROP TABLE IF EXISTS employees;

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

ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- ========================================
-- EMPLOYEES TABLE FIXED!
-- ========================================
