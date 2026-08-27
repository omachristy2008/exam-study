import React from 'react';
import {
  Flame,
  Zap,
  Bell,
  Sparkles,
  Shield,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { user, navigate, switchRole, currentRoute } = useApp();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/[0.03] backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
      {/* Left side on mobile: Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <button onClick={() => navigate('/dashboard')}>
            <BrandLogo size="sm" />
          </button>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-300">
          <span className="font-semibold text-white">
            {currentRoute === '/dashboard' && 'Dashboard Overview'}
            {currentRoute.startsWith('/practice') && 'Examination Practice Hub'}
            {currentRoute.startsWith('/past-questions') && 'Real Past Questions Library'}
            {currentRoute.startsWith('/ai-generator') && 'AI Question Generator'}
            {currentRoute.startsWith('/ai-tutor') && 'AI Subject Tutor & Chat'}
            {currentRoute.startsWith('/study-coach') && 'AI Study Coach & Daily Roadmap'}
            {currentRoute.startsWith('/progress') && 'Academic Progress & Analytics'}
            {currentRoute.startsWith('/achievements') && 'XP & Milestones'}
            {currentRoute.startsWith('/upload-question') && 'Student Question Contribution'}
            {currentRoute.startsWith('/profile') && 'Student Academic Profile'}
            {currentRoute.startsWith('/settings') && 'Platform Settings'}
            {currentRoute.startsWith('/admin') && 'Admin Moderation & Content Management'}
          </span>
        </div>
      </div>

      {/* Right side: Stats, Quick Action, Role, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Upload CTA (desktop) */}
        <button
          onClick={() => navigate('/upload-question')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-[#FFA05C] border border-[#FF6A00]/40 backdrop-blur-md transition-all hover:scale-102"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>Upload Paper</span>
        </button>

        {/* Streak pill */}
        {user && (
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl border border-white/12 text-xs font-bold text-white hover:border-[#FF6A00]/50 transition-all shadow-sm"
          >
            <Flame className="w-4 h-4 text-[#FF6A00] fill-[#FF6A00]" />
            <span>{user.profile.streak_days}</span>
            <span className="text-[10px] text-slate-400 hidden xs:inline">streak</span>
          </button>
        )}

        {/* XP pill */}
        {user && (
          <button
            onClick={() => navigate('/achievements')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl border border-white/12 text-xs font-bold text-[#FFA05C] hover:border-[#FF6A00]/50 transition-all shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF7A1A] fill-[#FF7A1A]" />
            <span>{user.profile.xp.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 hidden xs:inline">XP</span>
          </button>
        )}

        {/* Role toggle button */}
        <button
          onClick={() => switchRole(isAdmin ? 'student' : 'admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border backdrop-blur-md ${
            isAdmin
              ? 'bg-purple-900/40 text-purple-200 border-purple-400/40 hover:bg-purple-800/50 shadow-md shadow-purple-950/40'
              : 'bg-white/[0.05] text-slate-300 border-white/12 hover:bg-white/[0.09] hover:text-white'
          }`}
          title="Switch between Student and Admin mode"
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Student'}</span>
        </button>

        {/* User avatar / profile button */}
        {user && (
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#FF8A3D] text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-[#FF6A00]/30 hover:scale-105 transition-transform border border-white/20"
          >
            {user.name.charAt(0)}
          </button>
        )}
      </div>
    </header>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-start gap-3 text-sm font-medium animate-in slide-in-from-right duration-200 ${
              isSuccess
                ? 'bg-emerald-950/80 text-emerald-100 border-emerald-500/40 shadow-emerald-950/50'
                : isError
                ? 'bg-rose-950/80 text-rose-100 border-rose-500/40 shadow-rose-950/50'
                : 'bg-slate-900/80 text-white border-white/20 shadow-black/50'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#FF7A1A] mt-0.5 flex-shrink-0" />
            )}
            <p className="flex-1 text-xs leading-relaxed">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};
