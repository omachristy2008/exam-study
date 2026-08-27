import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  BookOpen,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PlusCircle,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { University, Faculty, Department, Course, WAECSubject, ExamType } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

export const OnboardingView: React.FC = () => {
  const { user, updateAcademicProfile, navigate, showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [educationType, setEducationType] = useState<ExamType>(user?.profile.education_type || 'both');

  // University state
  const [universities, setUniversities] = useState<University[]>([]);
  const [uniSearch, setUniSearch] = useState('');
  const [selectedUniId, setSelectedUniId] = useState<string | null>(user?.profile.university_id || null);
  const [isCustomUni, setIsCustomUni] = useState<boolean>(false);
  const [customUniName, setCustomUniName] = useState<string>('');

  // Faculty state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(user?.profile.faculty_id || null);
  const [isCustomFaculty, setIsCustomFaculty] = useState<boolean>(false);
  const [customFacultyName, setCustomFacultyName] = useState<string>('');

  // Department state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(user?.profile.department_id || null);
  const [isCustomDept, setIsCustomDept] = useState<boolean>(false);
  const [customDeptName, setCustomDeptName] = useState<string>('');

  // Level & Semester
  const [level, setLevel] = useState<string>(user?.profile.level || '100');
  const [semester, setSemester] = useState<'1st' | '2nd'>(user?.profile.semester || '1st');

  // Course & WAEC Selection
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<WAECSubject[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(user?.profile.selected_courses || []);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user?.profile.selected_waec_subjects || []);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load initial academic dataset
  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    setLoading(true);
    try {
      const [unis, facs, depts, courses, subjects] = await Promise.all([
        api.getUniversities(),
        api.getFaculties(selectedUniId || undefined),
        api.getDepartments(selectedFacultyId || undefined),
        api.getCourses(),
        api.getSubjects(),
      ]);
      setUniversities(unis);
      setFaculties(facs);
      setDepartments(depts);
      setAvailableCourses(courses);
      setAvailableSubjects(subjects);
    } catch (e) {
      console.error('Failed to load academic entities:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnis = universities.filter(u =>
    u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
    (u.short_name && u.short_name.toLowerCase().includes(uniSearch.toLowerCase()))
  );

  const toggleCourse = (code: string) => {
    setSelectedCourses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleSubject = (name: string) => {
    setSelectedSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleFinishOnboarding = async () => {
    setSaving(true);
    try {
      await updateAcademicProfile({
        education_type: educationType,
        university_id: isCustomUni ? null : selectedUniId,
        custom_university_name: isCustomUni ? customUniName : null,
        faculty_id: isCustomFaculty ? null : selectedFacultyId,
        custom_faculty_name: isCustomFaculty ? customFacultyName : null,
        department_id: isCustomDept ? null : selectedDeptId,
        custom_department_name: isCustomDept ? customDeptName : null,
        level: educationType !== 'waec' ? level : null,
        semester: educationType !== 'waec' ? semester : null,
        selected_courses: selectedCourses,
        selected_waec_subjects: selectedSubjects,
      });

      showToast('Welcome to EXAMAI! Your study dashboard is ready.', 'success');
      navigate('/dashboard');
    } catch (e) {
      showToast('Could not save academic profile preferences.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F5] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Brand Header & Steps Tracker */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
            Academic Profile Setup
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            Personalize your study experience with your syllabus and university curriculum.
          </p>

          {/* Stepper Pill Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-[#FF6A00]'
                    : s < step
                    ? 'w-4 bg-emerald-500'
                    : 'w-4 bg-[#27272C]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Education Track */}
        {step === 1 && (
          <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#F5F5F5]">1. Select Your Exam Preparation Path</h2>
              <p className="text-xs text-[#A1A1AA]">
                Choose your focus area. You can access all past questions regardless of this choice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'both',
                  title: 'Both University & WAEC',
                  desc: 'Full access to 100L-500L degree courses and WAEC SSCE subjects.',
                  icon: Sparkles,
                },
                {
                  id: 'university',
                  title: 'University Examinations',
                  desc: 'Undergraduate past papers, faculty tests, and lecture course modules.',
                  icon: GraduationCap,
                },
                {
                  id: 'waec',
                  title: 'WAEC / SSCE',
                  desc: 'Senior secondary curriculum past questions, theory, and mock trials.',
                  icon: BookOpen,
                },
              ].map(opt => {
                const isSelected = educationType === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEducationType(opt.id as ExamType)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1E] border-[#FF6A00] text-white shadow-md'
                        : 'bg-[#1A1A1E] border-[#27272C] text-[#A1A1AA] hover:text-white hover:border-[#71717A]'
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-[#151518] border border-[#27272C] flex items-center justify-center mb-3">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FF6A00]' : 'text-[#A1A1AA]'}`} />
                      </div>
                      <div className="text-sm font-bold text-[#F5F5F5] mb-1">{opt.title}</div>
                      <div className="text-[11px] text-[#71717A] leading-relaxed">{opt.desc}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                      <span className={isSelected ? 'text-[#FF6A00]' : 'text-transparent'}>Selected</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-[#71717A]'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#27272C] flex justify-end">
              <button
                type="button"
                onClick={() => setStep(educationType === 'waec' ? 3 : 2)}
                className="px-6 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: University & Institution Selection (Searchable + Other) */}
        {step === 2 && (
          <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#F5F5F5]">2. Select Your University or Institution</h2>
              <p className="text-xs text-[#A1A1AA]">
                Select from verified Nigerian universities or enter your custom institution.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={uniSearch}
                onChange={e => setUniSearch(e.target.value)}
                placeholder="Search university (e.g. UNILAG, UI, OAU, UNIBEN, Covenant)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* University List Grid */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredUnis.map(u => {
                const isSelected = !isCustomUni && selectedUniId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUniId(u.id);
                      setIsCustomUni(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1E] border-[#FF6A00] text-white'
                        : 'bg-[#1A1A1E] border-[#27272C] text-[#A1A1AA] hover:text-white hover:border-[#71717A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#151518] border border-[#27272C] flex items-center justify-center font-bold text-xs text-[#FF6A00]">
                        {u.short_name || u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#F5F5F5]">{u.name}</div>
                        <div className="text-[10px] text-[#71717A]">{u.state}, Nigeria</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />}
                  </button>
                );
              })}

              {/* Other / Not Listed option */}
              <button
                type="button"
                onClick={() => {
                  setIsCustomUni(true);
                  setSelectedUniId(null);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isCustomUni
                    ? 'bg-[#1A1A1E] border-[#FF6A00] text-white'
                    : 'bg-[#1A1A1E] border-[#27272C] text-[#A1A1AA] hover:text-white hover:border-[#71717A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#151518] border border-[#27272C] flex items-center justify-center text-[#FF6A00]">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F5F5F5]">+ Other / Not Listed Institution</div>
                    <div className="text-[10px] text-[#71717A]">Type your custom university or polytechnic name</div>
                  </div>
                </div>
                {isCustomUni && <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />}
              </button>
            </div>

            {/* If Other is selected, show text field */}
            {isCustomUni && (
              <div className="p-4 rounded-xl bg-[#1A1A1E] border border-[#27272C] space-y-2 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-[#A1A1AA]">
                  Enter Your University Name
                </label>
                <input
                  type="text"
                  value={customUniName}
                  onChange={e => setCustomUniName(e.target.value)}
                  placeholder="e.g. Lead City University or Federal Poly, Ilaro"
                  className="w-full px-3.5 py-2.5 bg-[#151518] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            )}

            <div className="pt-4 border-t border-[#27272C] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] text-[#A1A1AA] hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-[#27272C]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Faculty, Department, Level & Semester */}
        {step === 3 && (
          <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#F5F5F5]">3. Academic Department & Level</h2>
              <p className="text-xs text-[#A1A1AA]">
                Set your study level to unlock tailored past questions and lecture course notes.
              </p>
            </div>

            {educationType !== 'waec' && (
              <div className="space-y-4">
                {/* Faculty selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Faculty
                  </label>
                  <select
                    value={isCustomFaculty ? 'custom' : selectedFacultyId || ''}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomFaculty(true);
                        setSelectedFacultyId(null);
                      } else {
                        setIsCustomFaculty(false);
                        setSelectedFacultyId(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6A00]"
                  >
                    {faculties.map(f => (
                      <option key={f.id} value={f.id} className="bg-[#151518] text-white">
                        {f.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-[#151518] text-[#FF6A00]">
                      + Other / Not Listed Faculty
                    </option>
                  </select>

                  {isCustomFaculty && (
                    <input
                      type="text"
                      value={customFacultyName}
                      onChange={e => setCustomFacultyName(e.target.value)}
                      placeholder="Enter faculty name"
                      className="mt-2 w-full px-3.5 py-2 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00]"
                    />
                  )}
                </div>

                {/* Department selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Department
                  </label>
                  <select
                    value={isCustomDept ? 'custom' : selectedDeptId || ''}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomDept(true);
                        setSelectedDeptId(null);
                      } else {
                        setIsCustomDept(false);
                        setSelectedDeptId(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6A00]"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id} className="bg-[#151518] text-white">
                        {d.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-[#151518] text-[#FF6A00]">
                      + Other / Not Listed Department
                    </option>
                  </select>

                  {isCustomDept && (
                    <input
                      type="text"
                      value={customDeptName}
                      onChange={e => setCustomDeptName(e.target.value)}
                      placeholder="Enter department name"
                      className="mt-2 w-full px-3.5 py-2 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] placeholder-[#71717A] focus:outline-none focus:border-[#FF6A00]"
                    />
                  )}
                </div>

                {/* Level & Semester */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Current Level
                    </label>
                    <select
                      value={level}
                      onChange={e => setLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6A00]"
                    >
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="400">400 Level</option>
                      <option value="500">500 Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value as '1st' | '2nd')}
                      className="w-full px-3.5 py-2.5 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6A00]"
                    >
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {educationType === 'waec' && (
              <div className="p-4 rounded-xl bg-[#1A1A1E] border border-[#27272C] space-y-2 text-xs text-[#A1A1AA]">
                <div className="font-bold text-[#F5F5F5]">WAEC SSCE Track Selected</div>
                <p>
                  You will have access to official past question series, theory questions, and AI simulations across Science, Art, and Commercial tracks.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[#27272C] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(educationType === 'waec' ? 1 : 2)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] text-[#A1A1AA] hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-[#27272C]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <span>Next: Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Initial Course & Subject Selection */}
        {step === 4 && (
          <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#F5F5F5]">4. Select Your Key Courses & Subjects</h2>
              <p className="text-xs text-[#A1A1AA]">
                Choose the papers you want quick access to on your dashboard.
              </p>
            </div>

            {/* University Courses Selection */}
            {educationType !== 'waec' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#F5F5F5] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#FF6A00]" />
                  <span>University Courses</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableCourses.map(c => {
                    const isSelected = selectedCourses.includes(c.code);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCourse(c.code)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A1A1E] border-[#FF6A00] text-white'
                            : 'bg-[#1A1A1E] border-[#27272C] text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[#F5F5F5]">{c.code}</div>
                          <div className="text-[10px] text-[#71717A] truncate max-w-[170px]">{c.title}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#FF6A00] border-[#FF6A00]' : 'border-[#71717A]'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WAEC Subjects Selection */}
            {(educationType === 'waec' || educationType === 'both') && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#F5F5F5] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#FF6A00]" />
                  <span>WAEC Subjects</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics'].map(subj => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1A1A1E] border-[#FF6A00] text-white'
                            : 'bg-[#1A1A1E] border-[#27272C] text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-semibold text-[#F5F5F5] truncate">{subj}</span>
                        <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#FF6A00] border-[#FF6A00]' : 'border-[#71717A]'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#27272C] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] text-[#A1A1AA] hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-[#27272C]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Setup & Start Studying</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-[#71717A] pt-6">
        EXAMAI • Academic data is immutable & past exam performances are preserved
      </div>
    </div>
  );
};
