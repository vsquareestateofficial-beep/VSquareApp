-- VSquare App Database Setup
-- ============================================
-- HOW TO USE:
-- 1. Go to https://supabase.com/dashboard
-- 2. Open your project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Click "New Query"
-- 5. Copy & paste this ENTIRE script
-- 6. Click "Run"
-- ============================================

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Sales Executive',
  joindate DATE,
  team TEXT,
  teamleadid TEXT,
  isfresher BOOLEAN DEFAULT true,
  islead BOOLEAN DEFAULT false,
  isblocked BOOLEAN DEFAULT false,
  password TEXT,
  manual_total_earned TEXT DEFAULT '',
  manual_pending_due TEXT DEFAULT '',
  manual_sales_count TEXT DEFAULT '',
  earning_plots JSONB DEFAULT '[]'::jsonb,
  department TEXT DEFAULT 'Marketing',
  underExecutiveDirector TEXT DEFAULT 'No Selection',
  branchOffice TEXT DEFAULT 'Corporate Office',
  bloodGroup TEXT DEFAULT 'O+ve',
  availablePlotsNote TEXT DEFAULT ''
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  assignedTo TEXT,
  name TEXT DEFAULT 'Unknown',
  mobile TEXT NOT NULL DEFAULT 'N/A',
  project TEXT DEFAULT 'Unknown',
  budget TEXT,
  location TEXT,
  source TEXT,
  status TEXT DEFAULT 'New',
  visitdate DATE,
  remarks TEXT
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT,
  totalprice TEXT,
  pricepersqyd TEXT,
  startingsize TEXT,
  roadsize TEXT,
  totalplots TEXT,
  availableplots TEXT,
  soldplots TEXT,
  isvisible BOOLEAN DEFAULT true,
  imageurl TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Offers Table (stores offers, top performers, and admin settings)
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  title TEXT,
  message TEXT,
  imageurl TEXT,
  startdate TIMESTAMPTZ,
  enddate TIMESTAMPTZ,
  isactive BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  message TEXT,
  tag TEXT DEFAULT 'INFO',
  read BOOLEAN DEFAULT false,
  time TIMESTAMPTZ,
  status TEXT,
  foremployees BOOLEAN DEFAULT true,
  targetemployeeids TEXT,
  readby TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_assignedto ON leads(assignedTo);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_notifications_foremployees ON notifications(foremployees);

-- ============================================
-- After running this, your tables are ready!
-- ============================================
