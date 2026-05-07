import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import DoctorDashboard from '../components/dashboards/DoctorDashboard';
import ReceptionistDashboard from '../components/dashboards/ReceptionistDashboard';
import PharmacistDashboard from '../components/dashboards/PharmacistDashboard';
import LaboratorianDashboard from '../components/dashboards/LaboratorianDashboard';
import NurseDashboard from '../components/dashboards/NurseDashboard';

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="font-bold uppercase tracking-widest text-[10px]">Synchronizing Records...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-6 animate-in fade-in duration-500 px-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center shadow-inner">
          <Shield className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity Record Missing</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            You have authenticated successfully, but we couldn't find your professional profile in the HMS registry. 
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
          <p className="text-xs text-amber-700 font-medium leading-relaxed italic">
            <strong>Hint for student:</strong> This usually happens because "Sign Up" failed to create your profile record due to database permissions (RLS). Please follow the instructions in the chat to fix your SQL policies.
          </p>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nexus System Status: Profile Sync Required</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back, {profile.full_name}</h1>
        <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
          Signed in to your workspace as:
          <span className="font-bold text-xs bg-primary-50 text-blue-700 px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">
            {profile.role}
          </span>
        </p>
      </div>

      {profile.role === 'admin' && <AdminDashboard />}
      {profile.role === 'doctor' && <DoctorDashboard />}
      {profile.role === 'receptionist' && <ReceptionistDashboard />}
      {profile.role === 'pharmacist' && <PharmacistDashboard />}
      {profile.role === 'lab-tech' && <LaboratorianDashboard />}
      {profile.role === 'nurse' && <NurseDashboard />}
    </div>
  );
}
