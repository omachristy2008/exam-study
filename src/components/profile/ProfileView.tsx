import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  PlusCircle,
  Save,
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { University, Faculty, Department, WAECSubject, Course } from '../../types';
import { SearchableSelectModal } from '../common/SearchableSelectModal';

export const ProfileView: React.FC = () => {
  const { user, updateAcademicProfile, showToast } = useApp();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [educationType, setEducationType] = useState<'waec' | 'university' | 'both'>(
    user?.profile.education_type || 'both'
  );
  const [universityId, setUniversityId] = useState<string | null>(user?.profile.university_id || null);
  const [customUniversity, setCustomUniversity] = useState<string>(user?.profile.custom_university_name || '');
  const [facultyId, setFacultyId] = useState<string | null>(user?.profile.faculty_id || null);
  const [customFaculty, setCustomFaculty] = useState<string>(user?.profile.custom_faculty_name || '');
  const [departmentId, setDepartmentId] = useState<string | null>(user?.profile.department_id || null);
  const [customDepartment, setCustomDepartment] = useState<string>(user?.profile.custom_department_name || '');
  const [level, setLevel] = useState<string>(user?.profile.level || '200');
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    user?.profile.selected_courses || []
  );
  const [selectedWaecSubjects, setSelectedWaecSubjects] = useState<string[]>(
    user?.profile.selected_waec_subjects || []
  );
  const [newCourseCode, setNewCourseCode] = useState('');

  // Registry data for modals
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allSubjects, setAllSubjects] = useState<WAECSubject[]>([]);

  // Modal visibility states
  const [showUniModal, setShowUniModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAcademicData();
  }, []);

  const loadAcademicData = async () => {
    try {
      const [uniList, subjList] = await Promise.all([
        api.getUniversities(),
        api.getSubjects(),
      ]);
      setUniversities(uniList);
      setAllSubjects(subjList);

      if (universityId) {
        const facList = await api.getFaculties(universityId);
        setFaculties(facList);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUniversitySelect = async (opt: { id: string | null; name: string; isCustom: boolean }) => {
    setUniversityId(opt.id);
    setCustomUniversity(opt.name);
    setFacultyId(null);
    setCustomFaculty('');
    setDepartmentId(null);
    setCustomDepartment('');

    if (opt.id) {
      const facList = await api.getFaculties(opt.id);
      setFaculties(facList);
    } else {
      setFaculties([]);
    }
  };

  const handleFacultySelect = async (opt: { id: string | null; name: string; isCustom: boolean }) => {
    setFacultyId(opt.id);
    setCustomFaculty(opt.name);
    setDepartmentId(null);
    setCustomDepartment('');

    if (opt.id && universityId) {
      const deptList = await api.getDepartments(opt.id, universityId);
      setDepartments(deptList);
    } else {
      setDepartments([]);
    }
  };

  const handleDepartmentSelect = (opt: { id: string | null; name: string; isCustom: boolean }) => {
    setDepartmentId(opt.id);
    setCustomDepartment(opt.name);
  };

  const handleAddCourse = () => {
    if (!newCourseCode.trim()) return;
    const code = newCourseCode.trim().toUpperCase();
    if (!selectedCourses.includes(code)) {
      setSelectedCourses([...selectedCourses, code]);
    }
    setNewCourseCode('');
  };

  const handleRemoveCourse = (code: string) => {
    setSelectedCourses(selectedCourses.filter(c => c !== code));
  };

  const toggleWaecSubject = (subjName: string) => {
    if (selectedWaecSubjects.includes(subjName)) {
      setSelectedWaecSubjects(selectedWaecSubjects.filter(s => s !== subjName));
    } else {
      setSelectedWaecSubjects([...selectedWaecSubjects, subjName]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAcademicProfile({
        education_type: educationType,
        university_id: universityId,
        custom_university_name: customUniversity,
        faculty_id: facultyId,
        custom_faculty_name: customFaculty,
        department_id: departmentId,
        custom_department_name: customDepartment,
        level,
        selected_courses: selectedCourses,
        selected_waec_subjects: selectedWaecSubjects,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Academic Profile & Settings
          </h1>
          <GraduationCap className="w-6 h-6 text-[#FF6A00]" />
        </div>
        <p className="text-sm text-[#A8969C] mt-1">
          Customize your examination track, university affiliation, level, and active courses.
        </p>
      </div>

      {/* Persistence / Non-destructive Notification */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-[#FF6A00]/30 text-xs text-slate-200 flex items-start gap-3 shadow-lg">
        <Info className="w-5 h-5 text-[#FFA05C] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white">Non-Destructive Profile Updates</div>
          <p className="text-slate-300 leading-relaxed">
            Changing your university, faculty, department, level, or courses updates your personalized recommendations and syllabus filters immediately. <strong>Your previous test history, test scores, and earned XP are permanently preserved.</strong>
          </p>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />

        {/* Basic Student Info */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || 'omachristy4@gmail.com'}
              disabled
              className="w-full px-4 py-3 text-xs bg-white/[0.02] border border-white/5 rounded-2xl text-slate-400 outline-none cursor-not-allowed backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Track Segmented Control */}
        <div className="relative z-10 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Target Examination Scope
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'both', label: 'WAEC & University' },
              { id: 'university', label: 'University Only' },
              { id: 'waec', label: 'WAEC Only' },
            ].map(track => (
              <button
                key={track.id}
                type="button"
                onClick={() => setEducationType(track.id as any)}
                className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer backdrop-blur-sm ${
                  educationType === track.id
                    ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] text-white border-transparent shadow-lg shadow-[#FF6A00]/25'
                    : 'bg-white/[0.03] text-slate-300 border-white/8 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>

        {/* University Fields (if university or both) */}
        {(educationType === 'university' || educationType === 'both') && (
          <div className="relative z-10 space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#FFA05C]" />
              <span>University Affiliation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* University Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">University</label>
                <button
                  type="button"
                  onClick={() => setShowUniModal(true)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#FF6A00]/50 hover:bg-white/[0.08] text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-sm"
                >
                  <span className="truncate">{customUniversity || 'Select University'}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </div>

              {/* Faculty Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Faculty / School</label>
                <button
                  type="button"
                  onClick={() => setShowFacultyModal(true)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#FF6A00]/50 hover:bg-white/[0.08] text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-sm"
                >
                  <span className="truncate">{customFaculty || 'Select Faculty'}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </div>

              {/* Department Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Department / Discipline</label>
                <button
                  type="button"
                  onClick={() => setShowDeptModal(true)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#FF6A00]/50 hover:bg-white/[0.08] text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-sm"
                >
                  <span className="truncate">{customDepartment || 'Select Department'}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </div>
            </div>

            {/* Level Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Academic Level</label>
              <div className="grid grid-cols-5 gap-2">
                {['100', '200', '300', '400', '500'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer backdrop-blur-sm ${
                      level === lvl
                        ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-md shadow-[#FF6A00]/25'
                        : 'bg-white/[0.04] border-white/8 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {lvl}L
                  </button>
                ))}
              </div>
            </div>

            {/* Active Selected Courses */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-slate-300">
                Registered Courses for Practice Recommendation
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCourses.map(course => (
                  <span
                    key={course}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.06] text-[#FFA05C] border border-[#FF6A00]/30 text-xs font-bold flex items-center gap-2 backdrop-blur-sm"
                  >
                    <span>{course}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(course)}
                      className="text-slate-400 hover:text-rose-400 font-black text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Course Code */}
              <div className="flex items-center gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={newCourseCode}
                  onChange={e => setNewCourseCode(e.target.value)}
                  placeholder="e.g., CSC 207, GST 202"
                  className="flex-1 px-4 py-2.5 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-[#FFA05C] border border-white/10 rounded-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
                >
                  + Add Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WAEC Subject Selection (if waec or both) */}
        {(educationType === 'waec' || educationType === 'both') && (
          <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FFA05C]" />
              <span>Target WAEC / WASSCE Subjects</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                'Mathematics',
                'English Language',
                'Physics',
                'Chemistry',
                'Biology',
                'Economics',
                'Government',
                'Literature in English',
                'Financial Accounting',
                'Further Mathematics',
                'Civic Education',
                'Geography',
              ].map(subj => {
                const isSelected = selectedWaecSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleWaecSubject(subj)}
                    className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer backdrop-blur-sm ${
                      isSelected
                        ? 'bg-[#FF6A00]/25 text-white border-[#FF6A00] shadow-md shadow-[#FF6A00]/20'
                        : 'bg-white/[0.03] text-slate-300 border-white/8 hover:text-white hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{subj}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFA05C]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Save Button */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all hover:scale-102 cursor-pointer disabled:opacity-50 border border-white/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Academic Profile'}</span>
          </button>
        </div>
      </form>

      {/* Select Modals */}
      <SearchableSelectModal
        isOpen={showUniModal}
        onClose={() => setShowUniModal(false)}
        title="Select Your University"
        options={universities.map(u => ({
          id: u.id,
          name: u.name,
          subtitle: `${u.short_name || ''} • ${u.state || ''}, ${u.country}`,
        }))}
        selectedValue={universityId}
        customValue={customUniversity}
        onSelect={handleUniversitySelect}
        type="university"
      />

      <SearchableSelectModal
        isOpen={showFacultyModal}
        onClose={() => setShowFacultyModal(false)}
        title="Select Your Faculty"
        options={faculties.map(f => ({ id: f.id, name: f.name }))}
        selectedValue={facultyId}
        customValue={customFaculty}
        onSelect={handleFacultySelect}
        type="faculty"
      />

      <SearchableSelectModal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Select Your Department"
        options={departments.map(d => ({ id: d.id, name: d.name }))}
        selectedValue={departmentId}
        customValue={customDepartment}
        onSelect={handleDepartmentSelect}
        type="department"
      />
    </div>
  );
};
