import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { Database, Key, Check, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupabaseSetupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check if configured. If not, show modal.
    if (!isSupabaseConfigured()) {
      const timer = setTimeout(() => setIsOpen(true), 1500); // Small delay for UX
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) return;

    localStorage.setItem('VITE_SUPABASE_URL', url.trim());
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
    
    setSaveSuccess(true);
    setTimeout(() => {
      window.location.reload(); // Reload to apply new client settings
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
        >
          <div className="p-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Database className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Connect Your Database</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              To move away from mock data and use your live Supabase database, please provide your connection details below.
            </p>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Supabase Project URL</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Database className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="https://xyz.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Anon Public Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl text-sm font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saveSuccess}
                  className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                    saveSuccess ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Connected Successfully
                    </>
                  ) : (
                    <>Connect Live Database</>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
              >
                Continue with Mock Data
              </button>
            </form>
          </div>

          <div className="bg-slate-50 p-6 flex items-start gap-4 border-t border-slate-100">
            <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Privacy Note</p>
              <p className="text-[10px] text-slate-400 leading-normal">
                Keys are stored locally in your browser. For production deployment, use environment variables.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
