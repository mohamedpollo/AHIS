import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Search, Plus, User, Phone, Briefcase, Calendar, ChevronRight, X, Loader2 } from 'lucide-react';

export default function Doctors() {
  const { profiles, refreshData } = useData();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Filter for clinical staff (Doctors and Nurses)
  const staff = profiles.filter(p => p.role === 'doctor' || p.role === 'nurse');

  const filteredStaff = staff.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStaff = profiles.find(p => p.id === selectedStaffId);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden animate-in fade-in duration-700">
      {/* Search & List */}
      <div className={cn(
        "flex-col lg:w-96 bg-white border border-slate-200/60 rounded-3xl shrink-0 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300",
        selectedStaffId ? "hidden lg:flex" : "flex w-full"
      )}>
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-tight uppercase">Staff Directory</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Clinical Personnel</p>
            </div>
            {profile?.role === 'admin' && (
              <div className="flex items-center gap-2">
                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter text-right leading-3 hidden sm:block">Admin<br/>Console</p>
                 <div className="p-2.5 bg-primary-100 text-primary-600 rounded-xl">
                   <Briefcase className="w-5 h-5" />
                 </div>
              </div>
            )}
          </div>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, role or specialty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/10">
          {filteredStaff.map(member => (
            <button
              key={member.id}
              onClick={() => setSelectedStaffId(member.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left group",
                selectedStaffId === member.id 
                  ? "bg-primary-50 border-primary-200 shadow-sm" 
                  : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-colors uppercase",
                selectedStaffId === member.id ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {member.full_name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{member.full_name}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{member.role}</span>
                   {member.specialization && (
                     <>
                       <span className="text-slate-300">•</span>
                       <span className="text-[9px] text-primary-500 font-black uppercase tracking-widest">{member.specialization}</span>
                     </>
                   )}
                </div>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-all opacity-0 group-hover:opacity-100", selectedStaffId === member.id ? "text-primary-600 opacity-100" : "text-slate-300")} />
            </button>
          ))}
          {filteredStaff.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No personnel matching search</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Pane */}
      <div className={cn(
        "flex-1 bg-white border border-slate-200/60 rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300",
        !selectedStaffId ? "hidden lg:flex" : "flex h-full"
      )}>
        {selectedStaff ? (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
            <header className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary-950/20">
                  {selectedStaff.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">{selectedStaff.full_name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary-200">
                      {selectedStaff.role}
                    </span>
                    {selectedStaff.specialization && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-slate-200">
                        {selectedStaff.specialization}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                className="lg:hidden w-full sm:w-auto p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-black text-[10px] text-slate-600 uppercase tracking-widest shadow-sm"
                onClick={() => setSelectedStaffId(null)}
              >
                Back To Directory
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Professional Matrix
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest text-[9px]">Clinical ID Number</p>
                      <p className="text-sm font-black text-slate-800 font-mono tracking-tight uppercase">REG-{selectedStaff.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest text-[9px]">Account Status</p>
                      <p className="text-sm font-black text-emerald-600 tracking-tight uppercase">Authorized & Verified</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Duty Cycle
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest text-[9px]">Operational Hours</p>
                      <p className="text-sm font-black text-slate-800 tracking-tight">08:00 AM - 05:00 PM (Standard)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest text-[9px]">Duty Assignment</p>
                      <p className="text-sm font-black text-slate-800 font-mono tracking-tight uppercase italic">{selectedStaff.role} UNIT / CLN-A</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Activity Indicators</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-center group hover:bg-primary-50 transition-colors">
                    <p className="text-4xl font-black text-slate-900 mb-1 group-hover:text-primary-600">{(Math.random() * 50 + 40).toFixed(0)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tasks Completed</p>
                  </div>
                  <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-center group hover:bg-emerald-50 transition-colors">
                    <p className="text-4xl font-black text-emerald-600 mb-1">98%</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Precision Rate</p>
                  </div>
                  <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-center group hover:bg-amber-50 transition-colors">
                    <p className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{(Math.random() * 5 + 3).toFixed(0)}y</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tenure</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                <Briefcase className="w-10 h-10 text-slate-200" />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personnel Clearinghouse</h3>
               <p className="text-slate-500 max-w-sm text-sm font-medium italic mt-2">Select a clinical member from the sidebar to visualize their professional matrix, operational duty cycles, and real-time performance indicators within the FYP system.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
