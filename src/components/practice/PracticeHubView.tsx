import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Building2,
  GraduationCap,
  Search,
  ChevronRight,
  Filter,
  Play,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { University, Faculty, Department, Course, WAECSubject, Topic, Question } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';
import { SearchableSelectModal } from '../common/SearchableSelectModal';

export const PracticeHubView: React.FC = () => {
  const { user, navigate, startExamSession, showToast, routeParams } = useApp();

  const [activeTab, setActiveTab] = useState<'waec' | 'university'>(
    (routeParams.track as 'waec' | 'university') ||
      (user?.profile.education_type === 'waec' ? 'waec' : 'university')
  );

  // University track state
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('200');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetail, setCourseDetail] = useState<(Course & { topics: Topic[]; questions_count: number }) | null>(null);

  // WAEC track state
  const [subjects, setSubjects] = useState<WAECSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<WAECSubject | null>(null);
  const [subjectDetail, setSubjectDetail] = useState<(WAECSubject & { topics: Topic[]; questions_count: number }) | null>(null);
  const [waecCategory, setWaecCategory] = useState<string>('All');

  // Search & Modals
  const [searchTerm, setSearchTerm] = useState('');
  const [showUniSelectModal, setShowUniSelectModal] = useState(false);
  const [showFacultySelectModal, setShowFacultySelectModal] = useState(false);
  const [showDeptSelectModal, setShowDeptSelectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [uniList, subjList, courseList] = await Promise.all([
        api.getUniversities(),
        api.getSubjects(),
        api.getCourses(),
      ]);
      setUniversities(uniList);
      setSubjects(subjList);
      setCourses(courseList);

      // Default university to UNILAG if available
      if (uniList.length > 0) {
        setSelectedUniversity(uniList[0]);
        loadFacultiesForUni(uniList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadFacultiesForUni = async (uniId: string) => {
    try {
      const facList = await api.getFaculties(uniId);
      setFaculties(facList);
      if (facList.length > 0) {
        setSelectedFaculty(facList[0]);
        loadDepartmentsForFaculty(facList[0].id, uniId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDepartmentsForFaculty = async (facultyId: string, uniId: string) => {
    try {
      const deptList = await api.getDepartments(facultyId, uniId);
      setDepartments(deptList);
      if (deptList.length > 0) {
        setSelectedDepartment(deptList[0]);
        loadCoursesForDept(deptList[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCoursesForDept = async (deptId: string) => {
    try {
      const cList = await api.getCourses({ department_id: deptId, level: selectedLevel });
      setCourses(cList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    try {
      const detail = await api.getCourseDetail(course.id);
      setCourseDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSubject = async (subject: WAECSubject) => {
    setSelectedSubject(subject);
    try {
      const detail = await api.getSubjectDetail(subject.id);
      setSubjectDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  // Launch Exam Simulator
  const startSimulator = async (type: 'waec' | 'university', targetTitle: string, id: string) => {
    try {
      let questionsList: Question[] = [];
      if (type === 'university') {
        questionsList = await api.getQuestions({ course_id: id, limit: 20 });
      } else {
        questionsList = await api.getQuestions({ subject_id: id, limit: 20 });
      }

      if (questionsList.length === 0) {
        // Generate AI questions on the fly for complete exam simulation
        const aiResp = await api.generateQuestions({
          exam_type: type,
          subject_or_course: targetTitle,
          difficulty: 'medium',
          question_count: 15,
          question_type: 'multiple_choice',
        });
        questionsList = aiResp.questions;
      }

      startExamSession({
        title: `${targetTitle} Timed Examination Simulator`,
        exam_type: type,
        category_name: targetTitle,
        difficulty: 'medium',
        source_type: 'mixed',
        questions: questionsList,
        duration_seconds: 1200, // 20 minutes
      });
    } catch (e) {
      showToast('Could not initiate simulator session. Please try again.', 'error');
    }
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesCat = waecCategory === 'All' || s.category === waecCategory;
    const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredCourses = courses.filter(c => {
    return (
      !searchTerm ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Track Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Practice Hub</span>
            <Sparkles className="w-6 h-6 text-[#FF6A00]" />
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Select an examination path to browse courses, past papers, and AI simulators.
          </p>
        </div>

        {/* Track Segmented Control */}
        <div className="p-1 bg-white/[0.05] border border-white/12 backdrop-blur-xl rounded-2xl flex items-center gap-1 self-start sm:self-auto shadow-lg">
          <button
            onClick={() => {
              setActiveTab('university');
              setSelectedSubject(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'university'
                ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white shadow-md shadow-[#FF6A00]/25 border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>University Exams</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('waec');
              setSelectedCourse(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'waec'
                ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white shadow-md shadow-[#FF6A00]/25 border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>WAEC / WASSCE</span>
          </button>
        </div>
      </div>

      {/* ======================= UNIVERSITY TRACK ======================= */}
      {activeTab === 'university' && (
        <div className="space-y-6">
          {/* If looking at Course Detail View */}
          {selectedCourse && courseDetail ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <button
                onClick={() => setSelectedCourse(null)}
                className="flex items-center gap-2 text-xs font-bold text-[#FFA05C] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to course directory</span>
              </button>

              {/* Course Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-[#FF6A00]/20 text-[#FFA05C] font-black text-sm border border-[#FF6A00]/35 backdrop-blur-sm">
                      {courseDetail.code}
                    </span>
                    <span className="text-xs text-slate-300">
                      {selectedUniversity?.short_name || 'UNILAG'} • Level {courseDetail.level} • {courseDetail.semester} Semester
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Course Mastery</div>
                      <div className="text-base font-extrabold text-[#FFA05C]">{courseDetail.mastery_percentage || 78}%</div>
                    </div>
                  </div>
                </div>

                <h2 className="relative z-10 text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {courseDetail.title}
                </h2>
                <p className="relative z-10 text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {courseDetail.description || 'Master fundamental concepts, algorithmic proofs, and theoretical exam questions.'}
                </p>

                {/* CTAs */}
                <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => startSimulator('university', `${courseDetail.code}: ${courseDetail.title}`, courseDetail.id)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer border border-white/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch Exam Simulator (20 Qs)</span>
                  </button>

                  <button
                    onClick={() => navigate('/past-questions', { course_code: courseDetail.code })}
                    className="px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs border border-white/12 flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Real Past Questions ({courseDetail.questions_count})</span>
                  </button>

                  <button
                    onClick={() => navigate('/ai-generator', { defaultSubject: courseDetail.code, course_code: courseDetail.code })}
                    className="px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[#FFA05C] font-semibold text-xs border border-[#FF6A00]/30 flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#FF7A1A]" />
                    <span>Generate AI Practice</span>
                  </button>
                </div>
              </div>

              {/* Topics Breakdown */}
              <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF6A00]" />
                  <span>Syllabus Topics & Mastery Breakdown</span>
                </h3>

                <div className="space-y-3">
                  {courseDetail.topics.map(topic => (
                    <div
                      key={topic.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-sm text-white">{topic.name}</div>
                        <div className="text-xs text-slate-400">{topic.question_count || 15} practice questions available</div>
                        <div className="w-full max-w-xs h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-[#FF6A00] rounded-full"
                            style={{ width: `${topic.mastery_percentage || 65}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-xs font-bold text-[#FFA05C] mr-2">{topic.mastery_percentage || 65}%</span>
                        <button
                          onClick={() => navigate('/ai-generator', { defaultTopic: topic.name, defaultSubject: courseDetail.code })}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FF6A00]/15 hover:bg-[#FF6A00] text-[#FFA05C] hover:text-white font-bold text-xs border border-[#FF6A00]/30 transition-all cursor-pointer backdrop-blur-sm"
                        >
                          Practice Topic
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* University Hierarchy Selector & Course Browser */
            <div className="space-y-6">
              {/* Selectors Bar */}
              <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-xl">
                {/* 1. University Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    1. University
                  </label>
                  <button
                    onClick={() => setShowUniSelectModal(true)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/12 hover:border-[#FF6A00]/50 text-left flex items-center justify-between text-xs font-bold text-white backdrop-blur-md transition-all cursor-pointer"
                  >
                    <span className="truncate">{selectedUniversity?.name || 'Select University'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                </div>

                {/* 2. Faculty Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    2. Faculty
                  </label>
                  <button
                    onClick={() => setShowFacultySelectModal(true)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/12 hover:border-[#FF6A00]/50 text-left flex items-center justify-between text-xs font-bold text-white backdrop-blur-md transition-all cursor-pointer"
                  >
                    <span className="truncate">{selectedFaculty?.name || 'Select Faculty'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                </div>

                {/* 3. Department Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    3. Department
                  </label>
                  <button
                    onClick={() => setShowDeptSelectModal(true)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/12 hover:border-[#FF6A00]/50 text-left flex items-center justify-between text-xs font-bold text-white backdrop-blur-md transition-all cursor-pointer"
                  >
                    <span className="truncate">{selectedDepartment?.name || 'Select Department'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                </div>

                {/* 4. Level Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    4. Level
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {['100', '200', '300', '400', '500'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setSelectedLevel(lvl);
                          if (selectedDepartment) loadCoursesForDept(selectedDepartment.id);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedLevel === lvl
                            ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white shadow-md shadow-[#FF6A00]/25'
                            : 'bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Search & Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white">
                    Available Courses ({filteredCourses.length})
                  </h2>
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search course code or title..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-md transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map(course => (
                    <div
                      key={course.id}
                      className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-[#FF6A00]/40 transition-all flex flex-col justify-between group cursor-pointer shadow-xl hover:-translate-y-1"
                      onClick={() => handleSelectCourse(course)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FF6A00]/15 text-[#FFA05C] font-extrabold text-xs border border-[#FF6A00]/30 backdrop-blur-sm">
                            {course.code}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {course.semester} Semester
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base group-hover:text-[#FFA05C] transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {course.description || 'Master data structures, algorithmic paradigms, and semester examination standards.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{course.question_count || 45} Questions</span>
                        <div className="flex items-center gap-1 font-bold text-[#FFA05C]">
                          <span>Open Course</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= WAEC TRACK ======================= */}
      {activeTab === 'waec' && (
        <div className="space-y-6">
          {/* If looking at Subject Detail View */}
          {selectedSubject && subjectDetail ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <button
                onClick={() => setSelectedSubject(null)}
                className="flex items-center gap-2 text-xs font-bold text-[#FFA05C] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to WAEC subjects</span>
              </button>

              {/* Subject Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-[#FF6A00]/20 text-[#FFA05C] font-black text-sm border border-[#FF6A00]/35 backdrop-blur-sm">
                      WAEC {subjectDetail.name}
                    </span>
                    <span className="text-xs text-slate-300">{subjectDetail.category} Division</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Subject Mastery</div>
                    <div className="text-base font-extrabold text-[#FFA05C]">{subjectDetail.mastery_percentage || 80}%</div>
                  </div>
                </div>

                <h2 className="relative z-10 text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {subjectDetail.name} Examination Syllabus
                </h2>
                <p className="relative z-10 text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {subjectDetail.description || 'Full coverage of WASSCE May/June & Nov/Dec syllabus papers, theory parts, and objective practice drills.'}
                </p>

                {/* CTAs */}
                <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => startSimulator('waec', `WAEC ${subjectDetail.name}`, subjectDetail.id)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer border border-white/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch WAEC Exam Simulator (20 Qs)</span>
                  </button>

                  <button
                    onClick={() => navigate('/past-questions', { subject_name: subjectDetail.name })}
                    className="px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs border border-white/12 flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Real Past Questions (2021-2024)</span>
                  </button>

                  <button
                    onClick={() => navigate('/ai-generator', { defaultSubject: subjectDetail.name, exam_type: 'waec' })}
                    className="px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[#FFA05C] font-semibold text-xs border border-[#FF6A00]/30 flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#FF7A1A]" />
                    <span>AI Practice Drill</span>
                  </button>
                </div>
              </div>

              {/* Topics Breakdown */}
              <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF6A00]" />
                  <span>WAEC Curriculum Topics</span>
                </h3>

                <div className="space-y-3">
                  {subjectDetail.topics.map(topic => (
                    <div
                      key={topic.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-sm text-white">{topic.name}</div>
                        <div className="text-xs text-slate-400">{topic.question_count || 30} verified past & AI drill questions</div>
                        <div className="w-full max-w-xs h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-[#FF6A00] rounded-full"
                            style={{ width: `${topic.mastery_percentage || 75}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-xs font-bold text-[#FFA05C] mr-2">{topic.mastery_percentage || 75}%</span>
                        <button
                          onClick={() => navigate('/ai-generator', { defaultTopic: topic.name, defaultSubject: subjectDetail.name, exam_type: 'waec' })}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FF6A00]/15 hover:bg-[#FF6A00] text-[#FFA05C] hover:text-white font-bold text-xs border border-[#FF6A00]/30 transition-all cursor-pointer backdrop-blur-sm"
                        >
                          Practice Topic
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* WAEC Subject Browser Grid */
            <div className="space-y-6">
              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
                  {['All', 'General', 'Science', 'Arts', 'Commercial'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setWaecCategory(cat)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                        waecCategory === cat
                          ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white shadow-md shadow-[#FF6A00]/25'
                          : 'bg-white/[0.05] border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search WAEC subject..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/[0.05] border border-white/12 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-md transition-all"
                  />
                </div>
              </div>

              {/* Subject Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map(subj => (
                  <div
                    key={subj.id}
                    className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-[#FF6A00]/40 transition-all flex flex-col justify-between group cursor-pointer shadow-xl hover:-translate-y-1"
                    onClick={() => handleSelectSubject(subj)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-900/30 text-emerald-300 font-extrabold text-xs border border-emerald-400/30 backdrop-blur-sm">
                          {subj.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {subj.topics_count || 4} Core Topics
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-[#FFA05C] transition-colors">
                        {subj.name}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {subj.description || 'Comprehensive WAEC syllabus questions with verified answer keys.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{subj.question_count || 180} Questions</span>
                      <div className="flex items-center gap-1 font-bold text-[#FFA05C]">
                        <span>Open Syllabus</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Select Modals */}
      <SearchableSelectModal
        isOpen={showUniSelectModal}
        onClose={() => setShowUniSelectModal(false)}
        title="Select Target University"
        options={universities.map(u => ({ id: u.id, name: u.name, subtitle: `${u.short_name || ''} • ${u.state || ''}, ${u.country}` }))}
        selectedValue={selectedUniversity?.id}
        onSelect={opt => {
          const match = universities.find(u => u.id === opt.id);
          if (match) {
            setSelectedUniversity(match);
            loadFacultiesForUni(match.id);
          }
        }}
        type="university"
      />

      <SearchableSelectModal
        isOpen={showFacultySelectModal}
        onClose={() => setShowFacultySelectModal(false)}
        title="Select Faculty"
        options={faculties.map(f => ({ id: f.id, name: f.name }))}
        selectedValue={selectedFaculty?.id}
        onSelect={opt => {
          const match = faculties.find(f => f.id === opt.id);
          if (match && selectedUniversity) {
            setSelectedFaculty(match);
            loadDepartmentsForFaculty(match.id, selectedUniversity.id);
          }
        }}
        type="faculty"
      />

      <SearchableSelectModal
        isOpen={showDeptSelectModal}
        onClose={() => setShowDeptSelectModal(false)}
        title="Select Department"
        options={departments.map(d => ({ id: d.id, name: d.name }))}
        selectedValue={selectedDepartment?.id}
        onSelect={opt => {
          const match = departments.find(d => d.id === opt.id);
          if (match) {
            setSelectedDepartment(match);
            loadCoursesForDept(match.id);
          }
        }}
        type="department"
      />
    </div>
  );
};
