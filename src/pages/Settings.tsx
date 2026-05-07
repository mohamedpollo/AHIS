import React from 'react';
import { User, Bell, Shield, Palette, Globe, HelpCircle, ChevronRight, LogOut, Database, RefreshCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Settings() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetDevConfig = () => {
    if (confirm('Are you sure you want to clear your local Supabase configuration? This will reload the page and switch back to default/mock data.')) {
      localStorage.removeItem('VITE_SUPABASE_URL');
      localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
      window.location.reload();
    }
  };

  const isConfigLocal = !!localStorage.getItem('VITE_SUPABASE_URL');
  const configured = isSupabaseConfigured();

  const sections = [
    { title: 'Personal Profile', sub: 'Manage identity & professional credentials', icon: User, color: 'text-primary-600' },
    { title: 'System Notifications', sub: 'Configure alert triggers & communication paths', icon: Bell, color: 'text-amber-600' },
    { title: 'Security & Access', sub: 'Authentication controls & role permissions', icon: Shield, color: 'text-rose-600' },
    { title: 'Interface Theme', sub: 'Visual preferences & localized dashboard styling', icon: Palette, color: 'text-indigo-600' },
    { title: 'Regional Standards', sub: 'Language, timezone & metric parameters', icon: Globe, color: 'text-emerald-600' },
    { title: 'Technical Support', sub: 'Help center & system documentation logs', icon: HelpCircle, color: 'text-slate-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="flex items-center gap-8 mb-16 pb-12 border-b border-slate-100">
         <div className="w-24 h-24 bg-primary-600 text-white flex items-center justify-center text-4xl font-black rounded-[2.5rem] shadow-2xl shadow-primary-500/30 uppercase ring-8 ring-primary-50">
           {user?.name.charAt(0)}
         </div>
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">{user?.name}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
               Professional Registry: <span className="text-primary-600 not-italic">{profile?.role} Department</span>
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
         {sections.map((item, i) => (
           <button key={i} className="flex items-start gap-5 p-6 bg-white border border-slate-100 rounded-[2rem] text-left hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-100 shrink-0 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                 <h4 className="font-black text-slate-900 uppercase tracking-tight mb-1">{item.title}</h4>
                 <p className="text-xs text-slate-500 font-semibold leading-relaxed leading-tight">{item.sub}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 self-center group-hover:text-primary-500 transition-colors" />
           </button>
         ))}
      </div>

       <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left flex items-center gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nexus AHIS v1.2.4</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight italic">
                {configured ? (isConfigLocal ? 'Live Database (Local Config)' : 'Live Database (Environment)') : 'Frontend Prototype Mode • Mock Registry Active'}
              </p>
            </div>
            {isConfigLocal && (
              <button 
                onClick={handleResetDevConfig}
                className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors group"
                title="Reset local DB config"
              >
                <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="px-10 py-4 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-rose-100 hover:bg-rose-100 hover:text-rose-700 transition-all flex items-center gap-3 shadow-sm hover:shadow-lg shadow-rose-500/10 active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
       </div>
    </div>
  );
}
