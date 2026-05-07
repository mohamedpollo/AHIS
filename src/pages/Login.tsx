import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Loader2, Hospital, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginAsMock, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName, 'admin');
        setMessage("Account created! Check your email for a confirmation link (if enabled) or try logging in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = () => {
    loginAsMock('admin');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-600 p-3 rounded-xl shadow-lg shadow-primary-500/20">
            <Hospital className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Nexus AHIS
        </h2>
        <div className="mt-2 flex justify-center">
          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest border ${
            configured 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {configured ? 'Production Mode • Live Cloud' : 'Preview Mode • Mock Data'}
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-200/50 sm:rounded-[2rem] sm:px-12 border border-slate-100">
          
          {configured ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <h3 className="text-xl font-black text-slate-900 tracking-tight text-center">
                {isSignUp ? 'Create System Account' : 'Institutional Access'}
              </h3>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Abdirahman Ahmed"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Identity (Email)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@institute.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Access Credential</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-2xl text-sm font-medium text-slate-900 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="text-rose-600 text-[11px] bg-rose-50 p-4 rounded-2xl font-bold border border-rose-100 flex items-start gap-3">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="mb-1 uppercase tracking-tight">Status: Rejected</p>
                    <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
                  </div>
                </div>
              )}

              {message && (
                <div className="text-emerald-600 text-[11px] bg-emerald-50 p-4 rounded-2xl font-bold border border-emerald-100 flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 flex justify-center items-center px-4 rounded-2xl text-sm font-black text-white bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all disabled:opacity-70 active:scale-[0.98] uppercase tracking-widest"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Register Account' : 'Authorize Entry')}
              </button>

              <div className="pt-4 text-center">
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline"
                >
                  {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide text-center leading-relaxed">
                  Management Console: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-1">Supabase <ExternalLink className="w-3 h-3" /></a>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-8 text-center py-4">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Welcome to Preview Mode</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  The system is currently running on mock data. You can log in instantly with the default admin profile to explore the features.
                </p>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={handleMockLogin}
                  className="group w-full h-16 flex items-center justify-between px-6 rounded-2xl text-slate-900 bg-slate-50 hover:bg-primary-600 hover:text-white transition-all border border-slate-100 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-600/20"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Entry: Admin Access</p>
                      <p className="text-[10px] opacity-60 font-bold group-hover:opacity-80">Full administrative privileges</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="pt-6">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  To connect your own database,<br />
                  use the setup prompt on initialization.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
