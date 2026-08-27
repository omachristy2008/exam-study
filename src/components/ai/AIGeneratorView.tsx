import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  Layers,
  Sliders,
  CheckCircle2,
  Cpu,
  RefreshCw,
  BookOpen,
  Building2,
  GraduationCap,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ExamType, QuestionDifficulty, QuestionType, Question } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

export const AIGeneratorView: React.FC = () => {
  const { user, startExamSession, showToast, routeParams } = useApp();

  const [examType, setExamType] = useState<ExamType>(
    (routeParams.exam_type as ExamType) ||
      (user?.profile.education_type === 'waec' ? 'waec' : 'university')
  );
  const [subjectOrCourse, setSubjectOrCourse] = useState<string>(
    routeParams.defaultSubject ||
      (user?.profile.education_type === 'waec'
        ? user?.profile.selected_waec_subjects[0] || 'Mathematics'
        : user?.profile.selected_courses[0] || 'CSC 201: Data Structures')
  );
  const [topic, setTopic] = useState<string>(routeParams.defaultTopic || 'Trees & Binary Search Trees');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [patternMode, setPatternMode] = useState<boolean>(true);

  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const handleGenerate = async () => {
    if (!subjectOrCourse.trim()) {
      showToast('Please specify a subject or course', 'error');
      return;
    }

    setGenerating(true);
    setGeneratedQuestions(null);
    setGenerationStep('Analyzing authentic curriculum & exam blueprints...');

    try {
      setTimeout(() => {
        setGenerationStep('Synthesizing standard exam scenarios & distractor options...');
      }, 1000);

      setTimeout(() => {
        setGenerationStep('Generating verified step-by-step solution formulas...');
      }, 2200);

      const resp = await api.generateQuestions({
        exam_type: examType,
        subject_or_course: subjectOrCourse,
        topic: topic || undefined,
        difficulty,
        question_count: questionCount,
        question_type: questionType,
        pattern_mode: patternMode,
      });

      if (resp.success && resp.questions.length > 0) {
        setGeneratedQuestions(resp.questions);
        showToast(`Generated ${resp.questions.length} AI practice questions!`, 'success');
      } else {
        showToast('Could not generate questions. Please retry.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error generating questions', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartPractice = () => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    startExamSession({
      title: `${subjectOrCourse} AI Practice Drill`,
      exam_type: examType,
      category_name: subjectOrCourse,
      difficulty,
      source_type: 'ai_generated',
      questions: generatedQuestions,
      duration_seconds: questionCount * 90, // 1.5 mins per question
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Question Generator
          </h1>
          <Sparkles className="w-6 h-6 text-[#FF6A00]" />
        </div>
        <p className="text-sm text-slate-300 mt-1">
          Synthesize curriculum-aligned exam questions tailored to your target topic, difficulty, and standard university/WAEC formats.
        </p>
      </div>

      {/* Generator Configuration Card */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exam Track */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#FF6A00]" />
              <span>Target Examination Track</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExamType('university')}
                className={`py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  examType === 'university'
                    ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white border-white/20 shadow-lg shadow-[#FF6A00]/25'
                    : 'bg-white/[0.05] text-slate-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>University Exams</span>
              </button>

              <button
                type="button"
                onClick={() => setExamType('waec')}
                className={`py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  examType === 'waec'
                    ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white border-white/20 shadow-lg shadow-[#FF6A00]/25'
                    : 'bg-white/[0.05] text-slate-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>WAEC / WASSCE</span>
              </button>
            </div>
          </div>

          {/* Subject / Course Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#FF6A00]" />
              <span>{examType === 'waec' ? 'Subject Name' : 'Course Code / Name'}</span>
            </label>
            <input
              type="text"
              value={subjectOrCourse}
              onChange={e => setSubjectOrCourse(e.target.value)}
              placeholder={examType === 'waec' ? 'e.g., Mathematics, Physics, English' : 'e.g., CSC 201, MTH 101, CHM 205'}
              className="w-full px-4 py-3 text-sm bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-md transition-all"
            />
          </div>

          {/* Specific Topic */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#FF6A00]" />
              <span>Syllabus Topic (Optional)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g., Binary Search Trees, Trigonometry, Optics, Organic Chemistry"
              className="w-full px-4 py-3 text-sm bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-md transition-all"
            />
          </div>

          {/* Question Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#FF6A00]" />
              <span>Difficulty Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-2xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                    difficulty === d
                      ? 'bg-[#FF6A00]/20 text-[#FFA05C] border-[#FF6A00]/50 shadow-md shadow-[#FF6A00]/10 backdrop-blur-sm'
                      : 'bg-white/[0.05] text-slate-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white border-white/20 shadow-md shadow-[#FF6A00]/20'
                      : 'bg-white/[0.05] text-slate-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Question Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuestionType('multiple_choice')}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  questionType === 'multiple_choice'
                    ? 'bg-[#FF6A00]/20 text-[#FFA05C] border-[#FF6A00]/50 backdrop-blur-sm shadow-sm'
                    : 'bg-white/[0.05] text-slate-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                Multiple Choice (UTME/WAEC)
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('calculation')}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                  questionType === 'calculation'
                    ? 'bg-[#FF6A00]/20 text-[#FFA05C] border-[#FF6A00]/50 backdrop-blur-sm shadow-sm'
                    : 'bg-white/[0.05] text-slate-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                Calculation / Step-by-Step
              </button>
            </div>
          </div>
        </div>

        {/* Pattern Mode Toggle */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-white flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Practice from Real Exam Patterns</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mimics actual historical question framing, recurring test traps, and university grading conventions.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={patternMode}
              onChange={e => setPatternMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6A00]" />
          </label>
        </div>

        {/* Submit Generate CTA */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="relative z-10 w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#FF6A00]/25 transition-all hover:scale-101 disabled:opacity-50 cursor-pointer border border-white/20"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{generationStep || 'Generating AI questions...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate {questionCount} Practice Questions</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Questions Preview & Launch */}
      {generatedQuestions && generatedQuestions.length > 0 && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-[#FF6A00]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Generated Test Ready</h2>
                <VerificationBadge sourceType="ai_generated" size="sm" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {generatedQuestions.length} questions synthesized for {subjectOrCourse} ({difficulty} difficulty)
              </p>
            </div>

            <button
              onClick={handleStartPractice}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#FF6A00]/30 transition-all hover:scale-102 cursor-pointer border border-white/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Timed Test Now</span>
            </button>
          </div>

          {/* Question List Preview */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#FFA05C]">
                    Question {idx + 1} of {generatedQuestions.length}
                  </span>
                  <button
                    onClick={() => setPreviewQuestion(previewQuestion?.id === q.id ? null : q)}
                    className="text-xs font-bold text-[#FFA05C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{previewQuestion?.id === q.id ? 'Hide Explanation' : 'Inspect Explanation'}</span>
                  </button>
                </div>

                <p className="text-sm font-medium text-white">{q.question_text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map(opt => (
                    <div
                      key={opt.id}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-slate-200 flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-lg bg-white/[0.08] text-[#FFA05C] flex items-center justify-center font-bold text-[10px]">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                {previewQuestion?.id === q.id && (
                  <div className="p-4 bg-white/[0.04] border border-[#FF6A00]/30 rounded-2xl text-xs space-y-1 backdrop-blur-sm">
                    <div className="font-bold text-emerald-400">
                      Correct: Option ({q.correct_answer})
                    </div>
                    <p className="text-slate-300">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartPractice}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-101 cursor-pointer border border-white/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Practice Exam Session ({generatedQuestions.length} Questions)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
