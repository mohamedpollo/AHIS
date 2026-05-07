import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Building, 
  Menu, 
  X, 
  Search, 
  Bell, 
  User as UserIcon, 
  Calendar,
  Stethoscope,
  Pill,
  Microscope,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  Plus
} from 'lucide-react';

export default function MainLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'receptionist', 'pharmacist', 'lab-tech', 'nurse'] },
    { name: 'Patients', path: '/patients', icon: UserIcon, roles: ['admin', 'doctor', 'receptionist', 'pharmacist', 'lab-tech', 'nurse'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'receptionist', 'nurse'] },
    { name: 'Staff', path: '/doctors', icon: Stethoscope, roles: ['admin', 'receptionist', 'doctor'] },
    { name: 'Pharmacy', path: '/pharmacy', icon: Pill, roles: ['admin', 'pharmacist'] },
    { name: 'Laboratory', path: '/laboratory', icon: Microscope, roles: ['admin', 'lab-tech'] },
    { name: 'Billing', path: '/billing', icon: CreditCard, roles: ['admin', 'receptionist'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['admin', 'doctor', 'receptionist', 'pharmacist', 'lab-tech', 'nurse'] },
    { name: 'System Docs', path: '/docs', icon: FileText, roles: ['admin'] },
  ];

  const filteredNavItems = profile?.role 
    ? navItems.filter(item => item.roles.includes(profile.role))
    : navItems.filter(item => item.name === 'Dashboard' || item.name === 'Settings' || item.name === 'System Docs');

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative font-sans">
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 bg-white/60 backdrop-blur-[16px] border-r border-slate-200/40 flex flex-col py-6 shadow-2xl lg:shadow-none z-30 transition-transform duration-300 ease-in-out w-72 h-full",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between gap-3 mb-10 w-full px-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2.5 rounded-xl shadow-lg shadow-primary-500/20">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-tight leading-tight text-base">FYP HMS</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary-600 font-bold">Medical System</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-full px-5 flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</p>
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10 border border-primary-100/50" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5", isActive ? "text-primary-600" : "text-slate-400")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* User profile sticky bottom */}
        <div className="w-full px-6 pt-6 mt-auto">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 border-2 border-primary-50 flex items-center justify-center text-primary-700 font-bold text-sm uppercase shrink-0 shadow-sm">
                {profile?.full_name ? profile.full_name.charAt(0) : <UserIcon className="w-5 h-5 opacity-40" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{profile?.full_name || 'Guest User'}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold truncate">{profile?.role || 'Awaiting Profile'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 px-8 pb-6">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight text-center leading-relaxed">
            FYP Hospital Management System<br />
            Haramaya University Computer Science
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-slate-50/50 relative">
        <header className="h-20 bg-white/60 backdrop-blur-[16px] border-b border-white/60 flex items-center px-4 sm:px-8 z-10 shrink-0 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
          <button 
            className="mr-4 lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-lg font-bold text-slate-800 capitalize hidden sm:block w-48 truncate">
             {location.pathname === '/dashboard' ? 'Overview' : location.pathname.substring(1)}
          </h2>

          {/* Search Bar */}
          <div className="flex-1 flex justify-start sm:justify-center mx-2 sm:mx-4 overflow-hidden">
            <div className="relative w-full max-w-xs sm:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 sm:pl-11 pr-2 sm:pr-4 py-2 sm:py-2.5 bg-white/80 border border-slate-200/80 rounded-full text-sm font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all shadow-sm"
              />
              <div className="hidden sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none">
                <span className="text-[10px] font-mono font-bold text-slate-300 border border-slate-200 px-1.5 py-0.5 rounded-md">⌘ K</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center justify-center p-2.5 bg-slate-100 text-slate-500 rounded-full">
              <UserIcon className="w-5 h-5" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
