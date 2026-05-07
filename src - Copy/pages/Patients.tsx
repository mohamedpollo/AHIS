import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { 
  User, 
  Search, 
  Plus, 
  Calendar, 
  FileText, 
  CreditCard, 
  ChevronRight, 
  Clock,
  ArrowLeft,
  Activity,
  UserCircle,
  Stethoscope,
  Droplet,
  Info,
  ShieldAlert,
  MapPin,
  Phone,
  Filter,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Patient,
  Appointment,
  MedicalRecord,
  Billing as Bill,
  LabTest,
  Prescription
} from '../types';

interface PatientHistory {
  patient: Patient;
  appointments: Appointment[];
  records: MedicalRecord[];
  billing: Bill[];
}

// --- Components ---

const StatusBadge = ({ status }: { status?: string }) => {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    stable: "bg-blue-50 text-blue-700 border-blue-100",
    critical: "bg-rose-50 text-rose-700 border-rose-100 animate-pulse",
  };
  
  const currentStatus = status || 'active';
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
      styles[currentStatus] || "bg-slate-100 text-slate-600 border-slate-200"
    )}>
      {currentStatus}
    </span>
  );
};

const FormatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2
  }).format(amount);
};

const LAB_TEST_OPTIONS = [
  'Complete Blood Count (CBC)',
  'Blood Glucose (Random/Fasting)',
  'Liver Function Test (LFT)',
  'Renal Function Test (RFT)',
  'Lipid Profile',
  'Urinalysis',
  'Chest X-Ray',
  'ECG / EKG',
  'Ultrasound Abdomen'
];

import RegistrationModal from '../components/patients/RegistrationModal';

export default function Patients() {
  const { profile } = useAuth();
  const { 
    patients, 
    appointments, 
    records: medicalRecords, 
    billing, 
    medicines,
    addPatient, 
    updatePatient, 
    addAppointment, 
    updateAppointment,
    addRecord, 
    addBill,
    updateBill,
    addLabTest,
    addPrescription,
    refreshData
  } = useData();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'clinical' | 'appointments' | 'billing' | 'info'>('clinical');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCreatingAppt, setIsCreatingAppt] = useState(false);
  const [apptForm, setApptForm] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    prescription: '',
    presentingComplaint: '',
    familyHistory: '',
    socialHistory: '',
    vitalsBp: '',
    vitalsTemp: '',
    vitalsPulse: '',
    generateBillAmount: '500',
    selectedLabTests: [] as string[],
    prescribedMeds: [] as { medicineId: string; dosage: string; frequency: string; duration: string }[],
  });

  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (patients.length > 0) {
      setLoading(false);
    }
  }, [patients]);

  useEffect(() => {
    if (selectedPatientId) {
      setIsEditing(false);
      
      const p = patients.find(p => p.id === selectedPatientId);
      if (p) {
        setHistory({
          patient: p,
          appointments: appointments.filter(a => a.patient_id === selectedPatientId),
          records: medicalRecords.filter(r => r.patient_id === selectedPatientId),
          billing: billing.filter(b => b.patient_id === selectedPatientId)
        });
      }
    } else {
      setHistory(null);
      setIsEditing(false);
    }
  }, [selectedPatientId, patients, appointments, medicalRecords, billing]);

  const handleEditInit = () => {
    if (history?.patient) {
      setEditForm({
        first_name: history.patient.first_name,
        last_name: history.patient.last_name,
        dob: history.patient.dob,
        contact_number: history.patient.contact_number,
        address_street: history.patient.address_street,
      });
      setValidationError(null);
      setIsEditing(true);
    }
  };

  const validateForm = () => {
    if (!editForm.contact_number) {
      setValidationError("Contact number is required.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSaveAttempt = () => {
    if (validateForm()) {
      setShowSaveConfirm(true);
    }
  };

  const performSave = async () => {
    if (!selectedPatientId) return;
    setIsSaving(true);
    try {
      await updatePatient(selectedPatientId, editForm);
      await refreshData();
      setIsEditing(false);
      setShowSaveConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedPatientId || !profile) return;
    setIsSaving(true);
    try {
      await addAppointment({
        patient_id: selectedPatientId,
        appointment_date: apptForm.date,
        notes: apptForm.notes,
        doctor_id: profile.id,
        status: 'scheduled'
      });
      await refreshData();
      setIsCreatingAppt(false);
      setApptForm({
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedPatientId || !profile) return;
    setIsSaving(true);
    try {
      // 1. Create Medical Record
      const newRecord = await addRecord({
        patient_id: selectedPatientId,
        doctor_id: profile.id,
        diagnosis: recordForm.diagnosis,
        treatment_plan: recordForm.prescription,
        vitals_id: null // Ideally linked to latest vitals
      });

      if (!newRecord) throw new Error("Failed to create record");

      // 2. Create Laboratory Requests
      for (const testName of recordForm.selectedLabTests) {
        await addLabTest({
          patient_id: selectedPatientId,
          test_name: testName,
          requested_by: profile.id,
          status: 'pending'
        });
        
        await addBill({
          patient_id: selectedPatientId,
          billing_type: 'laboratory',
          amount: 150,
          status: 'unpaid',
          currency: 'ETB',
          description: `Lab Test: ${testName}`
        });
      }

      // 3. Create Prescription
      if (recordForm.prescribedMeds.length > 0) {
        await addPrescription({
          patient_id: selectedPatientId,
          doctor_id: profile.id,
          status: 'pending'
        }, recordForm.prescribedMeds.filter(p => p.medicineId).map(p => ({
          medicine_id: p.medicineId,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration
        })));
      }
      
      // 4. Consultation Bill
      if (recordForm.generateBillAmount && parseFloat(recordForm.generateBillAmount) > 0) {
        await addBill({
          patient_id: selectedPatientId,
          billing_type: 'consultation',
          amount: parseFloat(recordForm.generateBillAmount),
          status: 'unpaid',
          currency: 'ETB',
          description: `Medical Consultation: ${recordForm.diagnosis}`
        });
      }

      await refreshData();
      setIsCreatingRecord(false);
      setRecordForm({
        diagnosis: '',
        prescription: '',
        presentingComplaint: '',
        familyHistory: '',
        socialHistory: '',
        vitalsBp: '',
        vitalsTemp: '',
        vitalsPulse: '',
        generateBillAmount: '500',
        selectedLabTests: [],
        prescribedMeds: [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      await updateBill(billId, { status: 'paid' });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteAppt = async (apptId: string) => {
    try {
      await updateAppointment(apptId, { status: 'completed' });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = patients.filter(p => {
    const query = search.toLowerCase();
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.includes(query) || 
           p.id.toString().includes(query) || 
           (p.blood_group || '').toLowerCase().includes(query) ||
           (p.status || '').toLowerCase().includes(query);
  });

  if (loading) return (
    <div className="h-full flex items-center justify-center p-8 bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Initializing Nexus Registry...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-7rem)] lg:overflow-hidden">
      
      {/* Registry Sidebar */}
      <div className={cn(
        "flex-col lg:w-96 bg-white border border-slate-200/60 rounded-3xl shrink-0 lg:overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300",
        selectedPatientId ? "hidden lg:flex lg:h-full" : "flex w-full h-[calc(100vh-7rem)] lg:h-full flex-1"
      )}>
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="text-lg font-bold text-slate-800 tracking-tight">Patient Registry</h3>
               <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Hospital Management Unit</p>
             </div>
             {(profile?.role === 'admin' || profile?.role === 'receptionist' || profile?.role === 'nurse') && (
               <button 
                 onClick={() => setIsRegistering(true)}
                 className="p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
               >
                 <Plus className="w-5 h-5" />
               </button>
             )}
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Deep Search: Name, ID, Blood, Status..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/10">
          {filteredPatients.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left group",
                selectedPatientId === p.id 
                  ? "bg-primary-50 border-primary-200 shadow-sm" 
                  : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-colors",
                selectedPatientId === p.id ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {p.first_name?.charAt(0)}{p.last_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{p.first_name} {p.last_name}</h4>
                  <span className="text-[10px] font-mono text-slate-400 font-bold tracking-tighter">#{p.id.toString().substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{p.blood_group || 'N/A'}</span>
                </div>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-all opacity-0 group-hover:opacity-100", selectedPatientId === p.id ? "text-primary-600 opacity-100 translate-x-1" : "text-slate-300")} />
            </button>
          ))}
        </div>
      </div>

      {/* Profile Detail Pane */}
      <div className={cn(
        "flex-1 bg-white border border-slate-200/60 rounded-3xl lg:overflow-hidden flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300",
        !selectedPatientId ? "hidden lg:flex" : "flex w-full min-h-[calc(100vh-7rem)] lg:h-full flex-1"
      )}>
        <AnimatePresence mode="wait">
          {!selectedPatientId ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
                 <div className="absolute inset-0 border border-slate-100 rounded-full rotate-45 scale-110"></div>
                 <div className="absolute inset-0 border border-slate-100 rounded-full -rotate-12 scale-125"></div>
                 <Stethoscope className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hospital Information System</h3>
              <p className="text-slate-500 max-w-sm text-sm font-medium">Select a patient from the registry to access their clinical records, history, and financial billing profile.</p>
              
              <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                  <Droplet className="w-5 h-5 text-rose-500 mb-3" />
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Blood Registry</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Integrated cross-match verification enabled for all surgical candidates.</p>
                </div>
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                  <ShieldAlert className="w-5 h-5 text-amber-500 mb-3" />
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Clinical Alerts</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Real-time monitoring for critical status and severe allergy markers.</p>
                </div>
              </div>
            </motion.div>
          ) : !history ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
               <div className="w-8 h-8 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin"></div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Retrieving Health Data...</p>
            </div>
          ) : (
            <motion.div 
               key={selectedPatientId}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar"
            >
              {/* Profile Header */}
              <header className="px-4 py-6 md:p-8 border-b border-slate-100 bg-slate-50/50 relative shrink-0">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-xl shadow-primary-500/30">
                        {history.patient.first_name.charAt(0)}{history.patient.last_name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <StatusBadge status={history.patient.status} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-center sm:justify-start">
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight break-words px-4 sm:px-0">
                          {history.patient.first_name} {history.patient.last_name}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-500" /> {history.patient.address_street}</span>
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary-500" /> {history.patient.contact_number}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">MRN: {history.patient.id.toString().substring(0, 8).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
                      <button 
                        className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95" 
                        onClick={() => setSelectedPatientId(null)}
                      >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                      </button>
                      <button className="hidden sm:flex p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        <MoreHorizontal className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {(history.patient.status === 'critical' || (history.patient.allergies && history.patient.allergies.length > 0)) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="bg-rose-50 border border-rose-100 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-rose-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-rose-600/20 shrink-0">
                            <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <div>
                            <h4 className="text-rose-800 font-bold text-sm md:text-base tracking-tight mb-1">Clinical Alerts</h4>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1">
                              {history.patient.status === 'critical' && (
                                <span className="text-rose-700 text-[10px] md:text-xs font-bold flex items-center gap-1.5 uppercase">
                                  <Activity className="w-3 h-3 md:w-3.5 md:h-3.5" /> Critical Condition
                                </span>
                              )}
                              {history.patient.allergies && history.patient.allergies.length > 0 && (
                                <span className="text-rose-700 text-[10px] md:text-xs font-bold flex items-center gap-1.5 uppercase">
                                  <Droplet className="w-3 h-3 md:w-3.5 md:h-3.5" /> Allergies: {history.patient.allergies.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/90 p-3 md:p-4 rounded-xl md:rounded-2xl border border-rose-100/50 backdrop-blur-sm self-stretch md:self-auto">
                          <p className="text-[9px] md:text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                             <Phone className="w-3 h-3" /> Emergency
                          </p>
                          <p className="text-xs md:text-sm font-black text-rose-800 tracking-tight">
                            {history.patient.emergency_contact_phone || 'Not Recorded'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-1 mt-8 p-1 bg-slate-200/40 rounded-xl md:rounded-2xl w-full sm:w-fit border border-slate-200/50 overflow-x-auto custom-scrollbar-hide">
                  {[
                    { id: 'clinical', label: 'Clinical History', icon: Stethoscope },
                    { id: 'appointments', label: 'Appointments', icon: Calendar },
                    { id: 'billing', label: 'Financial Records', icon: CreditCard },
                    { id: 'info', label: 'Identity & Bios', icon: Info },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-tight uppercase transition-all whitespace-nowrap",
                        activeTab === tab.id 
                          ? "bg-white text-primary-700 shadow-sm shadow-slate-200/50" 
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-primary-500" : "text-slate-400")} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </header>

              {/* View Content */}
              <div className="p-4 md:p-8">
                
                {/* --- Clinical History --- */}
                {activeTab === 'clinical' && (
                  <div className="space-y-8 md:space-y-10 max-w-5xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                       <div className="bg-slate-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                              <Droplet className="w-3 h-3 text-rose-500" /> Blood Group
                            </p>
                            <p className="text-xl md:text-2xl font-black text-rose-600 uppercase italic">
                              {history.patient.blood_group || 'O+'}
                            </p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-emerald-600 uppercase mb-0.5 tracking-tighter">Verified</p>
                             <div className="w-2 h-2 bg-emerald-500 rounded-full ml-auto"></div>
                          </div>
                       </div>
                       <div className="bg-slate-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <ShieldAlert className="w-3 h-3 text-amber-500" /> Allergies
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {history.patient.allergies && history.patient.allergies.length > 0 ? history.patient.allergies.map(a => (
                              <span key={a} className="px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-50 text-amber-700 text-[9px] md:text-[10px] font-bold rounded-md border border-amber-100 uppercase tracking-wide">{a}</span>
                            )) : <span className="text-[10px] font-bold text-slate-400 italic uppercase">No allergies</span>}
                          </div>
                       </div>
                       <div className="bg-slate-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex flex-col justify-center sm:col-span-2 md:col-span-1">
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Vitals Recency</p>
                          <p className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary-500" /> Last checked: 2026-04-16
                          </p>
                       </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="font-bold text-slate-800 text-base md:text-lg tracking-tight flex items-center gap-3">
                          <Activity className="w-5 h-5 text-primary-500" />
                          EMR Clinical History
                        </h4>
                        {profile?.role === 'doctor' && (
                          <button 
                            onClick={() => setIsCreatingRecord(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 shadow-xl shadow-slate-900/10 text-white text-[11px] font-bold rounded-xl active:scale-95 transition-all w-full sm:w-auto"
                          >
                            <Plus className="w-3.5 h-3.5" /> Start Consultation
                          </button>
                        )}
                      </div>

                      <div className="relative border-l-2 border-slate-100 ml-4 md:ml-5 pl-6 md:pl-10 space-y-8 md:space-y-12">
                                {history.records.length === 0 ? (
                                  <div className="text-slate-300 text-sm py-12 italic font-medium">No previous clinical records detected in registry.</div>
                                ) : [...history.records].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((record) => (
                          <div key={record.id} className="relative">
                            <div className="absolute -left-[35px] md:-left-[51px] top-4 w-4 h-4 md:w-6 md:h-6 bg-white border-4 border-primary-500 rounded-full z-10 shadow-sm shadow-primary-500/20"></div>
                            <div className="bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] p-5 md:p-8 shadow-[0_4px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.04)] transition-all duration-300">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-slate-50">
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-2">Diagnosis</span>
                                  <h5 className="font-black text-slate-900 text-xl md:text-2xl tracking-tighter decoration-primary-500 underline underline-offset-4 decoration-2 break-words">
                                    {record.diagnosis}
                                  </h5>
                                  <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-4">
                                    <Clock className="w-3.5 h-3.5" /> {new Date(record.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-100 w-fit">
                                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                      <Stethoscope className="w-4 h-4 md:w-5 md:h-5" />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Practitioner</p>
                                      <p className="text-xs font-bold text-slate-800 truncate">Medical Officer</p>
                                   </div>
                                </div>
                              </div>
                              
                              {/* Remove clinicalHistory block since it's not in the type */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-8 md:mb-10">
                                <div className="space-y-6">
                                  <div>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">History & Presentation</p>
                                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-semibold italic border-l-4 border-slate-200 pl-4 py-1">
                                      {record.history || "No clinical history provided."}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Diagnosis Date</p>
                                      <p className="text-xs font-bold text-slate-600 leading-normal">{new Date(record.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                                      <p className="text-xs font-bold text-slate-600 leading-normal">Clinical Record Verified</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-6 md:pt-8 border-t border-slate-50">
                                <div className="flex items-center gap-3 mb-4">
                                   <FileText className="w-4 h-4 text-emerald-500" />
                                   <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol & Treatment Plan</p>
                                </div>
                                <div className="p-4 md:p-5 bg-emerald-50/50 rounded-xl md:rounded-2xl border border-emerald-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <span className="text-sm font-black text-emerald-800 tracking-tight leading-tight">{record.treatment_plan}</span>
                                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg uppercase w-fit whitespace-nowrap">Clinical Registry</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Appointments --- */}
                {activeTab === 'appointments' && (
                  <div className="space-y-8 max-w-5xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
                       <h4 className="font-bold text-slate-800 text-base md:text-xl flex items-center gap-3 tracking-tight">
                         <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary-500" /> 
                         Clinic Session History
                       </h4>
                       {(profile?.role === 'admin' || profile?.role === 'receptionist') && (
                         <button 
                           onClick={() => setIsCreatingAppt(true)}
                           className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white text-[11px] font-bold rounded-xl active:scale-95 transition-all shadow-xl shadow-primary-500/20 w-full sm:w-auto"
                         >
                           <Plus className="w-4 h-4" />
                           Create Appointment
                         </button>
                       )}
                    </div>

                    {history.appointments.length === 0 ? (
                      <div className="text-center py-16 md:py-24 bg-slate-50/50 rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-slate-100">
                          <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest italic">No clinical sessions found in logs</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[...history.appointments].sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()).map(appt => (
                          <div key={appt.id} className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl md:rounded-[1.5rem] shadow-[0_4px_30px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-primary-200 transition-all hover:shadow-[0_10px_40_rgb(0,0,0,0.04)]">
                            <div className="flex items-center gap-4 md:gap-5">
                              <div className={cn(
                                "w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm transition-all shrink-0",
                                appt.status === 'completed' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-primary-50 text-primary-600 border border-primary-100"
                              )}>
                                <span className="text-[9px] md:text-[10px] uppercase font-black opacity-60">{new Date(appt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-xl md:text-2xl leading-none font-black">{new Date(appt.appointment_date).getDate()}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm md:text-base font-bold text-slate-900 tracking-tight line-clamp-1">{appt.notes || 'Routine Medical Visit'}</p>
                                <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-primary-500" /> {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-4 sm:pt-0 border-t border-slate-50 sm:border-0">
                              <span className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                appt.status === 'completed' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                              )}>
                                {appt.status}
                              </span>
                              {(profile?.role === 'admin' || profile?.role === 'receptionist' || profile?.role === 'doctor') && appt.status !== 'completed' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCompleteAppt(appt.id); }}
                                  className="text-[9px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest underline decoration-primary-300 underline-offset-4 active:scale-95 transition-all"
                                >
                                  Finalize Visit
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- Billing --- */}
                {activeTab === 'billing' && (
                  <div className="space-y-8 max-w-5xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
                       <h4 className="font-bold text-slate-800 text-base md:text-xl flex items-center gap-3 tracking-tight">
                         <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-primary-500" /> 
                         Fiscal Portfolio
                       </h4>
                       <div className="px-5 py-4 md:px-6 md:py-4 bg-slate-900 shadow-2xl shadow-slate-900/10 text-white rounded-2xl md:rounded-3xl flex flex-col items-center sm:items-end justify-center">
                         <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Outstanding</span>
                         <span className="text-xl md:text-2xl font-black font-mono tracking-tighter text-primary-400">
                           {FormatCurrency(history.billing.reduce((acc, b) => acc + b.amount, 0))}
                         </span>
                       </div>
                    </div>
                    
                    {/* Mobile View: Cards */}
                    <div className="md:hidden space-y-4">
                       {history.billing.length === 0 ? (
                         <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">No financial sessions on record</p>
                         </div>
                       ) : [...history.billing].sort((a,b) => new Date(b.issued_date || b.created_at).getTime() - new Date(a.issued_date || a.created_at).getTime()).map(bill => (
                         <div key={bill.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                            <div className="flex justify-between items-start pb-4 border-b border-slate-50">
                               <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</p>
                                  <p className="text-xs font-black text-slate-900 font-mono mt-1">#NEX-{bill.id.toString().substring(0, 8).toUpperCase()}</p>
                               </div>
                               <span className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                  bill.status === 'paid' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"
                               )}>
                                  {bill.status}
                               </span>
                            </div>
                            <div className="flex justify-between items-end">
                               <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issued Date</p>
                                  <p className="text-xs font-bold text-slate-600 mt-0.5">{new Date(bill.issued_date || bill.created_at).toLocaleDateString()}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</p>
                                  <p className="text-lg font-black text-slate-900 font-mono tracking-tighter mt-0.5">{FormatCurrency(bill.amount)}</p>
                               </div>
                            </div>
                            {(profile?.role === 'admin' || profile?.role === 'receptionist') && bill.status === 'unpaid' && (
                               <button
                                 onClick={(e) => { e.stopPropagation(); handlePayBill(bill.id); }}
                                 className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 active:scale-95"
                               >
                                 Settle Payment
                               </button>
                            )}
                         </div>
                       ))}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Fisc. Trans. ID</th>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Issue Date</th>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Value (Birr)</th>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Status</th>
                            <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {history.billing.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px] italic">No detected transactions</td></tr>
                          ) : [...history.billing].sort((a,b) => new Date(b.issued_date || b.created_at).getTime() - new Date(a.issued_date || a.created_at).getTime()).map(bill => (
                            <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-7 font-mono font-black text-slate-900 text-xs tracking-tighter">#NEX-{bill.id.toString().substring(0, 8).toUpperCase()}</td>
                              <td className="px-8 py-7 font-bold text-slate-500 uppercase text-[11px] tracking-tight">{new Date(bill.issued_date || bill.created_at).toLocaleDateString()}</td>
                              <td className="px-8 py-7 text-right font-black text-slate-900 font-mono text-lg tracking-tighter">
                                {FormatCurrency(bill.amount)}
                              </td>
                              <td className="px-8 py-7 text-center">
                                <span className={cn(
                                  "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                  bill.status === 'paid' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200 animate-pulse"
                                )}>
                                  {bill.status}
                                </span>
                              </td>
                              <td className="px-8 py-7 text-right">
                                {(profile?.role === 'admin' || profile?.role === 'receptionist') && bill.status === 'unpaid' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handlePayBill(bill.id); }}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {/* --- Identity & Bios --- */}
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-5xl">
                     <section className="bg-slate-50/30 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                           <h5 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                             <User className="w-4 h-4 text-primary-500" />
                             Identity Credentials
                           </h5>
                           <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={handleSaveAttempt} 
                                    className="px-3 py-1 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-colors"
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                (profile?.role === 'admin' || profile?.role === 'receptionist') && (
                                  <button 
                                    onClick={handleEditInit} 
                                    className="p-2 bg-white border border-slate-200 text-primary-600 rounded-xl hover:bg-slate-50 transition-all active:scale-90"
                                    title="Edit Profile"
                                  >
                                    <Plus className="w-4 h-4 rotate-45" />
                                  </button>
                                )
                              )}
                           </div>
                        </div>

                        <div className="space-y-5">
                           {[
                             { label: 'Legal Given Name', key: 'first_name', value: history.patient.first_name, mono: false },
                             { label: 'Legal Family Name', key: 'last_name', value: history.patient.last_name, mono: false },
                             { label: 'Date of Birth', key: 'dob', value: history.patient.dob, mono: true, type: 'date' },
                             { label: 'Gender Identity', value: history.patient.gender === 'M' ? 'Male (M)' : 'Female (F)', mono: false, readOnly: true },
                             { label: 'Primary Blood Group', value: history.patient.blood_group || 'O+', mono: true, highlight: 'text-rose-600', readOnly: true }
                           ].map((item, i) => (
                             <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b border-slate-50/50 group">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                               {isEditing && !item.readOnly ? (
                                 <input 
                                   type={item.type || 'text'}
                                   value={(editForm as any)[item.key!] || ''}
                                   onChange={e => setEditForm({ ...editForm, [item.key!]: e.target.value })}
                                   className="text-sm font-black text-slate-900 tracking-tight bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 w-full sm:max-w-[180px] sm:text-right"
                                 />
                               ) : (
                                 <span className={cn("text-sm font-black text-slate-800 tracking-tight sm:text-right truncate", item.mono && "font-mono", item.highlight)}>{item.value}</span>
                               )}
                             </div>
                           ))}
                        </div>
                     </section>
                     
                     <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h5 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-8 border-b border-slate-50 pb-4">
                           <Phone className="w-4 h-4 text-primary-500" />
                           Logistics & Access
                        </h5>
                        <div className="space-y-6 mb-8">                            <div className="flex flex-col gap-2 py-3 border-b border-slate-50 group">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Residential Locality</span>
                             {isEditing ? (
                               <textarea 
                                 value={editForm.address_street || ''}
                                 onChange={e => setEditForm({ ...editForm, address_street: e.target.value })}
                                 className="text-sm font-bold text-slate-800 tracking-tight bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 h-24 resize-none uppercase"
                               />
                             ) : (
                               <span className="text-sm font-bold text-slate-800 tracking-tight leading-relaxed uppercase">{history.patient.address_street}</span>
                             )}
                           </div>

                           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b border-slate-50 group">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Contact</span>
                             {isEditing ? (
                               <div className="flex flex-col items-stretch sm:items-end gap-1.5 w-full sm:max-w-[180px]">
                                 <input 
                                   type="text"
                                   value={editForm.contact_number || ''}
                                   onChange={e => setEditForm({ ...editForm, contact_number: e.target.value })}
                                   className={cn(
                                     "text-sm font-black text-slate-800 tracking-tight sm:text-right bg-slate-50 px-3 py-2 rounded-xl border focus:outline-none focus:ring-4 font-mono w-full",
                                     validationError ? "border-rose-300 ring-rose-500/10 focus:ring-rose-500/20" : "border-slate-200 focus:ring-primary-500/10"
                                   )}
                                 />
                                 {validationError && (
                                   <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 self-start sm:self-auto">
                                     {validationError}
                                   </span>
                                 )}
                               </div>
                             ) : (
                               <span className="text-sm font-black text-slate-800 font-mono sm:text-right">{history.patient.contact_number}</span>
                             )}
                           </div>
                        </div>

                        <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                           <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl"></div>
                           <div className="relative z-10">
                             <h6 className="text-[11px] font-black mb-1 uppercase tracking-wider text-slate-400">System Command</h6>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">Secure clinical data export for administrative review.</p>
                             <button className="w-full py-4 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-700 transition-all shadow-xl shadow-black/20 active:scale-95 flex items-center justify-center gap-2">
                                <FileText className="w-3.5 h-3.5" />
                                Export Patient Folder
                             </button>
                           </div>
                        </div>
                     </section>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>

      {/* Confirmation Dialog Overlay */}
      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl shadow-black/30 border border-slate-100"
            >
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2 tracking-tight">Confirm Data Integrity</h3>
              <p className="text-slate-500 text-center text-sm font-medium mb-8">
                Are you sure you want to commit these demographic modifications to the central clinical registry? This action is permanent.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowSaveConfirm(false)}
                  className="py-3 px-4 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={performSave}
                  className="py-3 px-4 bg-primary-600 text-white text-xs font-bold uppercase rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
                >
                  Verify & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Creation Modal */}
      <AnimatePresence>
        {isCreatingAppt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatingAppt(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-black/30 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                 <div>
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Schedule Session</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Patient MRN: #{selectedPatientId?.toString().padStart(6, '0')}</p>
                 </div>
                 <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                 </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Appointment Date</label>
                  <input 
                    type="date"
                    value={apptForm.date}
                    onChange={e => setApptForm({ ...apptForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Notes / Reason</label>
                  <textarea 
                    placeholder="Brief description of consultation reason..."
                    value={apptForm.notes}
                    onChange={e => setApptForm({ ...apptForm, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all h-32 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button 
                  onClick={() => setIsCreatingAppt(false)}
                  className="py-3.5 px-4 bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleCreateAppointment}
                  className="py-3.5 px-4 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
                >
                  Confirm Slot
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doctor Consultation EMR Modal */}
      <AnimatePresence>
        {isCreatingRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatingRecord(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                 <div>
                   <h3 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Consultation Form</h3>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Patient MRN: #{selectedPatientId?.toString().padStart(6, '0')}</p>
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setIsCreatingRecord(false)}
                      className="py-2.5 px-6 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleCreateRecord}
                      className="py-2.5 px-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Activity className="w-3.5 h-3.5" /> Finalize Record
                    </button>
                 </div>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2"><FileText className="w-3.5 h-3.5" /> Diagnosis</label>
                      <input 
                        type="text"
                        placeholder="e.g., Acute Bronchitis"
                        value={recordForm.diagnosis}
                        onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">History of Presenting Complaint</label>
                      <textarea 
                        placeholder="Details of symptoms..."
                        value={recordForm.presentingComplaint}
                        onChange={e => setRecordForm({ ...recordForm, presentingComplaint: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all h-28 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Family History</label>
                        <textarea 
                          value={recordForm.familyHistory}
                          onChange={e => setRecordForm({ ...recordForm, familyHistory: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all h-20 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Social History</label>
                        <textarea 
                          value={recordForm.socialHistory}
                          onChange={e => setRecordForm({ ...recordForm, socialHistory: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all h-20 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" /> Vital Signs Assessment
                      </h4>
                      <div className="grid grid-cols-3 gap-3 relative z-10">
                        <div>
                           <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">BP (Sys/Dia)</label>
                           <input 
                             type="text"
                             placeholder="120/80"
                             value={recordForm.vitalsBp}
                             onChange={e => setRecordForm({ ...recordForm, vitalsBp: e.target.value })}
                             className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:bg-white/20 transition-all font-mono text-center placeholder:text-white/20"
                           />
                        </div>
                        <div>
                           <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1 justify-center"><Droplet className="w-3 h-3" /> Temp (°C)</label>
                           <input 
                             type="number"
                             step="0.1"
                             placeholder="36.5"
                             value={recordForm.vitalsTemp}
                             onChange={e => setRecordForm({ ...recordForm, vitalsTemp: e.target.value })}
                             className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:bg-white/20 transition-all font-mono text-center placeholder:text-white/20"
                           />
                        </div>
                        <div>
                           <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1 justify-end">Pulse <Clock className="w-3 h-3" /></label>
                           <input 
                             type="number"
                             placeholder="72"
                             value={recordForm.vitalsPulse}
                             onChange={e => setRecordForm({ ...recordForm, vitalsPulse: e.target.value })}
                             className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:bg-white/20 transition-all font-mono text-center placeholder:text-white/20"
                           />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[11px] font-black text-amber-600 uppercase tracking-widest mb-1">
                        <Droplet className="w-3.5 h-3.5" /> Laboratory Investigations
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-amber-50/30 border border-amber-100 rounded-2xl custom-scrollbar">
                        {LAB_TEST_OPTIONS.map(test => (
                          <label key={test} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-all cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={recordForm.selectedLabTests.includes(test)}
                              onChange={e => {
                                const newTests = e.target.checked 
                                  ? [...recordForm.selectedLabTests, test]
                                  : recordForm.selectedLabTests.filter(t => t !== test);
                                setRecordForm({ ...recordForm, selectedLabTests: newTests });
                              }}
                              className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 truncate">{test}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <label className="flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        <FileText className="w-3.5 h-3.5" /> Pharmacy Prescription
                      </label>
                      <div className="space-y-3 bg-emerald-50/30 p-4 border border-emerald-100 rounded-2xl max-h-60 overflow-y-auto custom-scrollbar">
                        {recordForm.prescribedMeds.map((med, idx) => (
                          <div key={idx} className="bg-white border border-emerald-100 rounded-xl p-3 flex flex-col gap-2 relative group">
                            <button 
                              onClick={() => {
                                const newMeds = [...recordForm.prescribedMeds];
                                newMeds.splice(idx, 1);
                                setRecordForm({ ...recordForm, prescribedMeds: newMeds });
                              }}
                              className="absolute top-2 right-2 p-1 text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-600"
                            >
                              <Plus className="w-3.5 h-3.5 rotate-45" />
                            </button>
                            <select 
                              value={med.medicineId}
                              onChange={e => {
                                const newMeds = [...recordForm.prescribedMeds];
                                newMeds[idx].medicineId = e.target.value;
                                setRecordForm({ ...recordForm, prescribedMeds: newMeds });
                              }}
                              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                            >
                              <option value="">Select Medicine...</option>
                              {medicines.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                            <div className="grid grid-cols-3 gap-2">
                              <input 
                                type="text" placeholder="Dosage (e.g. 1 tab)"
                                value={med.dosage}
                                onChange={e => {
                                  const newMeds = [...recordForm.prescribedMeds];
                                  newMeds[idx].dosage = e.target.value;
                                  setRecordForm({ ...recordForm, prescribedMeds: newMeds });
                                }}
                                className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700"
                              />
                              <input 
                                type="text" placeholder="Freq (e.g. 2x daily)"
                                value={med.frequency}
                                onChange={e => {
                                  const newMeds = [...recordForm.prescribedMeds];
                                  newMeds[idx].frequency = e.target.value;
                                  setRecordForm({ ...recordForm, prescribedMeds: newMeds });
                                }}
                                className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700"
                              />
                              <input 
                                type="text" placeholder="Dur (e.g. 5 days)"
                                value={med.duration}
                                onChange={e => {
                                  const newMeds = [...recordForm.prescribedMeds];
                                  newMeds[idx].duration = e.target.value;
                                  setRecordForm({ ...recordForm, prescribedMeds: newMeds });
                                }}
                                className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700"
                              />
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => setRecordForm({
                            ...recordForm, 
                            prescribedMeds: [...recordForm.prescribedMeds, { medicineId: '', dosage: '', frequency: '', duration: '' }]
                          })}
                          className="w-full py-2 bg-white border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3 h-3" /> Add Medication
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-primary-500" /> Professional Service Fee
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input 
                            type="number"
                            value={recordForm.generateBillAmount}
                            onChange={e => setRecordForm({ ...recordForm, generateBillAmount: e.target.value })}
                            className="bg-slate-50 border border-slate-200 text-slate-900 font-black font-mono w-32 pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">ETB</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold italic tracking-tight">Standard Consultation: 500 ETB</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Replaced with RegistrationModal */}
      <RegistrationModal 
        isOpen={isRegistering} 
        onClose={() => setIsRegistering(false)} 
        onSuccess={(id) => setSelectedPatientId(id)}
      />
    </>
  );
}
