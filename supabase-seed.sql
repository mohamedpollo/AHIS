-- FYP Hospital Management System - Seed Data
-- Run this AFTER running the schema script

-- Seed Medicines
INSERT INTO medicines (name, category, stock_quantity, unit_price, expiry_date, unit) VALUES
('Paracetamol 500mg', 'Analgesic', 1000, 2.50, '2026-12-01', 'Tablet'),
('Amoxicillin 250mg', 'Antibiotic', 500, 12.00, '2025-06-15', 'Capsule'),
('Insulin Glargine', 'Antidiabetic', 50, 150.00, '2025-08-20', 'Vial'),
('Metformin 850mg', 'Antidiabetic', 200, 8.50, '2026-01-10', 'Tablet'),
('Ciprofloxacin 500mg', 'Antibiotic', 300, 25.00, '2026-03-05', 'Tablet'),
('Omeprazole 20mg', 'Antacid', 400, 15.00, '2026-05-20', 'Capsule'),
('Salbutamol Inhaler', 'Bronchodilator', 100, 85.00, '2027-02-14', 'Inhaler');

-- Seed Patients
INSERT INTO patients (first_name, last_name, dob, gender, contact_number, blood_group, status) VALUES
('Abdifatah', 'Maygag', '1985-03-12', 'M', '+251 911 223344', 'O+', 'active'),
('Fatuma', 'Ahmed', '1992-07-28', 'F', '+251 912 334455', 'A-', 'stable'),
('Ali', 'Hassan', '1978-05-15', 'M', '+251 913 445566', 'B+', 'critical'),
('Muna', 'Omer', '2001-11-04', 'F', '+251 914 556677', 'AB+', 'active');

-- Note: To seed 'profiles', you must first create a user in Supabase Authentication 
-- tab and then copy their UUID into the SQL below:
-- INSERT INTO profiles (id, full_name, role, status) VALUES ('PASTE_USER_ID_HERE', 'Your Name', 'admin', 'active');
