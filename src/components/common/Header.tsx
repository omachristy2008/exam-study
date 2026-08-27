import React from 'react';
import {
  Flame,
  Zap,
  Shield,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Info,
  LogOut,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { user, navigate, currentRoute, isAdmin, logout, theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#151518] border-b border-[#27272C] px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
      {/* Left side on mobile: Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <button onClick={() => navigate('/dashboard')} className="cursor-pointer">
            <BrandLogo size="sm" />
          </button>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-sm text-[#A1A1AA]">
          <span className="font-semibold text-[#F5F5F5]">
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

      {/* Right side: Stats, Theme Toggle, Quick Action, Role, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Upload CTA (desktop) */}
        {user && (
          <button
            onClick={() => navigate('/upload-question')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] text-xs font-semibold text-[#FFA05C] border border-[#FF6A00]/30 transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Upload Paper</span>
          </button>
        )}

        {/* Streak pill */}
        {user && (
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] border border-[#27272C] text-xs font-bold text-[#F5F5F5] hover:border-[#FF6A00]/40 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4 text-[#FF6A00] fill-[#FF6A00]" />
            <span>{user.profile.streak_days}</span>
            <span className="text-[10px] text-[#71717A] hidden xs:inline">streak</span>
          </button>
        )}

        {/* XP pill */}
        {user && (
          <button
            onClick={() => navigate('/achievements')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] border border-[#27272C] text-xs font-bold text-[#FFA05C] hover:border-[#FF6A00]/40 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF6A00] fill-[#FF6A00]" />
            <span>{user.profile.xp.toLocaleString()}</span>
            <span className="text-[10px] text-[#71717A] hidden xs:inline">XP</span>
          </button>
        )}

        {/* Persistent Theme Preference Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Academic Mode'}
          title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Academic Mode'}
          className="flex items-center justify-center p-2 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] border border-[#27272C] hover:border-[#FF6A00]/40 text-[#F5F5F5] transition-all cursor-pointer group"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-[#FF6A00] group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Admin Badge & Link: ONLY visible if isAdmin */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-950/80 text-purple-200 border border-purple-500/30 hover:bg-purple-900/60 transition-all cursor-pointer"
            title="Administrator Space (omachristy4@gmail.com)"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Admin Space</span>
          </button>
        )}

        {/* User avatar / profile button */}
        {user ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
              title={`${user.name} (${user.email})`}
            >
              {user.name.charAt(0)}
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white text-xs font-bold cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
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
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 text-xs font-medium animate-in slide-in-from-right duration-200 ${
              isSuccess
                ? 'bg-[#151518] text-emerald-300 border-emerald-500/40'
                : isError
                ? 'bg-[#151518] text-rose-300 border-rose-500/40'
                : 'bg-[#151518] text-[#F5F5F5] border-[#27272C]'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#FF6A00] mt-0.5 flex-shrink-0" />
            )}
            <p className="flex-1 text-xs leading-relaxed">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};
