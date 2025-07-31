-- Sample Data for Water Management System
-- Run this script in your Supabase SQL Editor to populate the database with sample data

-- First, let's add some sample customers
INSERT INTO public.customers (customer_number, first_name, last_name, email, phone, address, city, postal_code, is_active) VALUES
('CUST001', 'Alice', 'Johnson', 'alice.johnson@example.com', '+254701234567', '123 Riverside Drive', 'Nairobi', '00100', true),
('CUST002', 'Bob', 'Smith', 'bob.smith@example.com', '+254702345678', '456 Garden Estate', 'Nairobi', '00100', true),
('CUST003', 'Carol', 'Williams', 'carol.williams@example.com', '+254703456789', '789 Valley Road', 'Nairobi', '00100', true),
('CUST004', 'David', 'Brown', 'david.brown@example.com', '+254704567890', '321 Hill View', 'Nairobi', '00100', true),
('CUST005', 'Emma', 'Davis', 'emma.davis@example.com', '+254705678901', '654 Lake Side', 'Nairobi', '00100', true),
('CUST006', 'Frank', 'Miller', 'frank.miller@example.com', '+254706789012', '987 Mountain View', 'Nairobi', '00100', true),
('CUST007', 'Grace', 'Wilson', 'grace.wilson@example.com', '+254707890123', '147 Ocean Drive', 'Mombasa', '80100', true),
('CUST008', 'Henry', 'Taylor', 'henry.taylor@example.com', '+254708901234', '258 Forest Lane', 'Kisumu', '40100', true),
('CUST009', 'Ivy', 'Anderson', 'ivy.anderson@example.com', '+254709012345', '369 Sunset Boulevard', 'Nakuru', '20100', true),
('CUST010', 'Jack', 'Thomas', 'jack.thomas@example.com', '+254710123456', '741 Golden Street', 'Eldoret', '30100', true);

-- Now let's add some meters for these customers
INSERT INTO public.meters (meter_number, customer_id, meter_type, installation_date, last_reading, last_reading_date, is_active) VALUES
('MTR0001', (SELECT id FROM public.customers WHERE customer_number = 'CUST001'), 'Digital Water Meter', '2023-01-10', 150.2, '2024-01-25', true),
('MTR0002', (SELECT id FROM public.customers WHERE customer_number = 'CUST002'), 'Smart Water Meter', '2023-02-15', 105.8, '2024-01-26', true),
('MTR0003', (SELECT id FROM public.customers WHERE customer_number = 'CUST003'), 'Digital Water Meter', '2023-03-20', 210.0, '2024-01-27', true),
('MTR0004', (SELECT id FROM public.customers WHERE customer_number = 'CUST004'), 'Smart Water Meter', '2023-04-01', 75.0, '2024-01-28', true),
('MTR0005', (SELECT id FROM public.customers WHERE customer_number = 'CUST005'), 'Digital Water Meter', '2023-05-05', 30.1, '2024-01-29', true),
('MTR0006', (SELECT id FROM public.customers WHERE customer_number = 'CUST006'), 'Smart Water Meter', '2023-06-10', 180.5, '2024-01-30', true),
('MTR0007', (SELECT id FROM public.customers WHERE customer_number = 'CUST007'), 'Digital Water Meter', '2023-07-15', 95.3, '2024-01-31', true),
('MTR0008', (SELECT id FROM public.customers WHERE customer_number = 'CUST008'), 'Smart Water Meter', '2023-08-20', 125.7, '2024-02-01', true),
('MTR0009', (SELECT id FROM public.customers WHERE customer_number = 'CUST009'), 'Digital Water Meter', '2023-09-25', 65.2, '2024-02-02', true),
('MTR0010', (SELECT id FROM public.customers WHERE customer_number = 'CUST010'), 'Smart Water Meter', '2023-10-30', 140.8, '2024-02-03', true);

-- Add some meter readings
INSERT INTO public.meter_readings (meter_id, reading_value, reading_date, recorded_by, notes) VALUES
((SELECT id FROM public.meters WHERE meter_number = 'MTR0001'), 120.5, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0001'), 150.2, '2024-01-25', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0002'), 85.2, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0002'), 105.8, '2024-01-26', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0003'), 190.0, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0003'), 210.0, '2024-01-27', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0004'), 50.7, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0004'), 75.0, '2024-01-28', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0005'), 15.9, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0005'), 30.1, '2024-01-29', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0006'), 160.0, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0006'), 180.5, '2024-01-30', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0007'), 80.0, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0007'), 95.3, '2024-01-31', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0008'), 110.0, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0008'), 125.7, '2024-02-01', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0009'), 55.0, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0009'), 65.2, '2024-02-02', (SELECT id FROM public.users LIMIT 1), 'Monthly reading'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0010'), 130.0, '2024-01-01', (SELECT id FROM public.users LIMIT 1), 'Initial reading for January'),
((SELECT id FROM public.meters WHERE meter_number = 'MTR0010'), 140.8, '2024-02-03', (SELECT id FROM public.users LIMIT 1), 'Monthly reading');

-- Add some bills
INSERT INTO public.bills (bill_number, customer_id, meter_id, billing_period_start, billing_period_end, previous_reading, current_reading, consumption, rate_per_unit, total_amount, status, due_date, generated_by, generated_at) VALUES
('BILL001', (SELECT id FROM public.customers WHERE customer_number = 'CUST001'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0001'), '2024-01-01', '2024-01-31', 120.5, 150.2, 29.7, 82.50, 2450.25, 'paid', '2024-02-15', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL002', (SELECT id FROM public.customers WHERE customer_number = 'CUST002'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0002'), '2024-01-01', '2024-01-31', 85.2, 105.8, 20.6, 82.50, 1699.50, 'pending', '2024-02-16', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL003', (SELECT id FROM public.customers WHERE customer_number = 'CUST003'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0003'), '2024-01-01', '2024-01-31', 190.0, 210.0, 20.0, 82.50, 1650.00, 'overdue', '2024-01-10', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL004', (SELECT id FROM public.customers WHERE customer_number = 'CUST004'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0004'), '2024-01-01', '2024-01-31', 50.7, 75.0, 24.3, 82.50, 2004.75, 'paid', '2024-02-18', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL005', (SELECT id FROM public.customers WHERE customer_number = 'CUST005'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0005'), '2024-01-01', '2024-01-31', 15.9, 30.1, 14.2, 82.50, 1171.50, 'pending', '2024-03-20', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL006', (SELECT id FROM public.customers WHERE customer_number = 'CUST006'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0006'), '2024-01-01', '2024-01-31', 160.0, 180.5, 20.5, 82.50, 1691.25, 'pending', '2024-02-20', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL007', (SELECT id FROM public.customers WHERE customer_number = 'CUST007'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0007'), '2024-01-01', '2024-01-31', 80.0, 95.3, 15.3, 82.50, 1262.25, 'paid', '2024-02-25', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL008', (SELECT id FROM public.customers WHERE customer_number = 'CUST008'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0008'), '2024-01-01', '2024-01-31', 110.0, 125.7, 15.7, 82.50, 1295.25, 'pending', '2024-02-28', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL009', (SELECT id FROM public.customers WHERE customer_number = 'CUST009'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0009'), '2024-01-01', '2024-01-31', 55.0, 65.2, 10.2, 82.50, 841.50, 'cancelled', '2024-02-15', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00'),
('BILL010', (SELECT id FROM public.customers WHERE customer_number = 'CUST010'), (SELECT id FROM public.meters WHERE meter_number = 'MTR0010'), '2024-01-01', '2024-01-31', 130.0, 140.8, 10.8, 82.50, 891.00, 'paid', '2024-02-10', (SELECT id FROM public.users LIMIT 1), '2024-01-31 10:00:00');

-- Add some payments
INSERT INTO public.payments (payment_number, bill_id, customer_id, amount, payment_method, transaction_id, payment_date, processed_by, notes) VALUES
('PAY001', (SELECT id FROM public.bills WHERE bill_number = 'BILL001'), (SELECT id FROM public.customers WHERE customer_number = 'CUST001'), 2450.25, 'mpesa', 'MPESA123456789', '2024-01-12', (SELECT id FROM public.users LIMIT 1), 'Payment received via M-Pesa'),
('PAY002', (SELECT id FROM public.bills WHERE bill_number = 'BILL004'), (SELECT id FROM public.customers WHERE customer_number = 'CUST004'), 2004.75, 'card', 'CARD987654321', '2024-02-16', (SELECT id FROM public.users LIMIT 1), 'Payment received via card'),
('PAY003', (SELECT id FROM public.bills WHERE bill_number = 'BILL007'), (SELECT id FROM public.customers WHERE customer_number = 'CUST007'), 1262.25, 'bank_transfer', 'BANK456789123', '2024-02-25', (SELECT id FROM public.users LIMIT 1), 'Payment received via bank transfer'),
('PAY004', (SELECT id FROM public.bills WHERE bill_number = 'BILL010'), (SELECT id FROM public.customers WHERE customer_number = 'CUST010'), 891.00, 'cash', NULL, '2024-02-10', (SELECT id FROM public.users LIMIT 1), 'Payment received in cash'),
('PAY005', (SELECT id FROM public.bills WHERE bill_number = 'BILL002'), (SELECT id FROM public.customers WHERE customer_number = 'CUST002'), 1000.00, 'mpesa', 'MPESA987654321', '2024-02-10', (SELECT id FROM public.users LIMIT 1), 'Partial payment received'),
('PAY006', (SELECT id FROM public.bills WHERE bill_number = 'BILL005'), (SELECT id FROM public.customers WHERE customer_number = 'CUST005'), 500.00, 'mpesa', 'MPESA456789123', '2024-02-15', (SELECT id FROM public.users LIMIT 1), 'Partial payment received');

-- Add some activity logs
INSERT INTO public.activity_log (user_id, activity_type, description, details, ip_address, user_agent) VALUES
((SELECT id FROM public.users LIMIT 1), 'customer_added', 'Added new customer Alice Johnson', '{"customer_id": (SELECT id FROM public.customers WHERE customer_number = "CUST001"), "customer_number": "CUST001"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'meter_added', 'Added new meter MTR0001', '{"meter_id": (SELECT id FROM public.meters WHERE meter_number = "MTR0001"), "meter_number": "MTR0001"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'reading_recorded', 'Recorded meter reading for MTR0001', '{"reading_id": (SELECT id FROM public.meter_readings WHERE meter_id = (SELECT id FROM public.meters WHERE meter_number = "MTR0001") LIMIT 1), "reading_value": 150.2}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'bill_generated', 'Generated bill BILL001', '{"bill_id": (SELECT id FROM public.bills WHERE bill_number = "BILL001"), "bill_number": "BILL001", "amount": 2450.25}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'payment_received', 'Received payment PAY001', '{"payment_id": (SELECT id FROM public.payments WHERE payment_number = "PAY001"), "payment_number": "PAY001", "amount": 2450.25}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'customer_added', 'Added new customer Bob Smith', '{"customer_id": (SELECT id FROM public.customers WHERE customer_number = "CUST002"), "customer_number": "CUST002"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'meter_added', 'Added new meter MTR0002', '{"meter_id": (SELECT id FROM public.meters WHERE meter_number = "MTR0002"), "meter_number": "MTR0002"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'reading_recorded', 'Recorded meter reading for MTR0002', '{"reading_id": (SELECT id FROM public.meter_readings WHERE meter_id = (SELECT id FROM public.meters WHERE meter_number = "MTR0002") LIMIT 1), "reading_value": 105.8}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'bill_generated', 'Generated bill BILL002', '{"bill_id": (SELECT id FROM public.bills WHERE bill_number = "BILL002"), "bill_number": "BILL002", "amount": 1699.50}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
((SELECT id FROM public.users LIMIT 1), 'payment_received', 'Received payment PAY002', '{"payment_id": (SELECT id FROM public.payments WHERE payment_number = "PAY002"), "payment_number": "PAY002", "amount": 2004.75}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Update the paid_at timestamp for paid bills
UPDATE public.bills 
SET paid_at = '2024-01-12 14:30:00' 
WHERE bill_number = 'BILL001';

UPDATE public.bills 
SET paid_at = '2024-02-16 16:45:00' 
WHERE bill_number = 'BILL004';

UPDATE public.bills 
SET paid_at = '2024-02-25 11:20:00' 
WHERE bill_number = 'BILL007';

UPDATE public.bills 
SET paid_at = '2024-02-10 09:15:00' 
WHERE bill_number = 'BILL010';

-- Display summary of inserted data
SELECT 'Sample data insertion completed successfully!' as status;

-- Show summary counts
SELECT 
    'Customers' as table_name, COUNT(*) as count FROM public.customers
UNION ALL
SELECT 'Meters', COUNT(*) FROM public.meters
UNION ALL
SELECT 'Meter Readings', COUNT(*) FROM public.meter_readings
UNION ALL
SELECT 'Bills', COUNT(*) FROM public.bills
UNION ALL
SELECT 'Payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM public.activity_log; 