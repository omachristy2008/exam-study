import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ExamResult } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

export const ProgressView: React.FC = () => {
  const { user, navigate } = useApp();
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getExamResults();
      setExamHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalExams = examHistory.length;
  const totalQuestionsSolved = examHistory.reduce((acc, curr) => acc + curr.total_questions, 0);
  const totalCorrect = examHistory.reduce((acc, curr) => acc + curr.correct_count, 0);
  const averageScore = totalExams > 0
    ? Math.round(examHistory.reduce((acc, curr) => acc + curr.score_percentage, 0) / totalExams)
    : 78;

  const topicsMastery = [
    { name: 'Trees & Binary Search Trees', course: 'CSC 201', score: 62, status: 'Needs Practice' },
    { name: 'Linear Lists & Stacks', course: 'CSC 201', score: 88, status: 'Mastered' },
    { name: 'Asymptotic Analysis & Big-O', course: 'CSC 201', score: 74, status: 'Good' },
    { name: 'Trigonometry & Bearings', course: 'WAEC Mathematics', score: 60, status: 'Needs Practice' },
    { name: 'Quadratic & Polynomial Equations', course: 'WAEC Mathematics', score: 90, status: 'Mastered' },
    { name: 'Mechanics & Vectors', course: 'PHY 101', score: 82, status: 'Good' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Progress & Performance Analytics
          </h1>
          <TrendingUp className="w-6 h-6 text-[#FF6A00]" />
        </div>
        <p className="text-sm text-[#A8969C] mt-1">
          Detailed breakdown of topic accuracy, study streaks, and exam readiness scores.
        </p>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Overall Mastery</div>
          <div className="text-2xl sm:text-3xl font-black text-[#FFA05C]">
            {user?.profile.overall_mastery_percentage || averageScore}%
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span>+4% this week</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Questions Solved</div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {(user?.profile.total_questions_solved || totalQuestionsSolved || 142).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Across all tests</div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Current Streak</div>
          <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1.5">
            <Flame className="w-6 h-6 text-[#FF6A00] fill-[#FF6A00]" />
            <span>{user?.profile.streak_days || 5} Days</span>
          </div>
          <div className="text-[11px] text-[#FFA05C]">Daily goal active</div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Total XP Earned</div>
          <div className="text-2xl sm:text-3xl font-black text-[#FFA05C] flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-[#FFA05C] fill-[#FFA05C]" />
            <span>{(user?.profile.xp || 1250).toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-400">Level 4 Scholar</div>
        </div>
      </div>

      {/* Topics Accuracy Breakdown */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#FFA05C]" />
            <span>Topic Accuracy & Syllabus Hotspots</span>
          </h2>
          <span className="text-xs text-slate-400">{topicsMastery.length} topics tracked</span>
        </div>

        <div className="space-y-3">
          {topicsMastery.map(topic => {
            const isNeedsPractice = topic.score < 70;
            return (
              <div
                key={topic.name}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div>
                      <span className="text-white">{topic.name}</span>
                      <span className="text-slate-400 ml-2 font-normal">({topic.course})</span>
                    </div>
                    <span
                      className={
                        topic.score >= 85
                          ? 'text-emerald-400'
                          : topic.score >= 70
                          ? 'text-[#FFA05C]'
                          : 'text-rose-400'
                      }
                    >
                      {topic.score}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        topic.score >= 85
                          ? 'bg-emerald-500'
                          : topic.score >= 70
                          ? 'bg-[#FF6A00]'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>

                {isNeedsPractice && (
                  <button
                    onClick={() =>
                      navigate('/ai-generator', {
                        defaultTopic: topic.name,
                        defaultSubject: topic.course,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#FF6A00] text-[#FFA05C] hover:text-white font-bold text-xs border border-[#FF6A00]/30 transition-all self-end sm:self-auto cursor-pointer"
                  >
                    Targeted Drill
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Examination History Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#FFA05C]" />
          <span>Complete Test Log ({examHistory.length})</span>
        </h2>

        {examHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No examinations completed yet.
          </div>
        ) : (
          <div className="space-y-3">
            {examHistory.map(exam => (
              <div
                key={exam.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all backdrop-blur-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{exam.title}</span>
                    <VerificationBadge sourceType={exam.source_type} size="sm" />
                  </div>
                  <div className="text-xs text-slate-300">
                    {exam.total_questions} Questions • {Math.round(exam.time_used_seconds / 60)} mins used • {new Date(exam.completed_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span
                      className={`text-lg font-black ${
                        exam.score_percentage >= 75
                          ? 'text-emerald-400'
                          : exam.score_percentage >= 50
                          ? 'text-[#FFA05C]'
                          : 'text-rose-400'
                      }`}
                    >
                      {exam.score_percentage}%
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {exam.correct_count}/{exam.total_questions} Correct
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/exam/${exam.id}/review`, { result: exam })}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
