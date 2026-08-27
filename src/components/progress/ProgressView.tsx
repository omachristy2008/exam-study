import React, { useState, useEffect, useMemo } from 'react';
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
  Download,
  FileText,
  FileDown,
  Check,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ExamResult } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { exportStudyAnalyticsPDF, exportExamResultPDF } from '../../utils/pdfExport';

export const ProgressView: React.FC = () => {
  const { user, navigate } = useApp();
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadingExamId, setDownloadingExamId] = useState<string | null>(null);

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
    : 0;

  // Calculate real topic mastery from actual completed exams
  const topicsMastery = useMemo(() => {
    if (examHistory.length === 0) return [];
    const topicMap: Record<string, { topic: string; course: string; total: number; correct: number }> = {};
    examHistory.forEach(exam => {
      (exam.topic_breakdown || []).forEach(tb => {
        if (!topicMap[tb.topic]) {
          topicMap[tb.topic] = { topic: tb.topic, course: exam.category_name, total: 0, correct: 0 };
        }
        topicMap[tb.topic].total += tb.total;
        topicMap[tb.topic].correct += tb.correct;
      });
    });
    return Object.values(topicMap).map(t => {
      const score = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      return {
        name: t.topic,
        course: t.course,
        score,
        status: score >= 85 ? 'Mastered' : score >= 70 ? 'Good' : 'Needs Practice'
      };
    });
  }, [examHistory]);

  const handleExportFullAnalytics = () => {
    setExportingPDF(true);
    try {
      exportStudyAnalyticsPDF({
        user,
        examHistory,
        topicsMastery,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportSingleExam = (exam: ExamResult) => {
    setDownloadingExamId(exam.id);
    try {
      exportExamResultPDF({
        result: exam,
        user,
      });
    } catch (err) {
      console.error('Failed to export exam PDF:', err);
    } finally {
      setTimeout(() => setDownloadingExamId(null), 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* Download PDF Button */}
        <button
          onClick={handleExportFullAnalytics}
          disabled={exportingPDF || totalExams === 0}
          className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer border border-white/20 self-start sm:self-auto disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>PDF Downloaded!</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>{exportingPDF ? 'Generating PDF...' : 'Download Performance PDF'}</span>
            </>
          )}
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 px-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in backdrop-blur-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Your comprehensive study performance analytics and mock exam scores PDF report has been generated and saved to your device.</span>
        </div>
      )}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Overall Mastery</div>
          <div className="text-2xl sm:text-3xl font-black text-[#FFA05C]">
            {totalExams > 0 ? (user?.profile.overall_mastery_percentage || averageScore) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {totalExams > 0 ? `${totalExams} tests logged` : 'Pending first test'}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Questions Solved</div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {(user?.profile.total_questions_answered || totalQuestionsSolved).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            {totalExams > 0 ? `${totalCorrect} correct answers` : 'Across all tests'}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Current Streak</div>
          <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1.5">
            <Flame className="w-6 h-6 text-[#FF6A00] fill-[#FF6A00]" />
            <span>{user?.profile.streak_days || 0} Days</span>
          </div>
          <div className="text-[11px] text-[#FFA05C]">
            {user?.profile.streak_days ? 'Daily goal active' : 'Start streak today'}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Total XP Earned</div>
          <div className="text-2xl sm:text-3xl font-black text-[#FFA05C] flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-[#FFA05C] fill-[#FFA05C]" />
            <span>{(user?.profile.xp || 0).toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {(user?.profile.xp || 0) >= 500 ? 'Level 2 Scholar' : 'Novice Scholar'}
          </div>
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

        {topicsMastery.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/6 space-y-2">
            <div className="text-sm font-semibold text-white">No topic accuracy recorded yet</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Complete your first practice test or timed mock exam. EXAMAI will automatically break down your accuracy per topic so you can spot strengths and weak areas.
            </p>
            <button
              onClick={() => navigate('/practice')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white font-bold text-xs shadow-md shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Practice Test</span>
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Complete Examination History Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#FFA05C]" />
          <span>Complete Test Log ({examHistory.length})</span>
        </h2>

        {examHistory.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/6 space-y-2">
            <div className="text-sm font-semibold text-white">No examinations completed yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you complete any quiz, mock exam, or past question drill, your scores, time taken, and answer reviews will be archived here.
            </p>
            <button
              onClick={() => navigate('/practice')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white font-bold text-xs shadow-md shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Take Your First Test</span>
            </button>
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportSingleExam(exam)}
                      disabled={downloadingExamId === exam.id}
                      title="Download Exam Report Card PDF"
                      className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-[#FF6A00]/20 text-[#FFA05C] hover:text-white border border-white/10 hover:border-[#FF6A00]/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>{downloadingExamId === exam.id ? 'Exporting...' : 'PDF'}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/exam/${exam.id}/review`, { result: exam })}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
