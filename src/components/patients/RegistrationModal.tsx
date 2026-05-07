import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export default function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const { addPatient, addBill, refreshData } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'M',
    contact: '',
    address: '',
    bloodGroup: 'O+',
    status: 'active' as const,
    registrationFee: '200',
    allergies: [] as string[]
  });

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { registrationFee, ...patientData } = regForm;
      
      const newPatient = await addPatient({
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        dob: patientData.dob,
        gender: patientData.gender === 'Male' ? 'M' : 'F',
        contact_number: patientData.contact,
        address_street: patientData.address,
        blood_group: patientData.bloodGroup,
        status: patientData.status,
        allergies: patientData.allergies
      });
      
      if (!newPatient || !newPatient.id) throw new Error("Failed to create patient");

      // Auto-generate registration fee bill
      if (registrationFee && parseFloat(registrationFee) > 0) {
        await addBill({
          patient_id: newPatient.id,
          amount: parseFloat(registrationFee),
          status: 'unpaid',
          currency: 'ETB',
          billing_type: 'registration',
          description: 'New Patient Registration Fee'
        });
      }

      await refreshData();
      onClose();
      if (onSuccess) onSuccess(newPatient.id);
      
      setRegForm({
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'M',
        contact: '',
        address: '',
        bloodGroup: 'O+',
        status: 'active',
        registrationFee: '200',
        allergies: []
      });
    } catch (err) {
      console.error(err);
      alert("Error registering patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-100 flex flex-col custom-scrollbar"
        >
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              Clinical Registration
            </h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleRegisterPatient} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
              <div className="col-span-1 md:col-span-2 mb-2">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Identity Credentials</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Given Name</label>
                <input required type="text" value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none" placeholder="e.g. Abebe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Family Name</label>
                <input required type="text" value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none" placeholder="e.g. Kebede" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                <input required type="date" value={regForm.dob} onChange={e => setRegForm({...regForm, dob: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender</label>
                  <select value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Blood Group</label>
                  <select value={regForm.bloodGroup} onChange={e => setRegForm({...regForm, bloodGroup: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none">
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
              <div className="col-span-1 md:col-span-2 mb-2">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Reachability / Operations</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Contact</label>
                <input required type="tel" value={regForm.contact} onChange={e => setRegForm({...regForm, contact: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none" placeholder="+251 9XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Registration Fee (ETB)</label>
                <input type="number" required value={regForm.registrationFee} onChange={e => setRegForm({...regForm, registrationFee: e.target.value})} className="w-full px-4 py-3 bg-white border border-rose-200 text-rose-900 rounded-xl text-sm font-bold font-mono focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all outline-none" placeholder="200" />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Physical Address</label>
                <textarea required value={regForm.address} onChange={e => setRegForm({...regForm, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none resize-none h-24" placeholder="House No, Street, Sub-city..." />
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">Known Allergies (Optional)</label>
                <input type="text" placeholder="e.g. Penicillin, Peanuts (Comma separated)" value={regForm.allergies.join(', ')} onChange={e => setRegForm({...regForm, allergies: e.target.value.split(',').map(s => s.trim())})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none" />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 pt-6 flex justify-end gap-4 pb-2 z-10">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-8 py-4 bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50">Discard</button>
              <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enroll into Registry
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
