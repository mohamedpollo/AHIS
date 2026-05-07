import { Patient, Profile, Appointment, Medicine, LabTest, MedicalRecord, Billing, Prescription, Vitals } from '../types';

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'P001', 
    first_name: 'Abdifatah', 
    last_name: 'Maygag', 
    dob: '1985-03-12', 
    gender: 'M', 
    contact_number: '+251 91 123 4567', 
    address_street: 'Bole Road, Addis Ababa',
    blood_group: 'O+',
    allergies: ['Penicillin'],
    status: 'active',
    emergency_contact_name: 'Mariam Maygag',
    emergency_contact_phone: '+251 91 000 1111',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'P002', 
    first_name: 'Abdirahman', 
    last_name: 'Aden', 
    dob: '1990-11-20', 
    gender: 'M', 
    contact_number: '+251 92 234 5678', 
    address_street: 'Kazanchis, Addis Ababa',
    blood_group: 'A-',
    allergies: ['Peanuts'],
    status: 'active',
    emergency_contact_name: 'Ahmed Omer',
    emergency_contact_phone: '+251 92 000 2222',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: 'A001', 
    patient_id: 'P001', 
    doctor_id: 'D001', 
    appointment_date: '2026-04-10T09:00:00Z', 
    status: 'completed', 
    notes: 'Hypertension follow-up',
    created_at: new Date().toISOString()
  }
];

export const MOCK_STAFF: Profile[] = [
  { 
    id: 'D001', 
    full_name: 'Dr. Ahmed Hassan', 
    role: 'doctor', 
    specialization: 'Cardiology', 
    contact_number: '+251 91 111 2222', 
    status: 'active',
    created_at: new Date().toISOString()
  },
  { 
    id: 'S001', 
    full_name: 'Receptionist Muna', 
    role: 'receptionist', 
    status: 'active',
    created_at: new Date().toISOString()
  }
];

export const MOCK_MEDICINES: Medicine[] = [
  { id: 'M001', name: 'Paracetamol', category: 'Analgesic', stock_quantity: 500, unit_price: 5.00, expiry_date: '2026-12-01', unit: 'Tablets' },
  { id: 'M002', name: 'Amoxicillin', category: 'Antibiotic', stock_quantity: 200, unit_price: 15.00, expiry_date: '2026-06-15', unit: 'Capsules' }
];

export const MOCK_LAB_TESTS: LabTest[] = [
  { id: 'L001', patient_id: 'P001', test_name: 'Complete Blood Count (CBC)', status: 'completed', request_date: '2026-04-10', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const MOCK_BILLING: Billing[] = [
  { id: 'B001', patient_id: 'P001', amount: 650.00, status: 'paid', issued_date: '2026-04-10T10:05:00Z', currency: 'ETB', billing_type: 'consultation', created_at: new Date().toISOString() }
];

export const MOCK_RECORDS: MedicalRecord[] = [
  { id: 'R001', patient_id: 'P001', doctor_id: 'D001', diagnosis: 'Hypertension Stage 2', treatment_plan: 'Amlodipine 5mg QD', created_at: new Date().toISOString() }
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'PR001', patient_id: 'P001', doctor_id: 'D001', status: 'dispensed', created_at: new Date().toISOString() }
];

export const MOCK_VITALS: Vitals[] = [
  { id: 'V001', patient_id: 'P001', appointment_id: 'A001', bp_systolic: 155, bp_diastolic: 98, temperature: 36.6, pulse_rate: 78, created_at: new Date().toISOString() }
];
