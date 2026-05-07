import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Search, Plus, TestTube, FileText, CheckCircle2, Clock, Microscope, X, Beaker, Loader2 } from 'lucide-react';

export default function Laboratory() {
  const { labTests: tests, patients, addLabTest, updateLabTest, refreshData } = useData();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isEnteringResult, setIsEnteringResult] = useState<string | null>(null);
  const [resultText, setResultText] = useState('');
  const [newRequest, setNewRequest] = useState({
    patientId: '',
    testName: '',
  });

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown Patient';
  };

  const filteredTests = tests.filter(t => 
    t.test_name.toLowerCase().includes(search.toLowerCase()) ||
    getPatientName(t.patient_id).toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      await addLabTest({
        patient_id: newRequest.patientId,
        test_name: newRequest.testName,
        requested_by: profile.id,
        status: 'pending'
      });
      await refreshData();
      setIsRequesting(false);
      setNewRequest({
        patientId: '',
        testName: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveResult = async (testId: string) => {
    setIsSubmitting(true);
    try {
      await updateLabTest(testId, {
        status: 'completed',
        result: resultText,
        updated_at: new Date().toISOString()
      });
      await refreshData();
      setIsEnteringResult(null);
      setResultText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full pb-12 relative animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4 leading-tight">
             Laboratory Information System
          </h2>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Diagnostic Services & Pathology</p>
        </div>
        <button 
          onClick={() => setIsRequesting(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 text-primary-500" /> New Lab Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search tests, patients, or physician IDs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200/80 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 focus:outline-none transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-4">
            {filteredTests.map(test => (
              <div key={test.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] group hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 relative overflow-hidden">
                {test.status === 'completed' && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>}
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors",
                      test.status === 'completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-primary-50 border-primary-100 text-primary-600"
                    )}>
                      {test.status === 'completed' ? <Microscope className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 text-xl tracking-tight leading-tight uppercase underline decoration-primary-500/30 underline-offset-4 truncate">{test.test_name}</h4>
                      <div className="flex items-center gap-3 mt-1.5 font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                        <span className="text-slate-800 truncate">{getPatientName(test.patient_id)}</span>
                        <span>•</span>
                        <span>Lab ID: {test.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Request Date</p>
                      <p className="text-sm font-black text-slate-800 font-mono tracking-tighter">{new Date(test.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                      test.status === 'completed' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                    )}>
                      {test.status}
                    </div>
                  </div>
                </div>

                {test.status === 'completed' ? (
                  <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary-500" /> Result Finding Summary
                      </p>
                      <p className="text-sm font-black text-slate-700 italic border-l-4 border-slate-200 pl-4 py-1 leading-relaxed leading-tighter">
                         "{test.result}"
                      </p>
                    </div>
                    <button className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-600/20 active:scale-95 transition-all w-full sm:w-auto">
                       Download Report
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 pt-6 border-t border-slate-50">
                    {isEnteringResult === test.id ? (
                      <div className="space-y-4">
                        <textarea
                          placeholder="Enter diagnostic findings here..."
                          value={resultText}
                          onChange={(e) => setResultText(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none min-h-[100px]"
                        />
                        <div className="flex items-center gap-3 justify-end">
                          <button
                            onClick={() => {
                              setIsEnteringResult(null);
                              setResultText('');
                            }}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleSaveResult(test.id)}
                            className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Finalize Result
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setIsEnteringResult(test.id);
                            setResultText('');
                          }}
                          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          <Beaker className="w-4 h-4 text-primary-400" /> Enter Result Findings
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/10">
              <Microscope className="w-12 h-12 text-primary-500 mb-6" />
              <h3 className="text-2xl font-black mb-2 uppercase leading-tight">Registry Analysis</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-10 italic">Secure data synchronization between diagnostic labs and physician workstations.</p>
              
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-3xl font-black text-white font-mono tracking-tighter">{tests.filter(t => t.status === 'pending').length}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Pending Tests</p>
                 </div>
                 <div>
                    <p className="text-3xl font-black text-emerald-500 font-mono tracking-tighter">{tests.filter(t => t.status === 'completed').length}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Completed Total</p>
                 </div>
              </div>
           </div>

           <div className="bg-primary-50/50 border border-primary-100 p-8 rounded-[2.5rem] space-y-6">
              <h4 className="text-[11px] font-black text-primary-700 uppercase tracking-widest flex items-center gap-2 underline decoration-primary-500/20 underline-offset-4">
                 Technician Rota
              </h4>
              <div className="space-y-4">
                 <div className="p-4 bg-white border border-primary-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] font-black uppercase">AA</div>
                       <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tighter truncate">Abdirizak Adam</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">On Duty</span>
                 </div>
                 <div className="p-4 bg-white border border-primary-100 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-black uppercase">NM</div>
                       <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tighter truncate">Nasra Mohamed</p>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded uppercase">Standby</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Lab Request Modal */}
      {isRequesting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">New Diagnostic Request</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Laboratory Intake Unit</p>
              </div>
              <button 
                onClick={() => setIsRequesting(false)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Identity</label>
                <select 
                  required
                  value={newRequest.patientId}
                  onChange={e => setNewRequest({...newRequest, patientId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                >
                  <option value="">Select Patient...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.id.slice(0, 8)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Diagnostic Test Module</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Lipid Profile, CBC, Blood Type..."
                  value={newRequest.testName}
                  onChange={e => setNewRequest({...newRequest, testName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsRequesting(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
