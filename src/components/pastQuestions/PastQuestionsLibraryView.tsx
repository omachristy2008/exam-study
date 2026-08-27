import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Search,
  Filter,
  Play,
  Calendar,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Question } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

export const PastQuestionsLibraryView: React.FC = () => {
  const { navigate, startExamSession, showToast, routeParams } = useApp();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamType, setSelectedExamType] = useState<'all' | 'waec' | 'university'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('real_past_question');
  const [searchTerm, setSearchTerm] = useState(routeParams.course_code || routeParams.subject_name || '');
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [selectedExamType, selectedYear, selectedSourceType]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedExamType !== 'all') params.exam_type = selectedExamType;
      if (selectedYear !== 'all') params.year = Number(selectedYear);
      if (selectedSourceType !== 'all') params.source_type = selectedSourceType;
      const list = await api.getQuestions(params);
      setQuestions(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      q.question_text.toLowerCase().includes(s) ||
      (q.course_code && q.course_code.toLowerCase().includes(s)) ||
      (q.course_title && q.course_title.toLowerCase().includes(s)) ||
      (q.subject_name && q.subject_name.toLowerCase().includes(s)) ||
      (q.institution_name && q.institution_name.toLowerCase().includes(s)) ||
      (q.topic_name && q.topic_name.toLowerCase().includes(s)) ||
      (q.source && q.source.toLowerCase().includes(s))
    );
  });

  const handleStartExamFromQuestions = () => {
    if (filteredQuestions.length === 0) {
      showToast('No questions available with current filter.', 'error');
      return;
    }
    const sample = filteredQuestions.slice(0, 20);
    const title = searchTerm
      ? `${searchTerm} Real Past Questions Drill`
      : 'Official Past Questions Simulation';

    startExamSession({
      title,
      exam_type: sample[0]?.exam_type || 'university',
      category_name: sample[0]?.course_code || sample[0]?.subject_name || 'Past Questions',
      difficulty: 'medium',
      source_type: 'real_past_question',
      questions: sample,
      duration_seconds: 1200,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Real Past Questions Library
            </h1>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Browse verified examination papers from official university departments and WAEC councils.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload-question')}
            className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-[#FFA05C] border border-white/12 transition-all cursor-pointer backdrop-blur-md"
          >
            Contribute a Past Paper
          </button>
          <button
            onClick={handleStartExamFromQuestions}
            disabled={filteredQuestions.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold shadow-lg shadow-[#FF6A00]/20 transition-all hover:scale-102 disabled:opacity-50 cursor-pointer border border-white/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Practice These Questions ({filteredQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Verified vs AI Notice Box */}
      <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-200 backdrop-blur-xl flex items-start gap-3 shadow-lg">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white">Source Integrity Commitment</div>
          <p className="leading-relaxed">
            All questions listed under <strong>"VERIFIED PAST QUESTION"</strong> are obtained directly from authorized institutional past examination papers and verified by university curriculum moderators. They are never AI-generated.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search UNILAG, CSC 201, MTH, 2024..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-md"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Exam Type */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10">
            {(['all', 'university', 'waec'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedExamType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  selectedExamType === t
                    ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {t === 'all' ? 'All Tracks' : t}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="px-3.5 py-2 text-xs bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-2xl text-white outline-none cursor-pointer backdrop-blur-md"
          >
            <option value="all" className="bg-[#1e1b4b] text-white">All Years</option>
            <option value="2024" className="bg-[#1e1b4b] text-white">2024 Exams</option>
            <option value="2023" className="bg-[#1e1b4b] text-white">2023 Exams</option>
            <option value="2022" className="bg-[#1e1b4b] text-white">2022 Exams</option>
            <option value="2021" className="bg-[#1e1b4b] text-white">2021 Exams</option>
          </select>

          {/* Source selector */}
          <select
            value={selectedSourceType}
            onChange={e => setSelectedSourceType(e.target.value)}
            className="px-3.5 py-2 text-xs bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-2xl text-white outline-none cursor-pointer backdrop-blur-md"
          >
            <option value="real_past_question" className="bg-[#1e1b4b] text-white">Verified Past Questions</option>
            <option value="ai_generated" className="bg-[#1e1b4b] text-white">AI Practice Questions</option>
            <option value="student_submitted" className="bg-[#1e1b4b] text-white">Student Submitted</option>
            <option value="all" className="bg-[#1e1b4b] text-white">All Sources</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="p-12 text-center text-slate-300 text-sm">
          Loading past examination questions...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl space-y-3 shadow-2xl">
          <p className="text-white font-bold text-base">No past questions matched your filter.</p>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Try adjusting your search term or select "All Sources" to see AI practice questions.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedExamType('all');
              setSelectedYear('all');
              setSelectedSourceType('all');
            }}
            className="px-4 py-2 bg-[#FF6A00] text-white text-xs font-bold rounded-2xl shadow-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-semibold">
            Showing {filteredQuestions.length} examination questions
          </div>

          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl"
            >
              {/* Question Header Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-[#FFA05C] bg-[#FF6A00]/15 px-2.5 py-0.5 rounded-full border border-[#FF6A00]/30 backdrop-blur-sm">
                    Q{idx + 1}
                  </span>
                  <VerificationBadge sourceType={q.source_type} status={q.verification_status} size="sm" />
                  <span className="text-xs font-bold text-white">
                    {q.course_code || q.subject_name}
                  </span>
                  {q.year && (
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{q.year}</span>
                    </span>
                  )}
                  {q.institution_name && (
                    <span className="text-[11px] text-slate-300 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{q.institution_name}</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setPreviewQuestion(previewQuestion?.id === q.id ? null : q)}
                  className="flex items-center gap-1 text-xs font-bold text-[#FFA05C] hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{previewQuestion?.id === q.id ? 'Hide Solution' : 'View Answer & Explanation'}</span>
                </button>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-white leading-relaxed">
                {q.question_text}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map(opt => {
                  const isCorrect = previewQuestion?.id === q.id && opt.id === q.correct_answer;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 transition-all backdrop-blur-sm ${
                        isCorrect
                          ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 shadow-md'
                          : 'bg-white/[0.03] border border-white/8 text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-white/[0.08] text-[#FFA05C]'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Solution / Explanation */}
              {previewQuestion?.id === q.id && (
                <div className="mt-3 p-5 rounded-2xl bg-white/[0.05] border border-[#FF6A00]/40 space-y-2 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FFA05C]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Correct Answer: Option ({q.correct_answer})</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {q.explanation}
                  </p>
                  <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400">
                    <strong>Source:</strong> {q.source}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
