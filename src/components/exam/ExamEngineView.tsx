import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  X,
  CheckCircle2,
  Grid,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/VerificationBadge';

export const ExamEngineView: React.FC = () => {
  const {
    activeExam,
    updateExamAnswer,
    toggleFlagQuestion,
    finishExamSession,
    cancelExamSession,
    showToast,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(
    activeExam?.duration_seconds || 1200
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!activeExam) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam]);

  if (!activeExam) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No active examination session.</h2>
        <button
          onClick={cancelExamSession}
          className="px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-xl"
        >
          Return to Practice Hub
        </button>
      </div>
    );
  }

  const currentQ = activeExam.questions[currentIndex];
  const totalQuestions = activeExam.questions.length;
  const answeredCount = Object.keys(activeExam.user_answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const isFlagged = currentQ ? activeExam.flagged_questions.includes(currentQ.id) : false;
  const selectedOptionId = currentQ ? activeExam.user_answers[currentQ.id] : undefined;

  // Format time as MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isLowTime = secondsRemaining < 180; // Less than 3 mins

  const handleSelectOption = (optId: string) => {
    if (!currentQ) return;
    updateExamAnswer(currentQ.id, optId);
  };

  const handleAutoSubmit = async () => {
    showToast('Time has expired! Submitting your answers...', 'info');
    await finishExamSession(activeExam.duration_seconds);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    const timeUsed = activeExam.duration_seconds - secondsRemaining;
    await finishExamSession(timeUsed);
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* Top Test Header */}
      <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/12 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-2xl sticky top-2 z-20">
        {/* Left info: Title and Question Counter */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
              {activeExam.title}
            </span>
            <VerificationBadge sourceType={activeExam.source_type} size="sm" />
          </div>
          <div className="text-xs font-black text-[#FFA05C]">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
        </div>

        {/* Center/Right: Timer and Palette Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Timer Pill */}
          <div
            className={`px-3.5 py-1.5 rounded-2xl border flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black transition-all backdrop-blur-md ${
              isLowTime
                ? 'bg-rose-500/20 border-rose-400/40 text-rose-200 animate-pulse'
                : 'bg-white/[0.06] border-white/12 text-white'
            }`}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-[#FFA05C]'}`} />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Palette toggle */}
          <button
            onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
            className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title="Question Palette"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* End Test Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs shadow-lg shadow-[#FF6A00]/25 transition-all cursor-pointer border border-white/20"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-150 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Question Subheader: Meta & Flag button */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                {currentQ.topic_name || currentQ.course_code || 'Question'}
              </span>
              {currentQ.year && (
                <span className="text-[11px] text-slate-400">({currentQ.year} Paper)</span>
              )}
            </div>

            <button
              onClick={() => toggleFlagQuestion(currentQ.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer backdrop-blur-md ${
                isFlagged
                  ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200 shadow-sm'
                  : 'bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Text */}
          <div className="relative z-10 space-y-2">
            <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
              {currentQ.question_text}
            </p>
          </div>

          {/* Option Cards (A, B, C, D) */}
          <div className="relative z-10 grid grid-cols-1 gap-3 pt-2">
            {currentQ.options.map(opt => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border flex items-center gap-3.5 transition-all cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? 'bg-[#FF6A00]/25 border-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/20 scale-[1.005]'
                      : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.07] hover:border-white/20 text-slate-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#FF6A00] text-white shadow-sm'
                        : 'bg-white/[0.08] text-[#FFA05C]'
                    }`}
                  >
                    {opt.id}
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Nav Bar: Previous, Palette, Next */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/12 hover:bg-white/10 text-xs font-bold text-white disabled:opacity-30 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs text-slate-300 hidden sm:block">
          Answered: <strong className="text-white">{answeredCount}</strong> / {totalQuestions}
        </div>

        {currentIndex === totalQuestions - 1 ? (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#FF6A00]/25 transition-all cursor-pointer border border-white/20"
          >
            <span>Finish & Review</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#FF6A00]/25 transition-all cursor-pointer border border-white/20"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question Palette Drawer Modal */}
      {showPaletteDrawer && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Question Grid Palette</h3>
              <button
                onClick={() => setShowPaletteDrawer(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF6A00]" />
                <span className="text-slate-200">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-slate-200">Flagged ({activeExam.flagged_questions.length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                <span className="text-slate-200">Unanswered ({unansweredCount})</span>
              </div>
            </div>

            {/* Grid of buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
              {activeExam.questions.map((q, idx) => {
                const isAnswered = !!activeExam.user_answers[q.id];
                const isFlg = activeExam.flagged_questions.includes(q.id);
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPaletteDrawer(false);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-white border-[#FF6A00]'
                        : ''
                    } ${
                      isFlg
                        ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                        : isAnswered
                        ? 'bg-[#FF6A00] text-white border-white/20'
                        : 'bg-white/[0.05] text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 backdrop-blur-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6A00]/20 border border-[#FF6A00]/40 flex items-center justify-center text-[#FFA05C]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-white text-lg">Submit Examination?</h3>

            <div className="space-y-2 text-xs text-slate-300">
              {unansweredCount > 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 space-y-1">
                  <div className="font-bold">You have {unansweredCount} unanswered questions!</div>
                  <p>Are you sure you want to submit now? Unanswered questions will be marked incorrect.</p>
                </div>
              ) : (
                <p>You have answered all {totalQuestions} questions. Ready to review your full diagnostic score?</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Back to Test
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold shadow-lg shadow-[#FF6A00]/25 transition-all cursor-pointer border border-white/20"
              >
                {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
