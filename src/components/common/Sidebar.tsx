import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Bot,
  TrendingUp,
  Award,
  UploadCloud,
  User,
  Settings,
  Shield,
  Flame,
  Zap,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigate, user, switchRole } = useApp();

  const navItems = [
    { label: 'Home', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice Hub', route: '/practice', icon: Sparkles },
    { label: 'Past Questions', route: '/past-questions', icon: BookOpen },
    { label: 'AI Tutor', route: '/ai-tutor', icon: Bot, badge: 'AI' },
    { label: 'Study Coach', route: '/study-coach', icon: Zap, badge: 'Smart' },
    { label: 'Progress & Stats', route: '/progress', icon: TrendingUp },
    { label: 'Achievements', route: '/achievements', icon: Award },
    { label: 'Upload Past Question', route: '/upload-question', icon: UploadCloud },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/[0.03] backdrop-blur-2xl border-r border-white/10 h-screen sticky top-0 z-30 select-none shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-left">
          <BrandLogo size="md" showTagline />
        </button>
      </div>

      {/* Student Profile Quick Badge */}
      {user && (
        <div className="px-4 py-3 mx-3 my-2 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#FF8A3D] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#FF6A00]/25">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 truncate">
                {user.profile.education_type === 'both'
                  ? 'WAEC & University'
                  : user.profile.education_type === 'waec'
                  ? 'WAEC Candidate'
                  : user.profile.custom_university_name || 'UNILAG 200L'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-[#FF7A1A] bg-[#FF6A00]/15 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[#FF6A00]/30">
            <Flame className="w-3.5 h-3.5 fill-[#FF6A00]" />
            <span>{user.profile.streak_days}d</span>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
          Main Menu
        </div>
        {navItems.map(item => {
          const isActive = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white shadow-lg shadow-[#FF6A00]/30 font-bold border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-[#FF6A00]/20 text-[#FFA05C] border border-[#FF6A00]/40 backdrop-blur-sm'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin Section (if admin) */}
        {isAdmin && (
          <div className="pt-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400 px-3 py-1.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Admin Center</span>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentRoute.startsWith('/admin')
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-white/20'
                  : 'text-purple-300 hover:bg-purple-900/30 hover:text-white border border-transparent hover:border-purple-500/20'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation: Profile & Settings & Role Toggle */}
      <div className="p-3 border-t border-white/10 space-y-1 bg-white/[0.02] backdrop-blur-xl">
        <button
          onClick={() => navigate('/profile')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
            currentRoute === '/profile'
              ? 'bg-[#FF6A00]/20 text-[#FFA05C] border border-[#FF6A00]/40 backdrop-blur-md'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Academic</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
            currentRoute === '/settings'
              ? 'bg-[#FF6A00]/20 text-[#FFA05C] border border-[#FF6A00]/40 backdrop-blur-md'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* Quick Role Switcher for preview ease */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] px-2 text-slate-400">
          <span>Role mode:</span>
          <button
            onClick={() => switchRole(isAdmin ? 'student' : 'admin')}
            className="text-[10px] font-bold text-[#FFA05C] hover:text-white hover:underline"
          >
            Switch to {isAdmin ? 'Student' : 'Admin'}
          </button>
        </div>
      </div>
    </aside>
  );
};

export const BottomNav: React.FC = () => {
  const { currentRoute, navigate } = useApp();

  const mobileTabs = [
    { label: 'Home', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice', route: '/practice', icon: Sparkles },
    { label: 'Past Papers', route: '/past-questions', icon: BookOpen },
    { label: 'AI Tutor', route: '/ai-tutor', icon: Bot },
    { label: 'Progress', route: '/progress', icon: TrendingUp },
    { label: 'Profile', route: '/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/80 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around select-none shadow-2xl">
      {mobileTabs.map(tab => {
        const isActive = currentRoute === tab.route || (tab.route !== '/dashboard' && currentRoute.startsWith(tab.route));
        const Icon = tab.icon;
        return (
          <button
            key={tab.route}
            onClick={() => navigate(tab.route)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              isActive ? 'text-[#FF7A1A]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isActive ? 'scale-110 bg-[#FF6A00]/20 backdrop-blur-md' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#FF6A00] shadow-sm shadow-[#FF6A00]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
