import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Moon,
  Shield,
  Smartphone,
  Save,
  Trash2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APP_CONFIG } from '../../config/branding';

export const SettingsView: React.FC = () => {
  const { showToast } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [dailyStreakReminder, setDailyStreakReminder] = useState(true);
  const [highContrastOptions, setHighContrastOptions] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleSave = () => {
    showToast('Platform preferences saved!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Settings & Preferences
          </h1>
          <Settings className="w-6 h-6 text-[#FF6A00]" />
        </div>
        <p className="text-sm text-[#A8969C] mt-1">
          Customize simulation preferences, notifications, and examination controls.
        </p>
      </div>

      {/* Settings Options Card */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <h2 className="relative z-10 text-base font-bold text-white">Study & Examination Preferences</h2>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-sm">
            <div>
              <div className="font-bold text-xs text-white">Daily Streak Reminder</div>
              <div className="text-[11px] text-slate-300">
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
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-sm">
            <div>
              <div className="font-bold text-xs text-white">High Contrast Option Cards</div>
              <div className="text-[11px] text-slate-300">
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
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-sm">
            <div>
              <div className="font-bold text-xs text-white">Haptic Feedback & Sound Signals</div>
              <div className="text-[11px] text-slate-300">
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
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
            </label>
          </div>
        </div>

        {/* App Info */}
        <div className="relative z-10 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Platform Version</span>
            <span className="text-white font-mono">{APP_CONFIG.version} (Verified Edition)</span>
          </div>
          <div className="flex justify-between">
            <span>Server Architecture</span>
            <span className="text-white">Google GenAI SDK (Server-Side Proxy)</span>
          </div>
        </div>

        <div className="relative z-10 pt-2 flex justify-end">
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
