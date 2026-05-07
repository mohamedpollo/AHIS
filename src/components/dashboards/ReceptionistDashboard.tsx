import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { UserPlus, CreditCard, Calendar, Clock, User, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import RegistrationModal from '../patients/RegistrationModal';

export default function ReceptionistDashboard() {
  const { profile } = useAuth();
  const { patients, billing, appointments, updateBill, refreshData } = useData();
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const todayAppointments = appointments.filter(a => 
    new Date(a.appointment_date).toDateString() === new Date().toDateString()
  ).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  const pendingBills = billing.filter(b => b.status === 'unpaid');

  const handlePayBill = async (id: string) => {
    setIsProcessing(id);
    try {
      await updateBill(id, { status: 'paid', payment_date: new Date().toISOString() });
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setIsRegModalOpen(true)}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all group flex items-start gap-5 text-left"
        >
          <div className="bg-primary-50 p-4 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <UserPlus className="w-6 h-6 text-primary-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">New Registration</h3>
            <p className="text-sm text-slate-500 font-medium">Add a new patient to the system and collect initial fees</p>
          </div>
        </button>

        <Link 
          to="/appointments"
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all group flex items-start gap-5 text-left"
        >
          <div className="bg-emerald-50 p-4 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Calendar className="w-6 h-6 text-emerald-600 group-hover:text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Schedule Patient</h3>
            <p className="text-sm text-slate-500 font-medium">Book consultations, follow-ups or laboratory tests</p>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-5">
          <div className="bg-amber-50 p-4 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Payments Pending</h3>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingBills.length}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Unpaid Invoices</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Today's Appointments */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 text-primary-700 rounded-2xl shadow-sm border border-primary-100/50">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Today's Appointments</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
              </div>
            </div>
            <Link to="/appointments" className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl hover:bg-primary-100 transition-colors uppercase tracking-widest">View All</Link>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[500px] custom-scrollbar">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary-100 hover:shadow-lg shadow-sm transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-400 flex items-center justify-center font-bold shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{apt.patient?.first_name} {apt.patient?.last_name}</p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                        Dr. {apt.doctor?.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                       <Clock className="w-3.5 h-3.5 text-slate-400" /> 
                       {format(new Date(apt.appointment_date), 'HH:mm')}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg mt-2",
                      apt.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-primary-100 text-primary-700"
                    )}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl">
                <Calendar className="w-12 h-12 mb-4 text-slate-200" />
                <p className="text-slate-500 font-bold tracking-tight">No appointments scheduled for today.</p>
                <p className="text-slate-400 text-xs mt-1">Start by clicking 'Schedule Patient'</p>
              </div>
            )}
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl shadow-sm border border-amber-100/50">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Billing Center</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Awaiting Collection</p>
              </div>
            </div>
            <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl uppercase tracking-widest">{pendingBills.length} PENDING</div>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[500px] custom-scrollbar">
            {pendingBills.map((bill) => (
              <div key={bill.id} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 shadow-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">{bill.patient?.first_name} {bill.patient?.last_name}</p>
                      <p className="text-[11px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest flex items-center gap-2">
                        <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">ID: {bill.id.slice(0,6)}</span>
                        <span>•</span>
                        <span>{format(new Date(bill.issued_date), 'MMM do')}</span>
                        <span>•</span>
                        <span className="text-blue-600">{bill.type}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-lg">ETB {bill.amount.toLocaleString()}</p>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 bg-amber-100 text-amber-700">
                      {bill.status}
                    </span>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
                  <button 
                    disabled={isProcessing === bill.id}
                    onClick={() => handlePayBill(bill.id)}
                    className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-emerald-100 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                  >
                    {isProcessing === bill.id ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Confirm Receipt
                  </button>
                  <button className="px-5 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {pendingBills.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl">
                <CreditCard className="w-12 h-12 mb-4 text-slate-200" />
                <p className="text-slate-500 font-bold tracking-tight">No pending collections.</p>
                <p className="text-slate-400 text-xs mt-1">Transactions will appear here when issued</p>
              </div>
            )}
          </div>
        </div>
      
      </div>

      {isRegModalOpen && (
        <RegistrationModal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} />
      )}
    
    </div>
  );
}
