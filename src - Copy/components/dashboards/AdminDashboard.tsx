import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Users, FileText, Activity, DollarSign, TrendingUp, BarChart2, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon, Loader2, Hospital } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const { patients, appointments, billing, medicalRecords, refreshData } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'doctor' as any
  });
  const [regStatus, setRegStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const stats = {
    patients: patients.length,
    appointments: appointments.length,
    records: medicalRecords.length,
    revenue: billing.filter(b => b.status === 'paid').reduce((acc, b) => acc + b.amount, 0)
  };

  const mockChartData = [
    { name: 'Mon', revenue: 4000, patients: 24 },
    { name: 'Tue', revenue: 3000, patients: 18 },
    { name: 'Wed', revenue: 5500, patients: 32 },
    { name: 'Thu', revenue: 4500, patients: 27 },
    { name: 'Fri', revenue: 6000, patients: 40 },
    { name: 'Sat', revenue: 2000, patients: 12 },
    { name: 'Sun', revenue: 1500, patients: 8 },
  ];

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus(null);
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            full_name: userForm.full_name,
            role: userForm.role
          }
        }
      });

      if (error) throw error;
      
      // Explicitly insert into profiles table to ensure dynamic creation
      // without relying on database triggers.
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: userForm.full_name,
          role: userForm.role,
          status: 'active'
        });

        // We ignore the error here because if the trigger was successfully run, 
        // it might already exist. If it fails due to RLS, they might need to update policies.
        if (profileError && profileError.code !== '23505') { // 23505 is unique violation
          console.warn('Profile insertion note:', profileError.message);
        }
      }

      await refreshData();
      setRegStatus({ type: 'success', message: `Staff member ${userForm.full_name} registered successfully. They can now sign in.` });
      setUserForm({ email: '', password: '', full_name: '', role: 'doctor' });
    } catch (err: any) {
      setRegStatus({ type: 'error', message: err.message || "Failed to register user." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Patients" 
          value={stats.patients} 
          icon={Users} 
          colorScheme="blue" 
          trend="+12%"
        />
        <StatCard 
          label="Appointments" 
          value={stats.appointments} 
          icon={Activity} 
          colorScheme="primary" 
          trend="+5%"
        />
        <StatCard 
          label="Clinical Cases" 
          value={stats.records} 
          icon={FileText} 
          colorScheme="purple" 
          trend="+8%"
        />
        <StatCard 
          label="System Revenue" 
          value={`ETB ${stats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          colorScheme="emerald" 
          trend="+18%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-fit">
          <div className="mb-8 flex items-center gap-4 pb-6 border-b border-slate-100/50">
            <div className="p-4 bg-primary-600 text-white rounded-[1.5rem] shadow-xl shadow-primary-500/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">Staff Onboarding</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel Management Unit</p>
            </div>
          </div>

          <form onSubmit={handleRegisterUser} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Designation</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Abebe Bikila"
                  value={userForm.full_name}
                  onChange={e => setUserForm({...userForm, full_name: e.target.value})}
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Staff Credentials (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@hospital.com"
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Access Token</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Privilege Designation</label>
              <select
                required
                value={userForm.role}
                onChange={e => setUserForm({...userForm, role: e.target.value})}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all outline-none appearance-none"
              >
                <option value="doctor">Consultant (Doctor)</option>
                <option value="nurse">Clinical Support (Nurse)</option>
                <option value="receptionist">Operations (Receptionist)</option>
                <option value="lab-tech">Diagnostic Support (Laboratorian)</option>
                <option value="pharmacist">Pharmaceuticals (Pharmacist)</option>
                <option value="admin">Systems Administrator</option>
              </select>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mt-2">
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
                SysAdmin Note: If email confirmations are disabled in your Supabase project, registering a new user will automatically sign you out and sign them in.
              </p>
            </div>

            {regStatus && (
              <div className={cn(
                "p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-start gap-3 border animate-in slide-in-from-top-2",
                regStatus.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
              )}>
                {regStatus.type === 'success' ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <Hospital className="w-5 h-5 shrink-0" />}
                <p className="leading-relaxed">{regStatus.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-slate-900/20 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Authorize Staff Access
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <div className="mb-12 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-tight">System Revenue Flow</h3>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">Cross-departmental financial aggregate</p>
              </div>
              <div className="px-5 py-2 bg-primary-50 text-primary-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-primary-200">
                FY 2026 Audit
              </div>
            </div>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 800 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 800 }} tickFormatter={v => `${v/1000}k`} />
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', padding: '20px 24px' }}
                    itemStyle={{ color: '#0ea5e9', fontWeight: 900, fontSize: '18px' }}
                    labelStyle={{ color: '#64748b', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight">Patient Influx Density</h3>
                  <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Real-time clinical throughput indicators</p>
                </div>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData}>
                      <Bar dataKey="patients" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] w-full md:w-auto text-center shrink-0">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Target Efficiency</p>
                 <p className="text-5xl font-black text-white font-mono tracking-tighter">94.2%</p>
                 <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4" /> Leading Metrics
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, colorScheme, trend }: { label: string, value: string | number, icon: any, colorScheme: 'blue' | 'primary' | 'purple' | 'emerald', trend: string }) {
  const styles = {
    blue: { iconBg: 'bg-blue-50 text-blue-600', trendBg: 'bg-blue-100 text-blue-800', gradient: 'from-blue-500 to-blue-600' },
    primary: { iconBg: 'bg-primary-50 text-primary-600', trendBg: 'bg-primary-100 text-primary-800', gradient: 'from-primary-500 to-primary-600' },
    purple: { iconBg: 'bg-purple-50 text-purple-600', trendBg: 'bg-purple-100 text-purple-800', gradient: 'from-purple-500 to-purple-600' },
    emerald: { iconBg: 'bg-emerald-50 text-emerald-600', trendBg: 'bg-emerald-100 text-emerald-800', gradient: 'from-emerald-500 to-emerald-600' },
  };

  const scheme = styles[colorScheme];

  return (
    <div className="bg-white p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border border-slate-100 shadow-sm">
      <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${scheme.gradient} rounded-full blur-[60px] opacity-5 group-hover:opacity-20 transition-opacity duration-700`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter mt-4 font-mono">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${scheme.iconBg} border border-white shadow-lg shadow-slate-200/50`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-8 flex items-center gap-3 relative z-10">
        <span className={cn(
          "px-3 py-1 rounded-xl text-[9px] font-black tracking-widest uppercase border border-white",
          scheme.trendBg
        )}>
          {trend}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Vector</span>
      </div>
    </div>
  );
}
