import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  Calendar, User, FileEdit, CheckCircle, Activity, 
  ClipboardList, Clock, History, FileText, X, File, 
  Stethoscope, Microscope, Pill, Send, Thermometer, 
  Heart, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Appointment } from '../../types';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const { 
    appointments, 
    vitals, 
    medicalRecords, 
    addMedicalRecord, 
    addLabTest, 
    addPrescription, 
    updateAppointment,
    refreshData 
  } = useData();
  
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'consult' | 'lab' | 'rx'>('consult');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [labSummary, setLabSummary] = useState('');
  const [prescriptions, setPrescriptions] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);

  // Filter today's appointments for this doctor that are checked-in or completed
  const doctorAppts = appointments.filter(a => {
    const isToday = new Date(a.appointment_date).toDateString() === new Date().toDateString();
    return isToday && (a.status === 'checked-in' || a.status === 'in-progress' || a.status === 'completed');
  });

  const selectedPatientVitals = selectedAppt ? vitals.filter(v => v.appointment_id === selectedAppt.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

  const handleCompleteConsultation = async () => {
    if (!selectedAppt || !profile) return;
    setIsSaving(true);
    try {
      // 1. Save Medical Record
      await addMedicalRecord({
        appointment_id: selectedAppt.id,
        patient_id: selectedAppt.patient_id,
        doctor_id: profile.id,
        diagnosis,
        treatment_plan: treatmentPlan,
        notes: diagnosis // simplified for now
      });

      // 2. Save prescriptions if any
      if (prescriptions.some(p => p.name)) {
        await addPrescription({
          appointment_id: selectedAppt.id,
          patient_id: selectedAppt.patient_id,
          doctor_id: profile.id,
          status: 'draft'
        }, prescriptions.filter(p => p.name).map(p => ({
          medicine_name: p.name,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration
        })));
      }

      // 3. Update appointment status
      await updateAppointment(selectedAppt.id, { status: 'completed' });
      
      setSelectedAppt(null);
      setDiagnosis('');
      setTreatmentPlan('');
      setPrescriptions([{ name: '', dosage: '', frequency: '', duration: '' }]);
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestLab = async () => {
    if (!selectedAppt || !profile || !labSummary) return;
    try {
      await addLabTest({
        appointment_id: selectedAppt.id,
        patient_id: selectedAppt.patient_id,
        requested_by: profile.id,
        test_name: labSummary,
        status: 'pending'
      });
      setLabSummary('');
      alert("Laboratory test requested successfully.");
    } catch (err) {
       console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-700">
      
      {/* Appointment Queue */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-280px)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Patient Queue
            </h3>
            <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              {doctorAppts.filter(a => a.status !== 'completed').length} Pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {doctorAppts.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <CheckCircle className="w-12 h-12 mb-3 text-slate-100" />
                <p className="text-slate-500 font-medium text-sm">No appointments today</p>
              </div>
            ) : (
              doctorAppts.map(appt => (
                <button 
                  key={appt.id} 
                  onClick={() => setSelectedAppt(appt)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group",
                    selectedAppt?.id === appt.id 
                      ? "border-primary-200 bg-primary-50 shadow-sm" 
                      : "border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                    appt.status === 'completed' ? "bg-slate-100 text-slate-400" : "bg-white text-primary-600 shadow-sm"
                  )}>
                    {appt.patient?.first_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{appt.patient?.first_name} {appt.patient?.last_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(appt.appointment_date), 'HH:mm')}</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                        appt.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clinical Workspace */}
      <div className="xl:col-span-2">
        {selectedAppt ? (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[calc(100vh-280px)] flex flex-col">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl font-black">
                  {selectedAppt.patient?.first_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedAppt.patient?.first_name} {selectedAppt.patient?.last_name}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Age: {selectedAppt.patient?.age} • {selectedAppt.patient?.gender}
                    </span>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                      Appointment ID: {selectedAppt.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BP</span>
                  </div>
                  <p className="text-sm font-black text-slate-800">{selectedPatientVitals ? `${selectedPatientVitals.bp_systolic}/${selectedPatientVitals.bp_diastolic}` : '--/--'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Thermometer className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temp</span>
                  </div>
                  <p className="text-sm font-black text-slate-800">{selectedPatientVitals ? `${selectedPatientVitals.temperature}°C` : '--°C'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SpO2</span>
                  </div>
                  <p className="text-sm font-black text-slate-800">{selectedPatientVitals ? `${selectedPatientVitals.spo2}%` : '--%'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pulse</span>
                  </div>
                  <p className="text-sm font-black text-slate-800">{selectedPatientVitals ? `${selectedPatientVitals.pulse_rate}` : '--'}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setActiveTab('consult')}
                className={cn(
                  "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 border",
                  activeTab === 'consult' ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                )}
              >
                <Stethoscope className="w-4 h-4" /> Consultation
              </button>
              <button 
                onClick={() => setActiveTab('lab')}
                className={cn(
                  "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 border",
                  activeTab === 'lab' ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                )}
              >
                <Microscope className="w-4 h-4" /> Lab Requests
              </button>
              <button 
                onClick={() => setActiveTab('rx')}
                className={cn(
                  "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 border",
                  activeTab === 'rx' ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                )}
              >
                <Pill className="w-4 h-4" /> Prescription
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'consult' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clinical Diagnosis & Findings</label>
                    <textarea 
                      rows={6}
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      placeholder="Start clinical documentation here..."
                      className="w-full bg-slate-50 border-slate-100 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Treatment Plan / Recommendations</label>
                    <textarea 
                      rows={4}
                      value={treatmentPlan}
                      onChange={e => setTreatmentPlan(e.target.value)}
                      placeholder="Outlined plan for the patient..."
                      className="w-full bg-slate-50 border-slate-100 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'lab' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Request Laboratory Tests</h4>
                    <p className="text-sm text-slate-500 mb-6">Mention the necessary diagnostics below to alert the laboratory technician.</p>
                    <textarea 
                      rows={4}
                      value={labSummary}
                      onChange={e => setLabSummary(e.target.value)}
                      placeholder="e.g. CBC, Lipid Profile, Blood Sugar..."
                      className="w-full bg-white border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none mb-4"
                    />
                    <button 
                      onClick={handleRequestLab}
                      className="bg-primary-600 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-primary-500/20 text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary-700 transition-all"
                    >
                      <Send className="w-4 h-4" /> Send Lab Order
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'rx' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-lg font-bold text-slate-800">Drug Prescriptions</h4>
                       <button 
                         onClick={() => setPrescriptions([...prescriptions, { name: '', dosage: '', frequency: '', duration: '' }])}
                         className="p-2 bg-white text-primary-600 rounded-xl border border-slate-200 shadow-sm hover:border-primary-500/30 transition-all"
                       >
                         <Plus className="w-5 h-5" />
                       </button>
                    </div>
                    
                    <div className="space-y-4">
                      {prescriptions.map((rx, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
                          <div className="col-span-1">
                            <input 
                              placeholder="Medicine"
                              value={rx.name}
                              onChange={e => {
                                const newRx = [...prescriptions];
                                newRx[idx].name = e.target.value;
                                setPrescriptions(newRx);
                              }}
                              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold"
                            />
                          </div>
                          <div className="col-span-1">
                            <input 
                              placeholder="Dosage"
                              value={rx.dosage}
                              onChange={e => {
                                const newRx = [...prescriptions];
                                newRx[idx].dosage = e.target.value;
                                setPrescriptions(newRx);
                              }}
                              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold"
                            />
                          </div>
                          <div className="col-span-1">
                            <input 
                              placeholder="Freq (e.g. 1-0-1)"
                              value={rx.frequency}
                              onChange={e => {
                                const newRx = [...prescriptions];
                                newRx[idx].frequency = e.target.value;
                                setPrescriptions(newRx);
                              }}
                              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold"
                            />
                          </div>
                          <div className="col-span-1">
                            <input 
                              placeholder="Duration"
                              value={rx.duration}
                              onChange={e => {
                                const newRx = [...prescriptions];
                                newRx[idx].duration = e.target.value;
                                setPrescriptions(newRx);
                              }}
                              className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold"
                            />
                          </div>
                          <button 
                            onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                            className="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between">
              <button 
                onClick={() => setSelectedAppt(null)}
                className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all"
              >
                Hold Consultation
              </button>
              <button 
                disabled={isSaving || !diagnosis}
                onClick={handleCompleteConsultation}
                className="px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {isSaving ? <Activity className="w-5 h-5 animate-pulse" /> : <CheckCircle className="w-5 h-5" />}
                {isSaving ? 'Saving Record...' : 'Complete & Finalize Encounter'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 mb-6">
              <User className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Clinical Desk Idle</h3>
            <p className="text-slate-400 text-sm font-medium mt-2 max-w-sm">
              Please select a patient from the queue to review their clinical history, take vitals, and proceed with the consultation.
            </p>
          </div>
        )}
      </div>
    
    </div>
  );
}
