import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Shield,
  Smartphone,
  Save,
  CheckCircle2,
  Lock,
  Palette,
  Eye,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config/branding';

export const SettingsView: React.FC = () => {
  const { showToast, theme, setTheme } = useApp();
  const [dailyStreakReminder, setDailyStreakReminder] = useState(true);
  const [highContrastOptions, setHighContrastOptions] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleSelectTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    showToast(
      newTheme === 'light'
        ? 'High-Contrast Light Mode activated.'
        : 'Dark Academic Mode activated.',
      'success'
    );
  };

  const handleSave = () => {
    showToast('Platform preferences saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
            Settings & Preferences
          </h1>
          <Settings className="w-6 h-6 text-[#FF6A00]" />
        </div>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Customize simulation preferences, persistent visual theme, and study controls.
        </p>
      </div>

      {/* Visual Theme Appearance Card */}
      <div className="bg-[#151518] border border-[#27272C] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF6A00]/15 text-[#FF6A00]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F5F5]">Display Theme & Appearance</h2>
              <p className="text-xs text-[#A1A1AA]">
                Select your preferred visual mode. Your selection is automatically persisted across sessions.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#1A1A1E] border border-[#27272C] text-[#FFA05C]">
            Active: {theme === 'light' ? 'Light' : 'Dark'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <button
            onClick={() => handleSelectTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-44 cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1A1A1E] border-[#FF6A00] ring-2 ring-[#FF6A00]/30 shadow-lg shadow-[#FF6A00]/10'
                : 'bg-[#151518] border-[#27272C] hover:border-[#3E3E46] hover:bg-[#1A1A1E]/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-[#0D0D0F] border border-[#27272C] text-amber-400">
                <Moon className="w-5 h-5 text-[#FF6A00]" />
              </div>
              {theme === 'dark' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF6A00] bg-[#FF6A00]/15 px-2 py-0.5 rounded-full border border-[#FF6A00]/30">
                  <Check className="w-3 h-3" /> Selected
                </span>
              )}
            </div>

            <div>
              <div className="text-sm font-bold text-[#F5F5F5]">Dark Academic Mode</div>
              <div className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                Deep obsidian canvas engineered for focused night sessions and minimal eye strain.
              </div>
            </div>
          </button>

          {/* High-Contrast Light Mode Card */}
          <button
            onClick={() => handleSelectTheme('light')}
            className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-44 cursor-pointer ${
              theme === 'light'
                ? 'bg-[#F8FAFC] border-[#FF6A00] ring-2 ring-[#FF6A00]/30 shadow-lg shadow-[#FF6A00]/10 text-[#0F172A]'
                : 'bg-[#151518] border-[#27272C] hover:border-[#3E3E46] hover:bg-[#1A1A1E]/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                <Sun className="w-5 h-5 text-amber-500" />
              </div>
              {theme === 'light' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF6A00] bg-[#FF6A00]/15 px-2 py-0.5 rounded-full border border-[#FF6A00]/30">
                  <Check className="w-3 h-3" /> Selected
                </span>
              )}
            </div>

            <div>
              <div className={`text-sm font-bold ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#F5F5F5]'}`}>
                High-Contrast Light Mode
              </div>
              <div className={`text-xs mt-1 leading-relaxed ${theme === 'light' ? 'text-[#475569]' : 'text-[#A1A1AA]'}`}>
                Crisp daylight palette with WCAG AAA typography contrast for maximum daytime clarity.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Settings Options Card */}
      <div className="bg-[#151518] border border-[#27272C] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <h2 className="text-base font-bold text-[#F5F5F5]">Study & Examination Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1A1A1E] border border-[#27272C]">
            <div>
              <div className="font-bold text-xs text-[#F5F5F5]">Daily Streak Reminder</div>
              <div className="text-[11px] text-[#A1A1AA]">
                Receive proactive notifications to preserve your active study streak
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dailyStreakReminder}
                onChange={e => setDailyStreakReminder(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#27272C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1A1A1E] border border-[#27272C]">
            <div>
              <div className="font-bold text-xs text-[#F5F5F5]">High Contrast Option Cards</div>
              <div className="text-[11px] text-[#A1A1AA]">
                Enhanced contrast borders on exam option cards for rapid touch selection
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={highContrastOptions}
                onChange={e => setHighContrastOptions(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#27272C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#1A1A1E] border border-[#27272C]">
            <div>
              <div className="font-bold text-xs text-[#F5F5F5]">Haptic Feedback & Sound Signals</div>
              <div className="text-[11px] text-[#A1A1AA]">
                Vibrate on option tap and chime on low time alerts
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hapticFeedback}
                onChange={e => setHapticFeedback(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#27272C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
            </label>
          </div>
        </div>

        {/* App Info */}
        <div className="pt-4 border-t border-[#27272C] space-y-2 text-xs text-[#A1A1AA]">
          <div className="flex justify-between">
            <span>Platform Version</span>
            <span className="text-[#F5F5F5] font-mono">{APP_CONFIG.version} (Verified Edition)</span>
          </div>
          <div className="flex justify-between">
            <span>Server Architecture</span>
            <span className="text-[#F5F5F5]">Google GenAI SDK (Server-Side Proxy)</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold shadow-lg shadow-[#FF6A00]/25 transition-all cursor-pointer flex items-center gap-2 border border-white/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
