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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ExamResult } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

export const DashboardView: React.FC = () => {
  const { user, navigate, startExamSession, showToast } = useApp();
  const [recentExams, setRecentExams] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingQuickTest, setStartingQuickTest] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const history = await api.getExamResults();
      setRecentExams(history.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    user?.profile.education_type === 'waec'
      ? user?.profile.selected_waec_subjects[0] || 'Mathematics'
      : user?.profile.selected_courses[0] || 'CSC 201: Data Structures';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {user?.name || 'Student'} 👋</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            Ready to study smarter? Your examination mastery is at{' '}
            <span className="text-[#FFA05C] font-bold">
              {user?.profile.overall_mastery_percentage || 78}%
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/study-coach')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-[#FFA05C] border border-[#FF6A00]/35 backdrop-blur-md transition-all hover:scale-102"
          >
            <Zap className="w-4 h-4 text-[#FF6A00]" />
            <span>AI Study Coach</span>
          </button>
          <button
            onClick={handleQuickPractice}
            disabled={startingQuickTest}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold shadow-lg shadow-[#FF6A00]/30 transition-all hover:scale-102 disabled:opacity-50 border border-white/20"
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

      {/* Main Focus Card: "Continue your practice" */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-2xl">
        {/* Subtle orange ambient backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFA05C] bg-[#FF6A00]/20 px-2.5 py-1 rounded-full border border-[#FF6A00]/35 backdrop-blur-md">
                Active Study Focus
              </span>
              <span className="text-xs text-slate-400">
                {user?.profile.education_type === 'both'
                  ? 'University & WAEC Track'
                  : user?.profile.education_type === 'waec'
                  ? 'WAEC Exam Track'
                  : 'University Course Track'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Continue Your Practice in {currentCourseOrSubject}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Topic: <span className="text-white font-semibold">Trees & Binary Search Trees</span>. 12 questions remaining to unlock the Next Mastery Milestone.
            </p>

            {/* Progress bar */}
            <div className="space-y-1.5 pt-2 max-w-md">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Topic Progress</span>
                <span className="text-[#FFA05C]">65% Complete</span>
              </div>
              <div className="h-2.5 w-full bg-white/[0.08] rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FFA05C] rounded-full transition-all duration-500 shadow-sm shadow-[#FF6A00]/40"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              onClick={handleQuickPractice}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FF6A00]/30 transition-all hover:scale-102 cursor-pointer border border-white/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume Session</span>
            </button>
            <button
              onClick={() => navigate('/ai-generator', { defaultTopic: 'Trees & Binary Search Trees', defaultSubject: currentCourseOrSubject })}
              className="w-full py-3 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFC] font-semibold text-xs border border-white/15 hover:border-[#FF6A00]/40 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFA05C]" />
              <span>Generate AI Practice Drill</span>
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
              <button
                onClick={() => navigate('/progress')}
                className="text-xs font-bold text-[#FFA05C] hover:underline"
              >
                View Analytics
              </button>
            </div>

            <div className="space-y-3">
              {[
                { topic: 'Trees & Binary Search Trees', course: 'CSC 201', score: 60, questions: '5 missed' },
                { topic: 'Trigonometry & Bearings', course: 'WAEC Mathematics', score: 65, questions: '4 missed' },
                { topic: 'Asymptotic Analysis & Big-O', course: 'CSC 201', score: 58, questions: '3 missed' },
              ].map(item => (
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
          </div>

          {/* Recent Completed Tests */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Test History</span>
              </h3>
              <button
                onClick={() => navigate('/progress')}
                className="text-xs font-bold text-[#FFA05C] hover:underline"
              >
                All Results ({recentExams.length})
              </button>
            </div>

            {recentExams.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No tests completed yet. Take your first practice exam!
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
              <h3 className="font-bold text-white text-base">Today's AI Study Plan</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your recent tests in <strong className="text-white">CSC 201</strong> & <strong className="text-white">WAEC Mathematics</strong>, here is your 45-minute mastery roadmap for today:
            </p>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>1. Review Sorting & BST</span>
                  <span className="text-[#FFA05C]">15 min</span>
                </div>
                <p className="text-[11px] text-slate-400">Clarify worst-case rotations and Big-O invariants</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>2. Practice 10 Exam Questions</span>
                  <span className="text-[#FFA05C]">20 min</span>
                </div>
                <p className="text-[11px] text-slate-400">Solve medium & hard level questions</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>3. Mini Speed Simulator</span>
                  <span className="text-[#FFA05C]">10 min</span>
                </div>
                <p className="text-[11px] text-slate-400">Timed speed drill with 1-click results</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/study-coach')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer border border-white/20"
            >
              <span>Open Study Coach</span>
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
                  {user?.profile.custom_university_name || 'University of Lagos'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/8">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-white">
                  {user?.profile.custom_department_name || 'Computer Science'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/8">
                <span className="text-slate-400">Level:</span>
                <span className="font-semibold text-white">
                  {user?.profile.level || '200'} Level
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Active Courses:</span>
                <span className="font-semibold text-[#FFA05C]">
                  {user?.profile.selected_courses?.length || 4} Selected
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="w-full py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl border border-white/10 transition-all"
            >
              Edit Academic Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
