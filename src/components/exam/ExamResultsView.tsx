import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  ShieldCheck,
  FileDown,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExamResult } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { exportExamResultPDF } from '../../utils/pdfExport';

export const ExamResultsView: React.FC = () => {
  const { user, latestResult, routeParams, navigate, startExamSession } = useApp();
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const result: ExamResult | undefined = routeParams.result || latestResult;

  if (!result) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No exam result available.</h2>
        <button
          onClick={() => navigate('/practice')}
          className="px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-xl"
        >
          Return to Practice Hub
        </button>
      </div>
    );
  }

  const isPass = result.score_percentage >= 50;
  const isDistinction = result.score_percentage >= 75;

  const minutesUsed = Math.floor(result.time_used_seconds / 60);
  const secondsUsed = result.time_used_seconds % 60;
  const avgSecondsPerQ = Math.round(result.time_used_seconds / Math.max(1, result.total_questions));

  // Retake exam
  const handleRetakeExam = () => {
    startExamSession({
      title: `${result.title} (Retake)`,
      exam_type: result.exam_type,
      category_name: result.category_name,
      difficulty: 'medium',
      source_type: result.source_type,
      questions: result.questions,
      duration_seconds: result.total_questions * 90,
    });
  };

  // 1-Click drill for weak topics
  const handleDrillWeakAreas = () => {
    const weakTopics = result.topic_breakdown
      .filter(t => t.total > 0 && t.correct / t.total < 0.7)
      .map(t => t.topic);

    const targetTopic = weakTopics[0] || result.topic_breakdown[0]?.topic || 'Core Exam Topics';

    navigate('/ai-generator', {
      defaultTopic: targetTopic,
      defaultSubject: result.category_name,
      exam_type: result.exam_type,
    });
  };

  // PDF Export
  const handleDownloadPDF = () => {
    setDownloadingPDF(true);
    try {
      exportExamResultPDF({
        result,
        user,
      });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner Card: Score & Performance */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 shadow-2xl space-y-6 text-center sm:text-left relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FF6A00]/20 text-[#FFA05C] font-black text-xs border border-[#FF6A00]/30 backdrop-blur-sm">
                EXAM RESULT
              </span>
              <VerificationBadge sourceType={result.source_type} size="sm" />
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-[#FF6A00]/25 text-[#FFA05C] hover:text-white font-bold text-xs border border-white/10 hover:border-[#FF6A00]/40 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm ml-auto"
              >
                {pdfDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Report Saved!</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{downloadingPDF ? 'Generating...' : 'Export PDF'}</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {result.title}
            </h1>

            <p className="text-sm text-slate-300">
              Completed on {new Date(result.completed_at).toLocaleDateString()} at{' '}
              {new Date(result.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Radial Score Meter */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/[0.05] border border-white/12 backdrop-blur-md flex-shrink-0 w-44 shadow-lg">
            <span
              className={`text-4xl font-black ${
                isDistinction
                  ? 'text-emerald-400'
                  : isPass
                  ? 'text-[#FFA05C]'
                  : 'text-rose-400'
              }`}
            >
              {result.score_percentage}%
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              {isDistinction ? 'Distinction' : isPass ? 'Satisfactory' : 'Needs Practice'}
            </span>
            <div className="text-xs font-semibold text-white mt-1">
              {result.correct_count} of {result.total_questions} Correct
            </div>
          </div>
        </div>

        {/* 4 Metric Stats */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400">Correct</div>
            <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{result.correct_count}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400">Incorrect</div>
            <div className="text-lg font-black text-rose-400 flex items-center justify-center gap-1 mt-0.5">
              <XCircle className="w-4 h-4" />
              <span>{result.incorrect_count}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400">Time Used</div>
            <div className="text-lg font-black text-white flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-[#FFA05C]" />
              <span>{minutesUsed}m {secondsUsed}s</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400">Avg Pace</div>
            <div className="text-lg font-black text-[#FFA05C] flex items-center justify-center gap-1 mt-0.5">
              <Zap className="w-4 h-4" />
              <span>{avgSecondsPerQ}s / Q</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Mastery Breakdown */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FF6A00]" />
          <span>Topic Mastery Breakdown</span>
        </h3>

        <div className="space-y-3">
          {result.topic_breakdown.map(topic => {
            const pct = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
            const isGood = pct >= 70;
            return (
              <div
                key={topic.topic}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">{topic.topic}</span>
                    <span className={isGood ? 'text-emerald-400' : 'text-amber-400'}>
                      {topic.correct} / {topic.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isGood ? 'bg-emerald-400' : 'bg-[#FF6A00]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigate(`/exam/${result.id}/review`, { result })}
          className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/12 hover:border-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Review All Answers</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/12 hover:border-[#FF6A00]/40 text-[#FFA05C] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md"
        >
          {pdfDownloaded ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>PDF Saved!</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>{downloadingPDF ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </>
          )}
        </button>

        <button
          onClick={handleDrillWeakAreas}
          className="p-4 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF6A00]/25 hover:scale-101 cursor-pointer border border-white/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Practice Weak Areas</span>
        </button>

        <button
          onClick={handleRetakeExam}
          className="p-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/12 hover:border-white/25 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-md"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Retake This Exam</span>
        </button>
      </div>
    </div>
  );
};
