-- VSquare App Sample Data
-- ============================================
-- HOW TO USE:
-- 1. Run AFTER the setup script first!
-- 2. Paste this in Supabase SQL Editor
-- 3. Click "Run"
-- ============================================

-- 1. Insert sample employees
INSERT INTO employees (id, name, phone, role, joindate, team, teamleadid, isfresher, islead, isblocked, password)
VALUES
('VS001', 'Naveen Raj', '8374305073', 'Sales Executive', '2024-01-15', 'Legends', NULL, false, true, false, '5073'),
('VS002', 'G P Mahesh', '9876543210', 'Team Head', '2023-06-20', 'Piranhas', NULL, false, true, false, '3210'),
('VS003', 'Sandeep', '9876543211', 'Team Head', '2023-05-10', 'Synergy Squard', NULL, false, true, false, '3211'),
('VS004', 'Sanjeev B', '9876543212', 'Team Head', '2023-04-05', 'Spartan''s', NULL, false, true, false, '3212'),
('VS005', 'Vinay', '9876543213', 'Team Head', '2023-03-15', 'Gladiators', NULL, false, true, false, '3213')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert sample leads
INSERT INTO leads (id, assignedTo, name, mobile, project, budget, location, source, status, visitdate, remarks)
VALUES
('LEAD001', 'VS001', 'Ravi Kumar', '9123456780', 'Royal Cottage Garden Phase-1', '5000000', 'Komapally', 'WhatsApp', 'New', '2025-06-15', 'Interested in 200 sq yd plot'),
('LEAD002', 'VS002', 'Priya Sharma', '9123456781', 'Royal Cottage Garden Phase-2 (DTCP)', '7500000', 'Komapally', 'Phone Call', 'Contacted', '2025-06-18', 'Follow up next week'),
('LEAD003', 'VS003', 'Anil Reddy', '9123456782', 'Royal Cottage Garden Phase-1', '6000000', 'Komapally', 'Referral', 'Approved', '2025-06-10', 'Booking confirmed ||EARNING:25000||'),
('LEAD004', 'VS004', 'Sunita Patel', '9123456783', 'Royal Cottage Garden Phase-2 (DTCP)', '8000000', 'Komapally', 'Social Media', 'Visited', '2025-06-20', 'Liked the project')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert sample projects
INSERT INTO projects (id, name, location, totalprice, pricepersqyd, startingsize, roadsize, totalplots, availableplots, soldplots, isvisible, imageurl)
VALUES
('PROJ001', 'Royal Cottage Garden Phase-1', 'Komapally', '5000000', '25000', '150', '30', '157', '41', '116', true, ''),
('PROJ002', 'Royal Cottage Garden Phase-2 (DTCP)', 'Komapally', '7500000', '30000', '200', '40', '240', '240', '0', true, '')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert sample offers
INSERT INTO offers (id, title, message, imageurl, isactive)
VALUES
('OFFER001', 'Summer Special Offer', 'Get 5% discount on all bookings this month!', '', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert sample admin settings
INSERT INTO offers (id, title, message, isactive)
VALUES
('ADMIN_SETTINGS', 'Admin Settings', '{"enableNotifications":true,"autoApproveSales":false,"lockEmployeeDeletion":false,"autoCleanupNotifications":true}', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert sample notifications
INSERT INTO notifications (id, type, title, message, tag, foremployees)
VALUES
('NOTIF001', 'info', 'Welcome to VSquare!', 'Start exploring our amazing projects and close some deals today!', 'INFO', true),
('NOTIF002', 'success', 'New Lead Assigned', 'You have a new lead assigned to you!', 'SUCCESS', true)
ON CONFLICT (id) DO NOTHING;
