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
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigate, user, isAdmin, logout, theme, toggleTheme } = useApp();

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

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#151518] border-r border-[#27272C] h-screen sticky top-0 z-30 select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#27272C] flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-left cursor-pointer">
          <BrandLogo size="md" showTagline />
        </button>
      </div>

      {/* Student / Admin Profile Quick Badge */}
      {user && (
        <div className="px-4 py-3 mx-3 my-2 bg-[#1A1A1E] border border-[#27272C] rounded-2xl flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#F5F5F5] truncate">{user.name}</div>
              <div className="text-[10px] text-[#A1A1AA] truncate">
                {isAdmin
                  ? 'Administrator'
                  : user.profile.education_type === 'both'
                  ? 'WAEC & University'
                  : user.profile.education_type === 'waec'
                  ? 'WAEC Candidate'
                  : user.profile.custom_university_name || 'University Student'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-[#FFA05C] bg-[#FF6A00]/15 px-2 py-0.5 rounded-lg border border-[#FF6A00]/30 flex-shrink-0">
            <Flame className="w-3.5 h-3.5 fill-[#FF6A00] text-[#FF6A00]" />
            <span>{user.profile.streak_days}d</span>
          </div>
        </div>
      )}

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#71717A] px-3 py-1.5">
          Main Menu
        </div>
        {navItems.map(item => {
          const isActive = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF6A00] text-white font-bold'
                  : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1A1A1E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#71717A]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-black/25 text-white'
                      : 'bg-[#FF6A00]/15 text-[#FFA05C] border border-[#FF6A00]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin Section: ONLY visible if authenticated user is the verified admin (omachristy4@gmail.com) */}
        {isAdmin && (
          <div className="pt-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400 px-3 py-1.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Admin Center</span>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentRoute.startsWith('/admin')
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-purple-300 hover:bg-[#1A1A1E] hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation: Profile & Settings & Theme & Sign Out */}
      <div className="p-3 border-t border-[#27272C] space-y-1 bg-[#151518]">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1A1A1E] transition-all cursor-pointer group"
          title="Toggle High-Contrast Light Mode or Dark Academic Mode"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-[#FF6A00] group-hover:-rotate-12 transition-transform" />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#202026] text-[#71717A]">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            currentRoute === '/profile'
              ? 'bg-[#1A1A1E] text-[#FFA05C] border border-[#FF6A00]/40'
              : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1A1A1E]'
          }`}
        >
          <User className="w-4 h-4 text-[#71717A]" />
          <span>Academic Profile</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            currentRoute === '/settings'
              ? 'bg-[#1A1A1E] text-[#FFA05C] border border-[#FF6A00]/40'
              : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1A1A1E]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#71717A]" />
          <span>Settings</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export const BottomNav: React.FC = () => {
  const { currentRoute, navigate, isAdmin } = useApp();

  const mobileTabs = [
    { label: 'Home', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice', route: '/practice', icon: Sparkles },
    { label: 'Past Papers', route: '/past-questions', icon: BookOpen },
    { label: 'AI Tutor', route: '/ai-tutor', icon: Bot },
    { label: 'Progress', route: '/progress', icon: TrendingUp },
    ...(isAdmin ? [{ label: 'Admin', route: '/admin', icon: Shield }] : [{ label: 'Profile', route: '/profile', icon: User }]),
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#151518]/95 border-t border-[#27272C] px-2 py-1.5 flex items-center justify-around select-none">
      {mobileTabs.map(tab => {
        const isActive = currentRoute === tab.route || (tab.route !== '/dashboard' && currentRoute.startsWith(tab.route));
        const Icon = tab.icon;
        return (
          <button
            key={tab.route}
            onClick={() => navigate(tab.route)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer ${
              isActive ? 'text-[#FF6A00]' : 'text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-[#FF6A00]/15' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
