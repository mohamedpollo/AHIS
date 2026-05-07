import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  Package, Pill, CheckCircle2, AlertCircle, 
  Search, ClipboardList, Activity, Box, 
  CornerDownRight, Truck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Prescription } from '../../types';

export default function PharmacistDashboard() {
  const { profile } = useAuth();
  const { prescriptions, medicines, updatePrescription, refreshData } = useData();
  
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);

  // Stats
  const pendingRx = prescriptions.filter(p => p.status === 'pending');
  const lowStock = medicines.filter(m => m.stock_quantity < 50);
  const totalStock = medicines.reduce((acc, m) => acc + m.stock_quantity, 0);

  const handleDispense = async (id: string) => {
    setIsDispensing(true);
    try {
      await updatePrescription(id, { 
        status: 'dispensed',
        updated_at: new Date().toISOString()
      });
      setSelectedRx(null);
      await refreshData();
      alert("Prescription dispensed successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Queue</p>
            <p className="text-3xl font-black text-slate-800">{pendingRx.length}</p>
            <p className="text-xs font-bold text-primary-500 mt-1">Pending Dispensing</p>
          </div>
          <div className="p-4 rounded-2xl bg-primary-50 text-primary-600">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Inventory</p>
            <p className="text-3xl font-black text-slate-800">{totalStock}</p>
            <p className="text-xs font-bold text-emerald-500 mt-1">Units in Stock</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Alerts</p>
            <p className="text-3xl font-black text-slate-800">{lowStock.length}</p>
            <p className="text-xs font-bold text-rose-500 mt-1">Low Stock Items</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Prescription List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm min-h-[500px]">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Pill className="w-6 h-6 text-primary-500" />
                  Prescription Queue
                </h3>
             </div>

             <div className="space-y-4">
                {pendingRx.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                      <CheckCircle2 className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All caught up! No pending orders.</p>
                  </div>
                ) : (
                  pendingRx.map(rx => (
                    <div 
                      key={rx.id}
                      className={cn(
                        "p-5 rounded-2xl border transition-all flex items-center justify-between gap-6 group",
                        selectedRx?.id === rx.id ? "bg-primary-50 border-primary-200" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-primary-600 shadow-sm">
                          {rx.patient?.first_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 mb-0.5">{rx.patient?.first_name} {rx.patient?.last_name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 border-r border-slate-200 pr-3 uppercase tracking-widest">
                              ID: {rx.id.slice(0, 8)}
                            </span>
                            <span className="text-[10px] font-bold text-primary-600 flex items-center gap-1">
                              Issued by Doctor
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                         <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-200">
                           {rx.status}
                         </span>
                         <button 
                           onClick={() => setSelectedRx(rx)}
                           className="bg-white text-slate-800 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 hover:border-primary-500 shadow-sm transition-all flex items-center gap-2"
                         >
                            <Search className="w-3.5 h-3.5" /> Details
                         </button>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Dispensing Panel */}
        <div className="xl:col-span-1">
          {selectedRx ? (
            <div className="bg-white rounded-[2rem] p-8 border border-primary-100 shadow-xl shadow-primary-500/5 sticky top-8 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black text-slate-800">Dispense Drugs</h4>
                <button onClick={() => setSelectedRx(null)} className="p-2 text-slate-400 hover:text-slate-600">
                   <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                  <p className="font-bold text-slate-800">{selectedRx.patient?.first_name} {selectedRx.patient?.last_name}</p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Prescribed Items</p>
                  <div className="space-y-2">
                    {/* Items are expected to be in prescription_items but here we might have a simple structure if types are not perfectly synced */}
                    {selectedRx.items && selectedRx.items.map((item, i) => (
                      <div key={i} className="bg-white border border-slate-100 p-3 rounded-xl flex items-start gap-3 shadow-sm">
                        <CornerDownRight className="w-3.5 h-3.5 text-slate-300 mt-1" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.medicine_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.dosage} • {item.frequency} • {item.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                disabled={isDispensing}
                onClick={() => handleDispense(selectedRx.id)}
                className="w-full bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3 hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                {isDispensing ? <Activity className="w-5 h-5 animate-pulse" /> : <Truck className="w-5 h-5" />}
                Mark as Dispensed
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
                This will automatically update inventory stock
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Box className="w-12 h-12 text-slate-200" />
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-2">Inventory Sync</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select a prescription to proceed with dispensing workflow</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
