-- FYP Hospital Management System - Database Schema
-- Developed for Haramaya University Computer Science FYP

-- Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'receptionist', 'doctor', 'nurse', 'lab-tech', 'pharmacist')),
  department TEXT,
  contact_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patients Table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL,
  contact_number TEXT,
  email TEXT,
  address_street TEXT,
  address_city TEXT,
  address_region TEXT,
  blood_group TEXT,
  genotype TEXT,
  allergies TEXT[],
  medical_history TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'stable', 'critical', 'discharged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments Table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  nurse_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'checked-in', 'consulting', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vitals Table
CREATE TABLE vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  nurse_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  temperature DECIMAL(4,2),
  pulse_rate INTEGER,
  respiratory_rate INTEGER,
  weight DECIMAL(5,2),
  height INTEGER,
  spo2 INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Medical Records Table
CREATE TABLE medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis TEXT NOT NULL,
  history TEXT,
  examination TEXT,
  plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lab Tests Table
CREATE TABLE lab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  test_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sampled', 'completed', 'cancelled')),
  result TEXT,
  reference_range TEXT,
  request_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE
);

-- Medicines Table
CREATE TABLE medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  expiry_date DATE,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prescriptions Table
CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  pharmacist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partially-dispensed', 'dispensed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prescription Items Table
CREATE TABLE prescription_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES medicines(id) ON DELETE RESTRICT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed'))
);

-- Billing Table
CREATE TABLE billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'consultation', 'laboratory', 'pharmacy', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'cancelled')),
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Row Level Security) - Simplified for prototype/FYP
-- In production, these should be more granular

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and write (simplified for FYP)
CREATE POLICY "Public Read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public Read" ON patients FOR SELECT USING (true);
CREATE POLICY "Public Read" ON appointments FOR SELECT USING (true);
CREATE POLICY "Public Read" ON vitals FOR SELECT USING (true);
CREATE POLICY "Public Read" ON medical_records FOR SELECT USING (true);
CREATE POLICY "Public Read" ON lab_tests FOR SELECT USING (true);
CREATE POLICY "Public Read" ON medicines FOR SELECT USING (true);
CREATE POLICY "Public Read" ON prescriptions FOR SELECT USING (true);
CREATE POLICY "Public Read" ON prescription_items FOR SELECT USING (true);
CREATE POLICY "Public Read" ON billing FOR SELECT USING (true);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Automation: Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, status)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Staff'), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'doctor'),
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
