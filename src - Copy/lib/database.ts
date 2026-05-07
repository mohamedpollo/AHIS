import { supabase } from './supabase';
import { Patient, Appointment, MedicalRecord, Billing, Profile, Medicine, LabTest, Prescription, Vitals } from '../types';

export const db = {
  patients: {
    async list() {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Patient[];
    },
    async get(id: string) {
      const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Patient;
    },
    async create(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase.from('patients').insert(patient).select().single();
      if (error) throw error;
      return data as Patient;
    },
    async update(id: string, patient: Partial<Patient>) {
      const { data, error } = await supabase.from('patients').update(patient).eq('id', id).select().single();
      if (error) throw error;
      return data as Patient;
    }
  },
  appointments: {
    async list() {
      const { data, error } = await supabase.from('appointments').select('*, patient:patients(*), doctor:profiles(*)').order('appointment_date', { ascending: true });
      if (error) throw error;
      return data as Appointment[];
    },
    async create(appointment: Omit<Appointment, 'id' | 'created_at'>) {
      const { data, error } = await supabase.from('appointments').insert(appointment).select().single();
      if (error) throw error;
      return data as Appointment;
    },
    async update(id: string, appointment: Partial<Appointment>) {
      const { data, error } = await supabase.from('appointments').update(appointment).eq('id', id).select().single();
      if (error) throw error;
      return data as Appointment;
    }
  },
  medicalRecords: {
    async list(patientId?: string) {
      let query = supabase.from('medical_records').select('*, doctor:profiles(*)').order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      const { data, error } = await query;
      if (error) throw error;
      return data as MedicalRecord[];
    },
    async create(record: Omit<MedicalRecord, 'id' | 'created_at'>) {
      const { data, error } = await supabase.from('medical_records').insert(record).select().single();
      if (error) throw error;
      return data as MedicalRecord;
    }
  },
  vitals: {
    async list(patientId?: string) {
      let query = supabase.from('vitals').select('*').order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Vitals[];
    },
    async create(vitals: Omit<Vitals, 'id' | 'created_at'>) {
      const { data, error } = await supabase.from('vitals').insert(vitals).select().single();
      if (error) throw error;
      return data as Vitals;
    }
  },
  labTests: {
    async list() {
      const { data, error } = await supabase.from('lab_tests').select('*, patient:patients(*), doctor:profiles(*)').order('request_date', { ascending: false });
      if (error) throw error;
      return data as LabTest[];
    },
    async create(test: Omit<LabTest, 'id' | 'request_date'>) {
      const { data, error } = await supabase.from('lab_tests').insert(test).select().single();
      if (error) throw error;
      return data as LabTest;
    },
    async update(id: string, test: Partial<LabTest>) {
      const { data, error } = await supabase.from('lab_tests').update(test).eq('id', id).select().single();
      if (error) throw error;
      return data as LabTest;
    }
  },
  medicines: {
    async list() {
      const { data, error } = await supabase.from('medicines').select('*').order('name');
      if (error) throw error;
      return data as Medicine[];
    },
    async update(id: string, medicine: Partial<Medicine>) {
      const { data, error } = await supabase.from('medicines').update(medicine).eq('id', id).select().single();
      if (error) throw error;
      return data as Medicine;
    }
  },
  prescriptions: {
    async list() {
      const { data, error } = await supabase.from('prescriptions').select('*, patient:patients(*), doctor:profiles(*), items:prescription_items(*, medicine:medicines(*))').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Prescription[];
    },
    async create(prescription: Omit<Prescription, 'id' | 'created_at'>, items: any[]) {
      const { data: pData, error: pError } = await supabase.from('prescriptions').insert(prescription).select().single();
      if (pError) throw pError;
      
      const itemsWithPid = items.map(item => ({ ...item, prescription_id: pData.id }));
      const { error: iError } = await supabase.from('prescription_items').insert(itemsWithPid);
      if (iError) throw iError;
      
      return pData as Prescription;
    },
    async update(id: string, prescription: Partial<Prescription>) {
      const { data, error } = await supabase.from('prescriptions').update(prescription).eq('id', id).select().single();
      if (error) throw error;
      return data as Prescription;
    }
  },
  billing: {
    async list() {
      const { data, error } = await supabase.from('billing').select('*, patient:patients(*)').order('issued_date', { ascending: false });
      if (error) throw error;
      return data as Billing[];
    },
    async create(bill: Omit<Billing, 'id' | 'issued_date' | 'created_at'>) {
      const { data, error } = await supabase.from('billing').insert(bill).select().single();
      if (error) throw error;
      return data as Billing;
    },
    async update(id: string, bill: Partial<Billing>) {
      const { data, error } = await supabase.from('billing').update(bill).eq('id', id).select().single();
      if (error) throw error;
      return data as Billing;
    }
  },
  profiles: {
    async list() {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      return data as Profile[];
    }
  }
};
