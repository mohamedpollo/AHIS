import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/Login.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Docs from './pages/Docs.tsx';
import Patients from './pages/Patients.tsx';
import Appointments from './pages/Appointments.tsx';
import Doctors from './pages/Doctors.tsx';
import Pharmacy from './pages/Pharmacy.tsx';
import Laboratory from './pages/Laboratory.tsx';
import Billing from './pages/Billing.tsx';
import Reports from './pages/Reports.tsx';
import Settings from './pages/Settings.tsx';
import SupabaseSetupModal from './components/SupabaseSetupModal';

// --- PROTECTED ROUTE ---
function RequireAuth({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, profile, loading, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile && roles && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// --- APP COMPONENT ---
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SupabaseSetupModal />
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/docs" element={<RequireAuth roles={['admin']}><Docs /></RequireAuth>} />
              <Route path="/patients" element={<RequireAuth roles={['admin', 'doctor', 'receptionist', 'pharmacist', 'lab-tech', 'nurse']}><Patients /></RequireAuth>} />
              <Route path="/appointments" element={<RequireAuth roles={['admin', 'doctor', 'receptionist', 'nurse']}><Appointments /></RequireAuth>} />
              <Route path="/doctors" element={<RequireAuth roles={['admin', 'receptionist', 'doctor']}><Doctors /></RequireAuth>} />
              <Route path="/pharmacy" element={<RequireAuth roles={['admin', 'pharmacist']}><Pharmacy /></RequireAuth>} />
              <Route path="/laboratory" element={<RequireAuth roles={['admin', 'lab-tech']}><Laboratory /></RequireAuth>} />
              <Route path="/billing" element={<RequireAuth roles={['admin', 'receptionist']}><Billing /></RequireAuth>} />
              <Route path="/reports" element={<RequireAuth roles={['admin']}><Reports /></RequireAuth>} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
