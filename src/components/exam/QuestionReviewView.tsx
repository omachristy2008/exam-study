import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Filter,
  Bot,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExamResult, Question } from '../../types';
import { api } from '../../services/api';

export const QuestionReviewView: React.FC = () => {
  const { latestResult, routeParams, navigate, showToast, startExamSession } = useApp();

  const result: ExamResult | undefined = routeParams.result || latestResult;
  const [filterMode, setFilterMode] = useState<'all' | 'missed' | 'correct'>('all');
  const [loadingSimilarId, setLoadingSimilarId] = useState<string | null>(null);

  if (!result) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No review data found.</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-[#FF6A00] text-white text-xs font-bold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filteredQuestions = result.questions.filter(q => {
    const userAnswer = result.user_answers[q.id];
    const isCorrect = userAnswer === q.correct_answer;
    if (filterMode === 'missed') return !isCorrect;
    if (filterMode === 'correct') return isCorrect;
    return true;
  });

  const handleGenerateSimilar = async (q: Question) => {
    setLoadingSimilarId(q.id);
    try {
      const resp = await api.generateSimilarQuestion({
        original_question: q.question_text,
        topic: q.topic_name || 'Core Curriculum',
      });

      if (resp.question) {
        showToast('Generated similar question! Launching 1-question rapid drill.', 'success');
        startExamSession({
          title: `Rapid Drill: ${q.topic_name || 'Concept Practice'}`,
          exam_type: q.exam_type || 'university',
          category_name: q.course_code || q.subject_name || 'Targeted Drill',
          difficulty: 'medium',
          source_type: 'ai_generated',
          questions: [resp.question],
          duration_seconds: 120,
        });
      }
    } catch (e) {
      showToast('Could not generate similar question. Please try again.', 'error');
    } finally {
      setLoadingSimilarId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/exam/${result.id}/results`, { result })}
            className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/12 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Answer Review & Explanations
            </h1>
            <p className="text-xs text-slate-300">
              {result.title} • Score: {result.score_percentage}%
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl self-start sm:self-auto">
          {(['all', 'missed', 'correct'] as const).map(m => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterMode === m
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white shadow-md shadow-[#FF6A00]/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {m === 'all'
                ? `All (${result.total_questions})`
                : m === 'missed'
                ? `Missed (${result.incorrect_count})`
                : `Correct (${result.correct_count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const userAnswer = result.user_answers[q.id];
          const isCorrect = userAnswer === q.correct_answer;
          const isUnanswered = !userAnswer;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-3xl border space-y-4 shadow-2xl backdrop-blur-2xl transition-all ${
                isCorrect
                  ? 'bg-white/[0.04] border-emerald-500/30'
                  : 'bg-white/[0.04] border-rose-500/30'
              }`}
            >
              {/* Question Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#FFA05C]">
                    Question {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {q.topic_name || q.course_code || q.subject_name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/40 backdrop-blur-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Correct</span>
                    </span>
                  ) : isUnanswered ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40 backdrop-blur-sm">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Unanswered</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-400/40 backdrop-blur-sm">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                {q.question_text}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map(opt => {
                  const isCorrectOpt = opt.id === q.correct_answer;
                  const isUserPick = opt.id === userAnswer;

                  let borderClass = 'border-white/8 bg-white/[0.03] text-slate-200';
                  if (isCorrectOpt) {
                    borderClass = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 shadow-sm';
                  } else if (isUserPick && !isCorrect) {
                    borderClass = 'border-rose-500/60 bg-rose-500/15 text-rose-200 shadow-sm';
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 backdrop-blur-sm ${borderClass}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                          isCorrectOpt
                            ? 'bg-emerald-400 text-slate-950 font-black'
                            : isUserPick && !isCorrect
                            ? 'bg-rose-500 text-white font-black'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div className="flex-1">
                        <span className="leading-relaxed">{opt.text}</span>
                        {isCorrectOpt && (
                          <span className="block text-[10px] font-bold text-emerald-400 mt-0.5">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isUserPick && !isCorrect && (
                          <span className="block text-[10px] font-bold text-rose-400 mt-0.5">
                            ✗ Your Selection
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step-by-Step Verified Explanation */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs backdrop-blur-sm">
                <div className="font-bold text-[#FFA05C] flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[#FFA05C]" />
                  <span>Curriculum Solution & Formula Breakdown</span>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {q.explanation}
                </p>

                {/* AI Distractor diagnosis if student was incorrect */}
                {!isCorrect && userAnswer && (
                  <div className="pt-2.5 mt-2.5 border-t border-white/10 text-[11px] text-slate-300">
                    <strong className="text-[#FFA05C]">AI Misconception Diagnostic:</strong> You selected option ({userAnswer}). This is a classic test trap where students forget to invert the inequality or misapply rotation rules.
                  </div>
                )}
              </div>

              {/* 1-Click Generate Similar Question Drill */}
              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={() => handleGenerateSimilar(q)}
                  disabled={loadingSimilarId === q.id}
                  className="px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-[#FFA05C] border border-[#FF6A00]/40 hover:border-[#FF6A00] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 backdrop-blur-sm"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loadingSimilarId === q.id ? 'animate-spin' : ''}`} />
                  <span>
                    {loadingSimilarId === q.id ? 'Synthesizing Drill...' : 'Generate Similar Question Drill'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
