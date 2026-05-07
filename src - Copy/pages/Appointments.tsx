import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { cn } from '../lib/utils';
import { Calendar, Clock, User, Stethoscope, ChevronRight, Search, Plus, Filter, CheckCircle2, XCircle, X, Loader2 } from 'lucide-react';

export default function Appointments() {
  const { appointments, patients, profiles, addAppointment, refreshData } = useData();
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [isBooking, setIsBooking] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const doctors = profiles.filter(p => p.role === 'doctor');

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown Patient';
  };

  const getDoctorName = (id: string) => {
    const d = profiles.find(d => d.id === id);
    return d ? d.full_name : 'Unknown Doctor';
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = getPatientName(a.patient_id).toLowerCase().includes(search.toLowerCase()) ||
                        getDoctorName(a.doctor_id).toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addAppointment({
        patient_id: newAppt.patientId,
        doctor_id: newAppt.doctorId,
        appointment_date: new Date(newAppt.date).toISOString(),
        status: 'scheduled',
        notes: newAppt.notes
      });
      await refreshData();
      setIsBooking(false);
      setNewAppt({
        patientId: '',
        doctorId: '',
        date: new Date().toISOString().slice(0, 16),
        notes: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full pb-12 relative animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Clinic Schedule</h2>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Visit Coordination & Booking Registry</p>
        </div>
        <button 
          onClick={() => setIsBooking(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Book New Session
        </button>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.02)] space-y-8 mx-2">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="relative group w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by patient or doctor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 focus:outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full lg:w-auto overflow-x-auto">
            {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === f ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-6 py-4 rounded-l-2xl">Patient / Doctor</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Clinical Notes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appt => (
                <tr key={appt.id} className="group hover:translate-x-1 transition-all duration-300">
                  <td className="px-6 py-6 border-y border-l border-slate-100 rounded-l-3xl bg-white group-hover:bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-black text-[10px]">
                        {getPatientName(appt.patient_id).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">{getPatientName(appt.patient_id)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dr. {getDoctorName(appt.doctor_id)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 bg-white group-hover:bg-slate-50/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 tracking-tighter">{new Date(appt.appointment_date).toLocaleDateString()}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(appt.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 bg-white group-hover:bg-slate-50/50 max-w-xs group-hover:max-w-md transition-all">
                    <p className="text-xs font-semibold text-slate-500 italic line-clamp-2">{appt.notes || '--'}</p>
                  </td>
                  <td className="px-6 py-6 border-y border-slate-100 bg-white group-hover:bg-slate-50/50">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      appt.status === 'completed' ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                      appt.status === 'cancelled' ? "bg-rose-100 text-rose-800 border-rose-200" :
                      "bg-primary-100 text-primary-800 border-primary-200"
                    )}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-y border-r border-slate-100 rounded-r-3xl bg-white group-hover:bg-slate-50/50">
                    <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Calendar className="w-16 h-16 text-slate-200 mx-auto" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No scheduled sessions detected in registry.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {isBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Book Clinical Session</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Visit Coordination Unit</p>
              </div>
              <button 
                onClick={() => setIsBooking(false)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleBook} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Candidate</label>
                <select 
                  required
                  value={newAppt.patientId}
                  onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.id.slice(0,8)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Physician Assignment</label>
                <select 
                  required
                  value={newAppt.doctorId}
                  onChange={e => setNewAppt({...newAppt, doctorId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.full_name} - {d.specialization || 'Clinical'}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Schedule Timestamp</label>
                <input 
                  type="datetime-local"
                  required
                  value={newAppt.date}
                  onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clinical Brief / Notes</label>
                <textarea 
                  value={newAppt.notes}
                  onChange={e => setNewAppt({...newAppt, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none h-24 resize-none"
                  placeholder="Reason for visit, symptoms, or follow-up details..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsBooking(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
