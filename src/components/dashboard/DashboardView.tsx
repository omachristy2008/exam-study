import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Bot,
  Zap,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  RefreshCw,
  FileDown,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ExamResult } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { exportStudyAnalyticsPDF } from '../../utils/pdfExport';

export const DashboardView: React.FC = () => {
  const { user, navigate, startExamSession, showToast } = useApp();
  const [recentExams, setRecentExams] = useState<ExamResult[]>([]);
  const [allExams, setAllExams] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingQuickTest, setStartingQuickTest] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const history = await api.getExamResults();
      setAllExams(history);
      setRecentExams(history.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    setExportingPDF(true);
    try {
      exportStudyAnalyticsPDF({
        user,
        examHistory: allExams,
      });
      setPdfDownloaded(true);
      showToast('Performance & mock scores summary exported as PDF!', 'success');
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to generate PDF summary.', 'error');
    } finally {
      setExportingPDF(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick start a practice session for primary course/subject
  const handleQuickPractice = async () => {
    try {
      setStartingQuickTest(true);
      const isWaec = user?.profile.education_type === 'waec';
      const targetName = isWaec
        ? user?.profile.selected_waec_subjects[0] || 'Mathematics'
        : user?.profile.selected_courses[0] || 'CSC 201';

      // Load verified or AI practice questions
      const qList = await api.getQuestions({ limit: 10 });
      if (qList && qList.length > 0) {
        startExamSession({
          title: `${targetName} Quick Drill`,
          exam_type: isWaec ? 'waec' : 'university',
          category_name: targetName,
          difficulty: 'medium',
          source_type: 'real_past_question',
          questions: qList,
          duration_seconds: 600, // 10 minutes
        });
      } else {
        navigate('/practice');
      }
    } catch (e) {
      showToast('Could not launch quick drill. Opening practice hub.', 'info');
      navigate('/practice');
    } finally {
      setStartingQuickTest(false);
    }
  };

  const currentCourseOrSubject =
    allExams.length > 0
      ? allExams[0].category_name
      : user?.profile.education_type === 'waec'
      ? user?.profile.selected_waec_subjects?.[0] || 'WAEC Syllabus'
      : user?.profile.selected_courses?.[0] || 'University Curriculum';

  const hasStudied = allExams.length > 0;

  // Extract weak topics dynamically from real test history
  const realWeakAreas = (() => {
    if (!hasStudied) return [];
    const weakList: { topic: string; course: string; score: number; questions: string }[] = [];
    allExams.forEach(exam => {
      (exam.topic_breakdown || []).forEach(tb => {
        if (tb.percentage < 75 && !weakList.some(w => w.topic === tb.topic)) {
          weakList.push({
            topic: tb.topic,
            course: exam.category_name,
            score: tb.percentage,
            questions: `${tb.total - tb.correct} missed`,
          });
        }
      });
    });
    return weakList.slice(0, 4);
  })();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {user?.name || 'Student'} 👋</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            {hasStudied ? (
              <>
                Ready to study smarter? Your examination mastery is at{' '}
                <span className="text-[#FFA05C] font-bold">
                  {user?.profile.overall_mastery_percentage || Math.round(allExams.reduce((a, b) => a + b.score_percentage, 0) / allExams.length)}%
                </span>
                .
              </>
            ) : (
              <span>
                Welcome to EXAMAI! Complete your first practice test to calculate your mastery rating.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-[#FF6A00]/20 text-xs font-bold text-[#FFA05C] hover:text-white border border-white/12 hover:border-[#FF6A00]/40 backdrop-blur-md transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
            title="Download Study Performance Analytics & Mock Scores PDF"
          >
            {pdfDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>PDF Downloaded</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>{exportingPDF ? 'Generating...' : 'Export PDF'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/study-coach')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-200 border border-white/12 backdrop-blur-md transition-all hover:scale-102 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#FF6A00]" />
            <span>AI Study Coach</span>
          </button>

          <button
            onClick={handleQuickPractice}
            disabled={startingQuickTest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold shadow-lg shadow-[#FF6A00]/30 transition-all hover:scale-102 disabled:opacity-50 border border-white/20 cursor-pointer"
          >
            {startingQuickTest ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Start Quick Test</span>
          </button>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-2xl">
        {/* Subtle orange ambient backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFA05C] bg-[#FF6A00]/20 px-2.5 py-1 rounded-full border border-[#FF6A00]/35 backdrop-blur-md">
                {hasStudied ? 'Active Study Focus' : 'Get Started'}
              </span>
              <span className="text-xs text-slate-400">
                {user?.profile.education_type === 'both'
                  ? 'University & WAEC Track'
                  : user?.profile.education_type === 'waec'
                  ? 'WAEC Exam Track'
                  : 'University Course Track'}
              </span>
            </div>

            {hasStudied ? (
              <>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Continue Your Practice in {currentCourseOrSubject}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Recent Test: <span className="text-white font-semibold">{allExams[0]?.title}</span>. Score: <span className="text-[#FFA05C] font-bold">{allExams[0]?.score_percentage}%</span>. Keep up your momentum with another drill.
                </p>
                <div className="space-y-1.5 pt-2 max-w-md">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Recent Accuracy</span>
                    <span className="text-[#FFA05C]">{allExams[0]?.score_percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/[0.08] rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FFA05C] rounded-full transition-all duration-500 shadow-sm shadow-[#FF6A00]/40"
                      style={{ width: `${allExams[0]?.score_percentage || 0}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Start Your First Study Session
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Choose any course or WAEC subject to take a quick diagnostic test. EXAMAI will automatically generate your study reviews, topic accuracy charts, and customized revision plans as soon as you complete your first drill.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-semibold text-slate-300">
                    📚 Timed Simulations
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-semibold text-slate-300">
                    💡 Step-by-Step Solutions
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-semibold text-slate-300">
                    ⚡ AI Score Analysis
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              onClick={handleQuickPractice}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FF6A00]/30 transition-all hover:scale-102 cursor-pointer border border-white/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{hasStudied ? 'Resume Practice' : 'Start First Practice Test'}</span>
            </button>
            <button
              onClick={() => navigate('/practice')}
              className="w-full py-3 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFC] font-semibold text-xs border border-white/15 hover:border-[#FF6A00]/40 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#FFA05C]" />
              <span>Explore All Courses & Subjects</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Practice Test */}
        <button
          onClick={() => navigate('/practice')}
          className="text-left p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-[#FF6A00]/40 transition-all hover:-translate-y-1 group shadow-xl cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FF6A00]/15 border border-[#FF6A00]/30 backdrop-blur-md flex items-center justify-center text-[#FF7A1A] mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-[#FFA05C] transition-colors">
            Practice Test Hub
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Explore WAEC subjects & University courses with timed simulation tests.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#FFA05C]">
            <span>Explore courses</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 2: Past Questions */}
        <button
          onClick={() => navigate('/past-questions')}
          className="text-left p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 transition-all hover:-translate-y-1 group shadow-xl cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-900/30 border border-emerald-400/30 backdrop-blur-md flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
            Past Questions
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Verified official exam papers from UNILAG, UI, OAU, WAEC 2021-2024.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-400">
            <span>Browse library</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 3: AI Generator */}
        <button
          onClick={() => navigate('/ai-generator')}
          className="text-left p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-[#FF6A00]/40 transition-all hover:-translate-y-1 group shadow-xl cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FF6A00]/15 border border-[#FF6A00]/30 backdrop-blur-md flex items-center justify-center text-[#FF7A1A] mb-3 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-[#FFA05C] transition-colors">
            AI Question Generator
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Custom-generate exam questions tailored to your topic, difficulty & count.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#FFA05C]">
            <span>Build custom test</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 4: AI Tutor */}
        <button
          onClick={() => navigate('/ai-tutor')}
          className="text-left p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 transition-all hover:-translate-y-1 group shadow-xl cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-900/30 border border-purple-400/30 backdrop-blur-md flex items-center justify-center text-purple-300 mb-3 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
            AI Subject Tutor
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Ask any question, get step-by-step formula breakdowns and explanations.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-400">
            <span>Start chat</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Progress, Weak Areas & Recent Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Tests & Weak Areas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weak Areas Module */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-base">Identified Weak Areas</h3>
              </div>
              {hasStudied && (
                <button
                  onClick={() => navigate('/progress')}
                  className="text-xs font-bold text-[#FFA05C] hover:underline"
                >
                  View Analytics
                </button>
              )}
            </div>

            {!hasStudied || realWeakAreas.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/6 text-center space-y-2">
                <div className="text-sm font-semibold text-white">No weak areas identified yet</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Take practice drills or timed tests. When you miss questions, EXAMAI will automatically isolate those topics here for targeted practice.
                </p>
                <button
                  onClick={() => navigate('/practice')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF6A00]/15 hover:bg-[#FF6A00] text-[#FFA05C] hover:text-white font-bold text-xs border border-[#FF6A00]/30 transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start a Practice Drill</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {realWeakAreas.map(item => (
                  <div
                    key={item.topic}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 flex items-center justify-between gap-3 hover:border-[#FF6A00]/30 transition-all"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{item.topic}</div>
                      <div className="text-xs text-slate-400">{item.course} • {item.questions}</div>
                    </div>
                    <button
                      onClick={() => navigate('/ai-generator', { defaultTopic: item.topic, defaultSubject: item.course })}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FF6A00]/15 hover:bg-[#FF6A00] text-[#FFA05C] hover:text-white font-bold text-xs border border-[#FF6A00]/30 backdrop-blur-sm transition-all cursor-pointer shadow-sm"
                    >
                      Drill Topic
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Completed Tests */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Test History</span>
              </h3>
              {recentExams.length > 0 && (
                <button
                  onClick={() => navigate('/progress')}
                  className="text-xs font-bold text-[#FFA05C] hover:underline"
                >
                  All Results ({recentExams.length})
                </button>
              )}
            </div>

            {recentExams.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/6 space-y-2">
                <div className="text-sm font-semibold text-white">No tests completed yet</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your completed exams and full solution reviews will appear here immediately after your first test.
                </p>
                <button
                  onClick={() => navigate('/practice')}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white font-bold text-xs shadow-md shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Take First Test</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map(exam => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{exam.category_name}</span>
                        <VerificationBadge sourceType={exam.source_type} size="sm" />
                      </div>
                      <div className="text-xs text-slate-400">
                        {exam.total_questions} Questions • {Math.round(exam.time_used_seconds / 60)} mins used • {new Date(exam.completed_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span
                          className={`text-lg font-black ${
                            exam.score_percentage >= 75
                              ? 'text-emerald-400'
                              : exam.score_percentage >= 50
                              ? 'text-amber-400'
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
                        className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/12 hover:border-[#FF6A00]/40 backdrop-blur-sm transition-all"
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

        {/* Right Col: AI Study Coach Recommendation & Academic Quick Stats */}
        <div className="space-y-6">
          {/* AI Coach Daily Recommendation */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6A00]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-[#FFA05C]">
              <Zap className="w-5 h-5 fill-[#FF6A00]" />
              <h3 className="font-bold text-white text-base">
                {hasStudied ? "Today's AI Study Plan" : "Orientation Study Plan"}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {hasStudied ? (
                <>
                  Based on your recent tests in <strong className="text-white">{currentCourseOrSubject}</strong>, here is your 45-minute mastery roadmap:
                </>
              ) : (
                <>
                  Welcome to EXAMAI! Complete these 3 quick milestones to generate your personalized AI study diagnosis:
                </>
              )}
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{hasStudied ? '1. Concept Review' : '1. Explore Question Hub'}</span>
                  <span className="text-[#FFA05C]">10 min</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {hasStudied
                    ? 'Review missed formulas and theoretical principles'
                    : 'Browse past questions across university & WAEC subjects'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{hasStudied ? '2. Practice 10 Exam Questions' : '2. Take Baseline Test'}</span>
                  <span className="text-[#FFA05C]">15 min</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {hasStudied
                    ? 'Targeted drills focusing on identified weak spots'
                    : '10-question drill to establish your baseline score'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{hasStudied ? '3. Mini Speed Simulator' : '3. AI Tutor Consultation'}</span>
                  <span className="text-[#FFA05C]">10 min</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {hasStudied
                    ? 'Timed speed drill with 1-click answer breakdown'
                    : 'Ask the tutor for analogies, mnemonics, and exam tips'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(hasStudied ? '/study-coach' : '/practice')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer border border-white/20"
            >
              <span>{hasStudied ? 'Open Study Coach' : 'Start Baseline Practice'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Academic Profile Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-3 shadow-xl">
            <h3 className="font-bold text-white text-sm">Your Academic Profile</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/8">
                <span className="text-slate-400">University:</span>
                <span className="font-semibold text-white truncate max-w-[160px]">
                  {user?.profile.custom_university_name || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/8">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-white truncate max-w-[160px]">
                  {user?.profile.custom_department_name || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/8">
                <span className="text-slate-400">Level:</span>
                <span className="font-semibold text-white">
                  {user?.profile.level ? `${user.profile.level} Level` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Active Courses:</span>
                <span className="font-semibold text-[#FFA05C]">
                  {user?.profile.selected_courses?.length || 0} Selected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="py-2.5 px-3 text-xs font-semibold text-[#FFA05C] hover:text-white bg-white/[0.04] hover:bg-[#FF6A00]/20 rounded-2xl border border-white/10 hover:border-[#FF6A00]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{exportingPDF ? 'Exporting...' : 'Export PDF'}</span>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="py-2.5 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl border border-white/10 transition-all cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
