-- Run this script in the Supabase SQL Editor to add the missing columns to the employees table.

ALTER TABLE employees ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "underExecutiveDirector" TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "branchOffice" TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS manual_total_earned TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS manual_pending_due TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS manual_sales_count TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS earning_plots JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "availablePlotsNote" TEXT;

-- Update existing records if needed (optional)
-- UPDATE employees SET department = role WHERE department IS NULL;
