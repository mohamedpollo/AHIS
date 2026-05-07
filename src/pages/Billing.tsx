import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { cn } from '../lib/utils';
import { Search, Plus, CreditCard, DollarSign, Download, CheckCircle2, AlertCircle, X, TrendingUp, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Billing as BillType } from '../types';

export default function Billing() {
  const { billing: bills, patients, addBill, updateBill, refreshData } = useData();
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvoicing, setIsInvoicing] = useState(false);
  const [newBill, setNewBill] = useState({
    patientId: '',
    amount: 0,
    currency: 'ETB',
    type: 'registration' as const,
    description: 'Manual Invoice'
  });

  const [processingBillId, setProcessingBillId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash'|'card'|'insurance'>('cash');
  
  const [viewingBill, setViewingBill] = useState<BillType | null>(null);

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown Patient';
  };

  const filteredBills = bills.filter(b => 
    getPatientName(b.patient_id).toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = bills.filter(b => b.status === 'unpaid').reduce((acc, b) => acc + b.amount, 0);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addBill({
        patient_id: newBill.patientId,
        amount: newBill.amount,
        currency: newBill.currency,
        billing_type: newBill.type,
        description: newBill.description,
        status: 'unpaid'
      });
      await refreshData();
      setIsInvoicing(false);
      setNewBill({ patientId: '', amount: 0, currency: 'ETB', type: 'registration', description: 'Manual Invoice' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentProcessing = (id: string, amount: number) => {
    setProcessingBillId(id);
    setPaymentAmount(amount);
  };

  const confirmPayment = async () => {
    if (processingBillId) {
      setIsSubmitting(true);
      try {
        await updateBill(processingBillId, { 
          status: 'paid',
          updated_at: new Date().toISOString()
        });
        await refreshData();
        setProcessingBillId(null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full pb-12 relative px-2 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 mt-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Financial Ledger</h2>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Billing & Revenue Management</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Outstanding</p>
              <p className="text-xl font-black text-rose-600 font-mono tracking-tighter uppercase">{totalOutstanding.toLocaleString()} ETB</p>
           </div>
           <button 
             onClick={() => setIsInvoicing(true)}
             className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
           >
             <Plus className="w-5 h-5" /> Generate Invoice
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by patient name or invoice ID #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200/80 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 focus:outline-none transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Billing ID</th>
                    <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Patient Candidate</th>
                    <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest">Issued Date</th>
                    <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Amount</th>
                    <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Status</th>
                    <th className="px-8 py-6 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBills.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-7 font-black text-slate-400 font-mono text-[11px] tracking-widest group-hover:text-primary-600">#{b.id.slice(0, 8)}</td>
                      <td className="px-8 py-7">
                         <p className="font-black text-slate-800 uppercase tracking-tight leading-none truncate mb-1">{getPatientName(b.patient_id)}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]" title={b.description}>{b.description || b.billing_type}</p>
                      </td>
                      <td className="px-8 py-7">
                         <p className="font-bold text-slate-500 uppercase text-[11px] font-mono tracking-tighter">{new Date(b.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-7 text-right">
                         <p className="font-black text-slate-900 font-mono text-base tracking-tighter">
                           {b.amount.toFixed(2)} <span className="text-[10px] text-slate-400 uppercase font-bold">{b.currency}</span>
                         </p>
                      </td>
                      <td className="px-8 py-7 text-center">
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm inline-flex items-center gap-2",
                          b.status === 'paid' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"
                        )}>
                          {b.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {b.status}
                        </span>
                      </td>
                      <td className="px-8 py-7 text-center">
                         <div className="flex items-center gap-2">
                           <button 
                             onClick={() => setViewingBill(b)}
                             className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary-600 hover:text-white transition-all active:scale-95"
                             title="View Details"
                           >
                             <FileText className="w-4 h-4" />
                           </button>
                           {b.status === 'unpaid' && (
                             <button 
                               onClick={() => openPaymentProcessing(b.id, b.amount)}
                               className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                               title="Receive Payment"
                             >
                               <DollarSign className="w-4 h-4" />
                             </button>
                           )}
                           <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary-600 hover:text-white transition-all active:scale-95" title="Download">
                              <Download className="w-4 h-4" />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/10">
              <CreditCard className="w-10 h-10 text-emerald-500 mb-6" />
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Payment Gateways</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10 leading-relaxed italic">Synchronized transaction processing for insurance & direct patient billing.</p>
              
              <div className="space-y-4 pt-6 border-t border-slate-800">
                 <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Insurance</span>
                    <span className="text-xs font-black text-white uppercase tracking-tight tracking-widest">14 Providers</span>
                 </div>
                 <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-widest text-center">Daily Collection Efficiency</p>
                    <div className="flex items-center justify-center gap-4">
                       <span className="text-3xl font-black text-white font-mono leading-none">92%</span>
                       <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h4>
              <div className="space-y-4">
                 {bills.slice(0, 3).map(b => (
                   <div key={b.id} className="flex items-center justify-between gap-4 p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="min-w-0">
                         <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">{getPatientName(b.patient_id)}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{b.status === 'paid' ? 'Payment Verified' : 'Awaiting Funds'}</p>
                      </div>
                      <p className={cn("text-xs font-black font-mono", b.status === 'paid' ? 'text-emerald-600' : 'text-rose-600')}>
                         {b.amount.toFixed(0)}
                      </p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoicing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">New Patient Invoice</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hospital Revenue Unit</p>
              </div>
              <button 
                onClick={() => setIsInvoicing(false)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleIssue} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Candidate</label>
                <select 
                  required
                  value={newBill.patientId}
                  onChange={e => setNewBill({...newBill, patientId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.id.slice(0, 8)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bill Type</label>
                <select 
                  required
                  value={newBill.type}
                  onChange={e => setNewBill({...newBill, type: e.target.value as any})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                >
                  <option value="registration">Registration Fee</option>
                  <option value="consultation">Consultation Fee</option>
                  <option value="lab">Laboratory Analysis</option>
                  <option value="pharmacy">Pharmacy Dispensing</option>
                  <option value="other">General Service / Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Invoice Amount (ETB)</label>
                <input 
                  type="number"
                  required
                  placeholder="0.00"
                  value={newBill.amount}
                  onChange={e => setNewBill({...newBill, amount: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsInvoicing(false)}
                  className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      <AnimatePresence>
        {processingBillId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProcessingBillId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl shadow-black/30 border border-slate-100"
            >
              <button 
                 onClick={() => setProcessingBillId(null)}
                 disabled={isSubmitting}
                 className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                 <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner mx-auto">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight text-center">Process Payment</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 text-center mb-8">Ref: #{processingBillId.substring(0, 8)}</p>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Due</p>
                 <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">
                   {paymentAmount.toFixed(2)} <span className="text-sm text-slate-400">ETB</span>
                 </p>
              </div>

              <div className="space-y-4 mb-8">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payment Method</label>
                 <div className="grid grid-cols-3 gap-2">
                   {(['cash', 'card', 'insurance'] as const).map(method => (
                     <button
                       key={method}
                       onClick={() => setPaymentMethod(method)}
                       className={cn(
                         "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                         paymentMethod === method 
                           ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20" 
                           : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                       )}
                     >
                       {method}
                     </button>
                   ))}
                 </div>
              </div>

              <button 
                onClick={confirmPayment}
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-emerald-600 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Bill Details Modal */}
      <AnimatePresence>
        {viewingBill && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingBill(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl shadow-black/30 border border-slate-100"
            >
              <button 
                 onClick={() => setViewingBill(null)}
                 className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                 <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight text-center">Invoice Summary</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 text-center mb-8">Ref: #{viewingBill.id.substring(0, 10).toUpperCase()}</p>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                    <span className="text-sm font-black text-slate-800 text-right max-w-[200px] leading-tight">
                      {viewingBill.description || viewingBill.billing_type.toUpperCase()}
                    </span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</span>
                    <span className="text-sm font-black text-slate-800 tracking-tight uppercase">
                      {getPatientName(viewingBill.patient_id)}
                    </span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                      viewingBill.status === 'paid' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-rose-100 text-rose-800 border-rose-200"
                    )}>
                      {viewingBill.status}
                    </span>
                 </div>
                 <div className="flex justify-between items-center pb-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                      {viewingBill.amount.toFixed(2)} <span className="text-sm text-slate-400">{viewingBill.currency}</span>
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewingBill(null)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Close
                </button>
                {viewingBill.status === 'unpaid' && (
                  <button 
                    onClick={() => {
                      setViewingBill(null);
                      openPaymentProcessing(viewingBill.id, viewingBill.amount);
                    }}
                    className="flex-1 px-6 py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    Receive Payment
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
