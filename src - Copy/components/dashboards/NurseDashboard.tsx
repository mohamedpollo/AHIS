import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { 
  Activity, 
  Thermometer, 
  Weight, 
  Droplets,
  ClipboardCheck,
  Clock,
  User,
  Settings2,
  FileSignature,
  FileText,
  Send,
  Pill
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Prescription } from '../../types';

export default function NurseDashboard() {
  const { appointments, patients, prescriptions, addVitals, updateAppointment, updatePrescription, refreshData } = useData();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'triage' | 'orders'>('triage');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Prescription | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter today's scheduled or checked-in appointments
  const todayAppts = appointments.filter(app => {
    const isToday = new Date(app.appointment_date).toDateString() === new Date().toDateString();
    return isToday && (app.status === 'scheduled' || app.status === 'checked-in');
  });

  const draftOrders = prescriptions.filter(p => p.status === 'draft');

  const [vitalsForm, setVitalsForm] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    temperature: '',
    pulse_rate: '',
    respiratory_rate: '',
    weight: '',
    height: '',
    spo2: '',
    notes: ''
  });

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    
    setIsSubmitting(true);
    try {
      const app = appointments.find(a => a.id === selectedAppointment);
      if (!app) return;

      await addVitals({
        appointment_id: selectedAppointment,
        patient_id: app.patient_id,
        nurse_id: profile?.id,
        bp_systolic: parseInt(vitalsForm.bp_systolic),
        bp_diastolic: parseInt(vitalsForm.bp_diastolic),
        temperature: parseFloat(vitalsForm.temperature),
        pulse_rate: parseInt(vitalsForm.pulse_rate),
        respiratory_rate: parseInt(vitalsForm.respiratory_rate),
        weight: parseFloat(vitalsForm.weight),
        height: parseInt(vitalsForm.height),
        spo2: parseInt(vitalsForm.spo2),
        notes: vitalsForm.notes
      });

      await updateAppointment(selectedAppointment, { status: 'checked-in' });
      
      setSelectedAppointment(null);
      setVitalsForm({
        bp_systolic: '', bp_diastolic: '', temperature: '', pulse_rate: '',
        respiratory_rate: '', weight: '', height: '', spo2: '', notes: ''
      });
      await refreshData();
    } catch (error) {
      console.error('Error saving vitals:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOrder = async (id: string) => {
    setIsSubmitting(true);
    try {
      await updatePrescription(id, { status: 'pending' }); // 'pending' means it's ready for Pharmacist
      setSelectedOrder(null);
      await refreshData();
      alert("Order verified and forwarded to Pharmacy successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('triage')}
          className={cn(
            "px-6 py-3 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === 'triage' ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Activity className="w-4 h-4" /> Patient Triage
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={cn(
            "px-6 py-3 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === 'orders' ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <FileSignature className="w-4 h-4" /> Order Verification
          {draftOrders.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">
              {draftOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'triage' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Vitals List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[calc(100vh-280px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Waiting for Triage
              </h3>
              <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                {todayAppts.length} Pending
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {todayAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <ClipboardCheck className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">All patients triaged for now</p>
                </div>
              ) : (
                todayAppts.map(app => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedAppointment(app.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all border",
                      selectedAppointment === app.id
                        ? "bg-primary-50 border-primary-200 shadow-sm"
                        : "bg-white border-slate-100 hover:border-primary-100 hover:bg-slate-50 shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          {app.patient?.first_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{app.patient?.first_name} {app.patient?.last_name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Appt ID: {app.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {format(new Date(app.appointment_date), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary-600">
                        <Settings2 className="w-3 h-3" />
                        READY FOR VITALS
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Vitals Input Form */}
        <div className="lg:col-span-2">
          {selectedAppointment ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Clinical Triage / Vitals</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Recording vitals for <span className="font-bold text-primary-600">{appointments.find(a => a.id === selectedAppointment)?.patient?.first_name}</span>
                  </p>
                </div>
                <Activity className="w-8 h-8 text-primary-500 animate-pulse" />
              </div>

              <form onSubmit={handleVitalsSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BP */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Blood Pressure (mmHg)</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          placeholder="Systolic"
                          required
                          value={vitalsForm.bp_systolic}
                          onChange={e => setVitalsForm({...vitalsForm, bp_systolic: e.target.value})}
                          className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">SYS</span>
                      </div>
                      <span className="text-slate-300 font-bold">/</span>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          placeholder="Diastolic"
                          required
                          value={vitalsForm.bp_diastolic}
                          onChange={e => setVitalsForm({...vitalsForm, bp_diastolic: e.target.value})}
                          className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">DIA</span>
                      </div>
                    </div>
                  </div>

                  {/* Temp */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Body Temperature (°C)</label>
                    <div className="relative">
                      <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 36.6"
                        required
                        value={vitalsForm.temperature}
                        onChange={e => setVitalsForm({...vitalsForm, temperature: e.target.value})}
                        className="w-full bg-slate-50 border-slate-100 rounded-xl pl-11 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">NORMAL: 37</span>
                    </div>
                  </div>

                  {/* Weight & Height */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Weight & Height</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Weight (kg)"
                          required
                          value={vitalsForm.weight}
                          onChange={e => setVitalsForm({...vitalsForm, weight: e.target.value})}
                          className="w-full bg-slate-50 border-slate-100 rounded-xl pl-11 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">KG</span>
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          placeholder="Height (cm)"
                          required
                          value={vitalsForm.height}
                          onChange={e => setVitalsForm({...vitalsForm, height: e.target.value})}
                          className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">CM</span>
                      </div>
                    </div>
                  </div>

                  {/* Pulse & Resp & SpO2 */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Vitals (Pulse/SpO2/Resp)</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          placeholder="Pulse"
                          required
                          value={vitalsForm.pulse_rate}
                          onChange={e => setVitalsForm({...vitalsForm, pulse_rate: e.target.value})}
                          className="w-full bg-slate-50 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">BPM</span>
                      </div>
                      <div className="flex-1 relative">
                        <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          placeholder="SpO2"
                          required
                          value={vitalsForm.spo2}
                          onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})}
                          className="w-full bg-slate-50 border-slate-100 rounded-xl pl-11 pr-12 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Observed Complaints / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Mention any visible distress or specific complaints reported by the patient during triage..."
                    value={vitalsForm.notes}
                    onChange={e => setVitalsForm({...vitalsForm, notes: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                  >
                    <ClipboardCheck className="w-5 h-5" />
                    {isSubmitting ? 'Processing...' : 'Complete Triage & Send to Doctor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(null)}
                    className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all uppercase tracking-wider text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl min-h-[calc(100vh-280px)] flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 mb-6">
                <User className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Patient Selected</h3>
              <p className="text-slate-400 text-sm max-w-sm font-medium">
                Please select a patient from the waiting list on the left to start their clinical triage process.
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'orders' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[calc(100vh-280px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Unverified Orders
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {draftOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <FileSignature className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No pending doctor orders.</p>
                </div>
              ) : (
                draftOrders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all border",
                      selectedOrder?.id === order.id
                        ? "bg-indigo-50 border-indigo-200 shadow-sm"
                        : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50 shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          {order.patient?.first_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{order.patient?.first_name} {order.patient?.last_name}</p>
                          <p className="text-[10px] text-slate-400 font-medium tracking-wide">RX ID: {order.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {format(new Date(order.created_at || new Date()), 'HH:mm')}
                      </span>
                    </div>
                    <div className="mt-3">
                       <p className="text-[10px] font-bold text-indigo-600 px-2 rounded bg-indigo-50 w-fit">NEEDS VERIFICATION</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[calc(100vh-280px)] flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Verify Medical Order</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Review prescription for <span className="font-bold text-slate-800">{selectedOrder.patient?.first_name} {selectedOrder.patient?.last_name}</span> before sending to pharmacy.
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Pill className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prescribed Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.medicine_name}</p>
                          <p className="text-xs text-slate-500">{item.dosage} • {item.duration}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">
                          {item.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-sm text-amber-800 font-medium">
                  <strong>Verification Note:</strong> By forwarding this to the pharmacy, you verify that patient identity, medication names and dosages are correctly transcribed and there are no evident contraindications.
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleVerifyOrder(selectedOrder.id)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Verifying...' : 'Verify & Send to Pharmacy'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all uppercase tracking-wider text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
             <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl min-h-[calc(100vh-280px)] flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 mb-6">
                <FileSignature className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Order Selected</h3>
              <p className="text-slate-400 text-sm max-w-sm font-medium">
                Please select an order from the list to review and send to pharmacy.
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
