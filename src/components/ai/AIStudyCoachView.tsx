import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const AIStudyCoachView: React.FC = () => {
  const { user, navigate, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [planSummary, setPlanSummary] = useState('');
  const [dailyPlan, setDailyPlan] = useState<any[]>([]);

  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    setLoading(true);
    try {
      const resp = await api.getStudyCoachPlan({
        weak_topics: [],
        target_courses: user?.profile.selected_courses || [],
      });

      setPlanSummary(resp.summary);
      if (resp.plan && resp.plan.length > 0) {
        setDailyPlan(
          resp.plan.map((p, idx) => ({
            step: idx + 1,
            title: p.title,
            duration_minutes: p.duration_minutes,
            description: `Focus on ${p.topic} in ${p.course_or_subject}. Target duration: ${p.duration_minutes} minutes.`,
            action_label: p.action_label || 'Start',
            action_type: p.type === 'mini_test' ? 'ai_tutor' : 'ai_drill',
          }))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Study Coach
            </h1>
            <Zap className="w-6 h-6 text-[#FF6A00] fill-[#FF6A00]" />
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Personalized exam diagnosis and adaptive daily study roadmaps.
          </p>
        </div>

        <button
          onClick={loadStudyPlan}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-[#FFA05C] border border-white/12 transition-all self-start sm:self-auto backdrop-blur-md cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh AI Diagnostics</span>
        </button>
      </div>

      {/* AI Diagnostic Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-[#FFA05C]">
          <Target className="w-4 h-4" />
          <span className="tracking-wide">REAL-TIME PERFORMANCE DIAGNOSIS</span>
        </div>

        <p className="relative z-10 text-sm text-slate-200 leading-relaxed max-w-3xl">
          {planSummary ||
            `Welcome to your AI Study Coach! Complete your first practice drill or past questions test to generate dynamic real-time diagnostics and personalized daily study milestones.`}
        </p>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 backdrop-blur-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium">Daily Streak</div>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF6A00] fill-[#FF6A00]" />
              <span>{user?.profile.streak_days || 0} Days Active</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 backdrop-blur-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium">Target Session Length</div>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FFA05C]" />
              <span>35 Minutes</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 backdrop-blur-sm space-y-1">
            <div className="text-xs text-slate-400 font-medium">Predicted Exam Readiness</div>
            <div className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>
                {user?.profile.total_tests_completed && user.profile.overall_mastery_percentage
                  ? `${user.profile.overall_mastery_percentage}%`
                  : 'Pending First Test'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Part Step-by-Step Daily Roadmap */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6A00]" />
            <span>Today's 3-Part Study Roadmap</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Complete all three phases to maintain your daily streak and earn +150 bonus XP.
          </p>
        </div>

        <div className="space-y-4">
          {dailyPlan.map((step, idx) => (
            <div
              key={step.step}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#FF6A00]/40 hover:bg-white/[0.06] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-2xl bg-[#FF6A00]/15 text-[#FFA05C] font-black text-sm flex items-center justify-center border border-[#FF6A00]/30 flex-shrink-0 mt-0.5 backdrop-blur-sm">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{step.title}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#FFA05C] border border-white/10">
                      {step.duration_minutes} mins
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (step.action_type === 'ai_tutor') {
                    navigate('/ai-tutor');
                  } else {
                    navigate('/ai-generator', { defaultTopic: 'Binary Search Trees', defaultSubject: 'CSC 201' });
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold flex items-center gap-2 self-start md:self-auto shadow-md shadow-[#FF6A00]/20 transition-all hover:scale-102 cursor-pointer whitespace-nowrap border border-white/20"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Phase {idx + 1}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
