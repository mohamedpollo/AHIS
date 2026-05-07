export type UserRole = 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'lab-tech' | 'pharmacist';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  department?: string;
  specialization?: string;
  contact_number?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob: string;
  age?: number;
  gender: string;
  contact_number?: string;
  email?: string;
  address_street?: string;
  address_city?: string;
  address_region?: string;
  blood_group?: string;
  genotype?: string;
  allergies?: string[];
  medical_history?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  status: 'active' | 'stable' | 'critical' | 'discharged';
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  nurse_id?: string;
  appointment_date: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  // Joined fields
  patient?: Patient;
  doctor?: Profile;
}

export interface Vitals {
  id: string;
  appointment_id: string;
  patient_id: string;
  nurse_id?: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  temperature?: number;
  pulse_rate?: number;
  respiratory_rate?: number;
  weight?: number;
  height?: number;
  spo2?: number;
  notes?: string;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  treatment_plan?: string;
  history?: string;
  examination?: string;
  plan?: string;
  notes?: string;
  created_at: string;
  // Joined fields
  doctor?: Profile;
  patient?: Patient;
}

export interface LabTest {
  id: string;
  patient_id: string;
  requested_by?: string;
  doctor_id?: string;
  technician_id?: string;
  appointment_id?: string;
  test_name: string;
  status: 'pending' | 'processing' | 'sampled' | 'completed' | 'cancelled';
  result_summary?: string;
  result?: string;
  reference_range?: string;
  request_date?: string;
  created_at: string;
  updated_at: string;
  completed_date?: string;
  // Joined fields
  patient?: Patient;
  doctor?: Profile;
  requested_by_profile?: Profile;
}

export interface Medicine {
  id: string;
  name: string;
  category?: string;
  stock_quantity: number;
  unit_price: number;
  expiry_date?: string;
  unit?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  pharmacist_id?: string;
  appointment_id?: string;
  medical_record_id?: string;
  status: 'pending' | 'partially-dispensed' | 'dispensed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  // Joined fields
  patient?: Patient;
  doctor?: Profile;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id?: string;
  prescription_id?: string;
  medicine_id?: string;
  medicine_name?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  status?: 'pending' | 'dispensed';
  // Joined fields
  medicine?: Medicine;
}

export interface Billing {
  id: string;
  patient_id: string;
  appointment_id?: string;
  billing_type: string;
  type?: 'registration' | 'consultation' | 'laboratory' | 'pharmacy' | 'other';
  amount: number;
  status: 'paid' | 'unpaid' | 'cancelled';
  currency?: string;
  issued_date?: string;
  payment_date?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  // Joined fields
  patient?: Patient;
}
