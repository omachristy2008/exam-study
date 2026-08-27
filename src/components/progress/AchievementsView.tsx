import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  Star,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Achievement } from '../../types';

export const AchievementsView: React.FC = () => {
  const { user, celebrate } = useApp();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await api.getAchievements();
      setAchievements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        <div className="relative z-10 space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-white/[0.06] text-[#FFA05C] font-black text-xs border border-[#FF6A00]/30 backdrop-blur-sm">
              STUDY REWARDS & XP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Academic Achievements
          </h1>
          <p className="text-sm text-slate-300">
            Earn XP, unlock milestones, and master your university and WAEC curriculums.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center w-28 backdrop-blur-sm">
            <div className="text-[11px] text-slate-300 font-semibold">Unlocked</div>
            <div className="text-xl font-black text-[#FFA05C]">
              {unlockedCount}/{achievements.length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center w-28 backdrop-blur-sm">
            <div className="text-[11px] text-slate-300 font-semibold">Total XP</div>
            <div className="text-xl font-black text-white">
              {(user?.profile.xp || 1250).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map(ach => (
          <div
            key={ach.id}
            onClick={() => {
              if (ach.unlocked) celebrate();
            }}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer backdrop-blur-xl ${
              ach.unlocked
                ? 'bg-white/[0.04] border-white/12 shadow-xl hover:-translate-y-1 hover:border-[#FF6A00]/60 hover:bg-white/[0.07]'
                : 'bg-white/[0.02] border-white/5 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{ach.icon}</div>
                {ach.unlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-white text-base">{ach.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{ach.description}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#FFA05C] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>+{ach.xp_reward} XP</span>
              </span>
              {ach.unlocked_at && (
                <span className="text-[10px] text-slate-400">
                  {new Date(ach.unlocked_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
