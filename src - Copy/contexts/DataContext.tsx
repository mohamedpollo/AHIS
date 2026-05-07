import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/database';
import { 
  MOCK_PATIENTS, 
  MOCK_APPOINTMENTS, 
  MOCK_STAFF, 
  MOCK_MEDICINES, 
  MOCK_LAB_TESTS, 
  MOCK_BILLING, 
  MOCK_RECORDS, 
  MOCK_PRESCRIPTIONS, 
  MOCK_VITALS 
} from '../lib/mockData';
import { 
  Patient, 
  Appointment, 
  MedicalRecord, 
  Billing, 
  Profile, 
  Medicine, 
  LabTest, 
  Prescription,
  Vitals
} from '../types';

interface DataContextType {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  medicalRecords: MedicalRecord[]; // Alias
  billing: Billing[];
  staff: Profile[];
  profiles: Profile[]; // Alias
  medicines: Medicine[];
  labTests: LabTest[];
  prescriptions: Prescription[];
  vitals: Vitals[];
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Create actions
  addPatient: (patient: any) => Promise<Patient>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  addAppointment: (appointment: any) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  addRecord: (record: any) => Promise<MedicalRecord>;
  addMedicalRecord: (record: any) => Promise<MedicalRecord>; // Alias
  addBill: (bill: any) => Promise<Billing>;
  updateBill: (id: string, data: Partial<Billing>) => Promise<void>;
  updateMedicine: (id: string, data: Partial<Medicine>) => Promise<void>;
  addLabTest: (test: any) => Promise<string>;
  updateLabTest: (id: string, data: Partial<LabTest>) => Promise<void>;
  addPrescription: (prescription: any, items: any[]) => Promise<string>;
  updatePrescription: (id: string, data: Partial<Prescription>) => Promise<void>;
  addVitals: (vitals: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [
        patientsData,
        appointmentsData,
        recordsData,
        billingData,
        staffData,
        medicinesData,
        labTestsData,
        prescriptionsData,
        vitalsData
      ] = await Promise.all([
        db.patients.list(),
        db.appointments.list(),
        db.medicalRecords.list(),
        db.billing.list(),
        db.profiles.list(),
        db.medicines.list(),
        db.labTests.list(),
        db.prescriptions.list(),
        db.vitals.list()
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setRecords(recordsData);
      setBilling(billingData);
      setStaff(staffData);
      setMedicines(medicinesData);
      setLabTests(labTestsData);
      setPrescriptions(prescriptionsData);
      setVitals(vitalsData);
    } catch (error) {
      console.error('Error refreshing data, falling back to mock data:', error);
      setPatients(MOCK_PATIENTS);
      setAppointments(MOCK_APPOINTMENTS);
      setRecords(MOCK_RECORDS);
      setBilling(MOCK_BILLING);
      setStaff(MOCK_STAFF);
      setMedicines(MOCK_MEDICINES);
      setLabTests(MOCK_LAB_TESTS);
      setPrescriptions(MOCK_PRESCRIPTIONS);
      setVitals(MOCK_VITALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addPatient = async (data: any) => {
    const patient = await db.patients.create(data);
    setPatients(prev => [patient, ...prev]);
    return patient;
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    const updated = await db.patients.update(id, data);
    setPatients(prev => prev.map(p => p.id === id ? updated : p));
  };

  const addAppointment = async (data: any) => {
    const app = await db.appointments.create(data);
    setAppointments(prev => [...prev, app]);
    return app;
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const updated = await db.appointments.update(id, data);
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
  };

  const addRecord = async (data: any) => {
    const record = await db.medicalRecords.create(data);
    setRecords(prev => [record, ...prev]);
    return record;
  };

  const addBill = async (data: any) => {
    const bill = await db.billing.create(data);
    setBilling(prev => [bill, ...prev]);
    return bill;
  };

  const updateBill = async (id: string, data: Partial<Billing>) => {
    const updated = await db.billing.update(id, data);
    setBilling(prev => prev.map(b => b.id === id ? updated : b));
  };

  const updateMedicine = async (id: string, data: Partial<Medicine>) => {
    const updated = await db.medicines.update(id, data);
    setMedicines(prev => prev.map(m => m.id === id ? updated : m));
  };

  const addLabTest = async (data: any) => {
    const test = await db.labTests.create(data);
    setLabTests(prev => [test, ...prev]);
    return test.id;
  };

  const updateLabTest = async (id: string, data: Partial<LabTest>) => {
    const updated = await db.labTests.update(id, data);
    setLabTests(prev => prev.map(t => t.id === id ? updated : t));
  };

  const addPrescription = async (data: any, items: any[]) => {
    const prescription = await db.prescriptions.create(data, items);
    setPrescriptions(prev => [prescription, ...prev]);
    return prescription.id;
  };

  const updatePrescription = async (id: string, data: Partial<Prescription>) => {
    const updated = await db.prescriptions.update(id, data);
    setPrescriptions(prev => prev.map(p => p.id === id ? updated : p));
  };

  const addVitals = async (data: any) => {
    const v = await db.vitals.create(data);
    setVitals(prev => [v, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      patients, appointments, records, medicalRecords: records, 
      billing, staff, profiles: staff, 
      medicines, labTests, prescriptions, vitals,
      loading, refreshData,
      addPatient, updatePatient, addAppointment, updateAppointment, 
      addRecord, addMedicalRecord: addRecord,
      addBill, updateBill, updateMedicine, addLabTest, updateLabTest,
      addPrescription, updatePrescription, addVitals
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
