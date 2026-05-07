import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  Microscope, Beaker, Clock, CheckCircle, 
  Search, Filter, FlaskConical, FileText, 
  Activity, AlertCircle, Save, User, X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { LabTest } from '../../types';

export default function LaboratorianDashboard() {
  const { profile } = useAuth();
  const { labTests, updateLabTest, refreshData } = useData();
  
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [testResult, setTestResult] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Stats
  const pendingCount = labTests.filter(t => t.status === 'pending').length;
  const processingCount = labTests.filter(t => t.status === 'processing').length;
  const completedToday = labTests.filter(t => 
    t.status === 'completed' && 
    new Date(t.updated_at).toDateString() === new Date().toDateString()
  ).length;

  const handleUpdateStatus = async (id: string, status: 'processing' | 'completed', result?: string) => {
    setIsSaving(true);
    try {
      await updateLabTest(id, { 
        status, 
        result_summary: result,
        updated_at: new Date().toISOString()
      });
      if (status === 'completed') {
        setSelectedTest(null);
        setTestResult('');
      }
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Queue</p>
            <p className="text-3xl font-black text-slate-800">{pendingCount}</p>
            <p className="text-xs font-bold text-amber-500 mt-1">Pending Collection</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Testing</p>
            <p className="text-3xl font-black text-slate-800">{processingCount}</p>
            <p className="text-xs font-bold text-blue-500 mt-1">In Laboratory</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Success</p>
            <p className="text-3xl font-black text-slate-800">{completedToday}</p>
            <p className="text-xs font-bold text-emerald-500 mt-1">Completed Today</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Lab Orders List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm min-h-[500px]">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Microscope className="w-6 h-6 text-primary-500" />
                  Active Laboratory Orders
                </h3>
             </div>

             <div className="space-y-4">
                {labTests.filter(t => t.status !== 'completed').length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                      <Beaker className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active laboratory requests</p>
                  </div>
                ) : (
                  labTests.filter(t => t.status !== 'completed').map(test => (
                    <div 
                      key={test.id}
                      className={cn(
                        "p-5 rounded-2xl border transition-all flex items-center justify-between gap-6 group",
                        selectedTest?.id === test.id ? "bg-primary-50 border-primary-200" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-white",
                          test.status === 'processing' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {test.test_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 mb-0.5">{test.test_name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 border-r border-slate-200 pr-3 uppercase tracking-widest">
                              ID: {test.id.slice(0, 8)}
                            </span>
                            <span className="text-[10px] font-bold text-primary-600 flex items-center gap-1">
                              <User className="w-3 h-3" /> {test.patient?.first_name} {test.patient?.last_name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                         <span className={cn(
                           "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                           test.status === 'processing' ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-amber-100 text-amber-700 border-amber-200"
                         )}>
                           {test.status}
                         </span>
                         
                         {test.status === 'pending' ? (
                           <button 
                             onClick={() => handleUpdateStatus(test.id, 'processing')}
                             className="bg-white text-slate-800 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 hover:border-primary-500 shadow-sm transition-all"
                           >
                              Collect Sample
                           </button>
                         ) : (
                           <button 
                             onClick={() => setSelectedTest(test)}
                             className="bg-primary-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2"
                           >
                              <FlaskConical className="w-3.5 h-3.5" /> Result Entry
                           </button>
                         )}
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Result Processing Panel */}
        <div className="xl:col-span-1">
          {selectedTest ? (
            <div className="bg-white rounded-[2rem] p-8 border border-primary-100 shadow-xl shadow-primary-500/5 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black text-slate-800">Process Results</h4>
                <button onClick={() => setSelectedTest(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Test Name</p>
                <p className="font-bold text-slate-800">{selectedTest.test_name}</p>
                <p className="text-xs font-bold text-primary-600 mt-2">{selectedTest.patient?.first_name} {selectedTest.patient?.last_name}</p>
              </div>

              <div className="space-y-4 mb-8">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Result Findings / Data</label>
                 <textarea 
                   rows={8}
                   value={testResult}
                   onChange={e => setTestResult(e.target.value)}
                   placeholder="Enter laboratory observations, measurements, and conclusions..."
                   className="w-full bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary-500/10 transition-all outline-none resize-none"
                 />
              </div>

              <button 
                disabled={!testResult || isSaving}
                onClick={() => handleUpdateStatus(selectedTest.id, 'completed', testResult)}
                className="w-full bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/25 flex items-center justify-center gap-3 hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                {isSaving ? <Activity className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
                Finalize & Release Result
              </button>
            </div>
          ) : (
            <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center h-full flex flex-col items-center justify-center">
              <Beaker className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select a 'Processing' test<br/>to enter results</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
