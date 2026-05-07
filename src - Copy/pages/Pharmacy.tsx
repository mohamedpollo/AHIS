import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { cn } from '../lib/utils';
import { Search, Plus, Package, AlertCircle, ShoppingCart, X, Pill, CheckCircle2, Loader2 } from 'lucide-react';

export default function Pharmacy() {
  const { medicines, updateMedicine, prescriptions, updatePrescription, patients, profiles, addBill, refreshData } = useData();
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'prescriptions'>('inventory');

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown Patient';
  };

  const getDoctorName = (id: string) => {
    const d = profiles.find(doc => doc.id === id);
    return d ? d.full_name : 'Unknown Doctor';
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    getPatientName(p.patient_id).toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleRestock = async (id: string, amount: number = 100) => {
    const med = medicines.find(m => m.id === id);
    if (med) {
      setIsSubmitting(true);
      try {
        await updateMedicine(id, { stock_quantity: med.stock_quantity + amount });
        await refreshData();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDispense = async (prescriptionId: string) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      setIsSubmitting(true);
      try {
        let totalCost = 0;
        // In a real system, we'd loop through prescription items and deduct stock
        // For this demo/refactor, we update the status and emit a bill
        await updatePrescription(prescriptionId, { 
          status: 'dispensed',
          updated_at: new Date().toISOString()
        });
        
        // Generate a sample bill for the pharmacy items (e.g., fixed ETB per prescription for now)
        await addBill({
          patient_id: prescription.patient_id,
          amount: 450, // Sample total
          currency: 'ETB',
          status: 'unpaid',
          billing_type: 'pharmacy',
          description: `Pharmacy Prescription Dispensed #${prescriptionId.slice(0, 8)}`
        });

        await refreshData();
        alert("Prescription dispensed and billing generated.");
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full pb-12 relative px-2 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4 mt-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Pharmacy <span className="text-primary-600">Operations</span></h2>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Medical Stock & Dispensing Unit</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> New Item Entry
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200">
        <button 
          className={cn("pb-4 text-xs font-black uppercase tracking-widest relative transition-colors", activeTab === 'inventory' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600')}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
          {activeTab === 'inventory' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 rounded-t-full"></span>}
        </button>
        <button 
           className={cn("pb-4 text-xs font-black uppercase tracking-widest relative transition-colors flex items-center gap-2", activeTab === 'prescriptions' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600')}
           onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions
          {prescriptions.some(p => p.status === 'pending') && (
             <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">
                {prescriptions.filter(p => p.status === 'pending').length}
             </span>
          )}
          {activeTab === 'prescriptions' && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 rounded-t-full"></span>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder={activeTab === 'inventory' ? "Search by medicine name, category..." : "Search prescriptions by patient name or ID..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200/80 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 focus:outline-none transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {activeTab === 'inventory' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Scientific Name</th>
                      <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Category</th>
                      <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">In Stock</th>
                      <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Price (ETB)</th>
                      <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMedicines.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs uppercase group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                              {m.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-base tracking-tight">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">#{m.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7 font-bold text-slate-500 uppercase text-[11px] tracking-tight">{m.category}</td>
                        <td className="px-8 py-7 text-center">
                          <p className="font-black text-slate-800 text-base">{m.stock_quantity} <span className="text-[10px] text-slate-400 uppercase tracking-widest">{m.unit}</span></p>
                        </td>
                        <td className="px-8 py-7 text-right font-black text-slate-900 font-mono text-lg tracking-tighter">
                          {m.unit_price.toFixed(2)}
                        </td>
                        <td className="px-8 py-7 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            m.stock_quantity > 50 ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200 animate-pulse"
                          )}>
                            {m.stock_quantity > 50 ? 'In Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
               <div className="divide-y divide-slate-100">
                  {filteredPrescriptions.map(p => (
                    <div key={p.id} className="p-8 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                             <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{getPatientName(p.patient_id)}</h4>
                             <span className={cn(
                               "px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                               p.status === 'dispensed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                             )}>
                               {p.status}
                             </span>
                           </div>
                           <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <span className="font-mono text-slate-400">#{p.id.slice(0,8)}</span>
                             <span>&bull;</span>
                             <span>Dr. {getDoctorName(p.doctor_id)}</span>
                             <span>&bull;</span>
                             <span>{new Date(p.created_at).toLocaleDateString()}</span>
                           </p>
                        </div>
                        {p.status === 'pending' && (
                          <button 
                            disabled={isSubmitting}
                            onClick={() => handleDispense(p.id)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Dispense Order
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prescription Status</h5>
                        <p className="text-sm font-bold text-slate-700 italic">Verify patient ID against physical prescription before dispensing.</p>
                      </div>
                    </div>
                  ))}
                  {filteredPrescriptions.length === 0 && (
                     <div className="p-12 text-center text-slate-500 font-medium font-bold uppercase tracking-widest text-xs">
                        No prescriptions detected in registry.
                     </div>
                  )}
               </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <Package className="w-10 h-10 text-primary-500 mb-6" />
            <h3 className="text-xl font-black mb-2 leading-tight uppercase tracking-tight">Stock Analytics</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8 leading-relaxed italic">Daily overview of medicinal logistics and pharmaceutical supplies.</p>
            
            <div className="space-y-4 pt-6 border-t border-slate-800">
               <div className="flex justify-between items-center">
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pending Rx</span>
                 <span className="text-xl font-black font-mono tracking-tighter text-amber-400">
                    {prescriptions.filter(p => p.status === 'pending').length}
                 </span>
               </div>
               <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Stock</span>
                 <span className="text-sm font-black font-mono tracking-tighter text-white">Verified</span>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Critical Warnings
            </h4>
            <div className="space-y-4">
               {medicines.filter(m => m.stock_quantity < 50).map(m => (
                 <div key={m.id} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between gap-4">
                   <div className="min-w-0">
                     <p className="text-xs font-black text-rose-800 truncate uppercase tracking-tight">{m.name}</p>
                     <p className="text-[9px] text-rose-400 font-bold uppercase">{m.stock_quantity} {m.unit} Remaining</p>
                   </div>
                   <button 
                     onClick={() => handleRestock(m.id)}
                     disabled={isSubmitting}
                     className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50"
                   >
                     Restock
                   </button>
                 </div>
               ))}
               {medicines.filter(m => m.stock_quantity < 50).length === 0 && (
                 <p className="text-xs text-slate-500 italic font-bold uppercase tracking-widest text-[10px]">No low stock warnings.</p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
