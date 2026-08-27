import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Layers,
  Sparkles,
  Building2,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { UploadRecord } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

export const UploadQuestionView: React.FC = () => {
  const { user, showToast } = useApp();

  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);

  // Form State
  const [examType, setExamType] = useState<'waec' | 'university'>(
    user?.profile.education_type === 'waec' ? 'waec' : 'university'
  );
  const [institutionName, setInstitutionName] = useState(
    user?.profile.custom_university_name || 'University of Lagos'
  );
  const [courseOrSubject, setCourseOrSubject] = useState(
    user?.profile.education_type === 'waec' ? 'Mathematics' : 'CSC 201'
  );
  const [year, setYear] = useState('2024');
  const [semester, setSemester] = useState('1st');
  const [questionContent, setQuestionContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMyUploads();
  }, []);

  const loadMyUploads = async () => {
    try {
      const data = await api.getUploads();
      setUploads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUploads(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionContent.trim() && !selectedFileName) {
      showToast('Please provide question text or select a file to upload.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const resp = await api.submitUpload({
        exam_type: examType,
        institution_name: institutionName,
        course_or_subject: courseOrSubject,
        year: Number(year),
        semester: semester,
        file_name: selectedFileName || 'past_question_scan.pdf',
        extracted_text: questionContent,
        question_count: 5,
      });

      if (resp.success) {
        showToast('Past paper submitted to the moderation queue! Thank you.', 'success');
        setQuestionContent('');
        setSelectedFileName('');
        loadMyUploads();
      }
    } catch (e: any) {
      showToast(e.message || 'Error submitting upload', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Contribute Past Questions
          </h1>
          <UploadCloud className="w-6 h-6 text-[#FF6A00]" />
        </div>
        <p className="text-sm text-[#A8969C] mt-1">
          Help expand the community past questions library by uploading verified university & WAEC examination papers.
        </p>
      </div>

      {/* Moderation Policy Notice */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-[#FF6A00]/30 text-xs text-slate-200 flex items-start gap-3 shadow-lg">
        <Shield className="w-5 h-5 text-[#FFA05C] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white">Quality Assurance & Moderation Protocol</div>
          <p className="text-slate-300 leading-relaxed">
            All submitted examination papers undergo curriculum moderation before being integrated into the public verified database. Once approved, you will be awarded <strong>+200 XP</strong> per verified past question set.
          </p>
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Track */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Examination Track
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExamType('university')}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer backdrop-blur-sm ${
                    examType === 'university'
                      ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-md shadow-[#FF6A00]/25'
                      : 'bg-white/[0.03] text-slate-300 border-white/8 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>University</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExamType('waec')}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer backdrop-blur-sm ${
                    examType === 'waec'
                      ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-md shadow-[#FF6A00]/25'
                      : 'bg-white/[0.03] text-slate-300 border-white/8 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>WAEC / WASSCE</span>
                </button>
              </div>
            </div>

            {/* Institution / Examination Board */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {examType === 'university' ? 'Institution / University Name' : 'Examination Council'}
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                placeholder="e.g. University of Lagos (UNILAG)"
                className="w-full px-4 py-3 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
                required
              />
            </div>

            {/* Course / Subject */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {examType === 'university' ? 'Course Code & Title' : 'WAEC Subject'}
              </label>
              <input
                type="text"
                value={courseOrSubject}
                onChange={e => setCourseOrSubject(e.target.value)}
                placeholder="e.g. CSC 201: Data Structures"
                className="w-full px-4 py-3 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
                required
              />
            </div>

            {/* Year & Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Exam Year
                </label>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
                >
                  <option value="2024" className="bg-slate-900 text-white">2024</option>
                  <option value="2023" className="bg-slate-900 text-white">2023</option>
                  <option value="2022" className="bg-slate-900 text-white">2022</option>
                  <option value="2021" className="bg-slate-900 text-white">2021</option>
                  <option value="2020" className="bg-slate-900 text-white">2020</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Semester / Diet
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
                >
                  <option value="1st" className="bg-slate-900 text-white">1st Semester</option>
                  <option value="2nd" className="bg-slate-900 text-white">2nd Semester</option>
                  <option value="May/June" className="bg-slate-900 text-white">May/June (WAEC)</option>
                  <option value="Nov/Dec" className="bg-slate-900 text-white">Nov/Dec (GCE)</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Past Paper PDF or Photo Scan
            </label>
            <div
              onClick={() => setSelectedFileName('CSC201_UNILAG_2024_Exam.pdf')}
              className="p-8 border-2 border-dashed border-white/15 hover:border-[#FF6A00]/60 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] text-center cursor-pointer transition-all space-y-2 backdrop-blur-sm"
            >
              <UploadCloud className="w-9 h-9 text-[#FFA05C] mx-auto" />
              <div className="text-xs font-bold text-white">
                {selectedFileName ? (
                  <span className="text-emerald-400">Attached: {selectedFileName}</span>
                ) : (
                  <span>Click to select PDF or image of exam paper</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Supported: PDF, JPG, PNG (Max 15MB)
              </p>
            </div>
          </div>

          {/* Extracted / Manual Question Text Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Typed Questions & Solutions (Optional or Paste from Document)
            </label>
            <textarea
              rows={4}
              value={questionContent}
              onChange={e => setQuestionContent(e.target.value)}
              placeholder="Paste questions, options (A, B, C, D), and verified answers if available..."
              className="w-full p-4 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none font-mono backdrop-blur-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all disabled:opacity-50 cursor-pointer border border-white/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{submitting ? 'Submitting to Moderation...' : 'Submit Past Paper for Review'}</span>
          </button>
        </form>
      </div>

      {/* Student's Upload History */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white">Your Submitted Past Papers ({uploads.length})</h2>

        {uploads.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            You haven't submitted any past questions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map(item => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{item.course_or_subject}</span>
                    <VerificationBadge sourceType="student_submitted" status={item.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-300">
                    {item.institution_name} • {item.year} ({item.semester}) • {item.file_name}
                  </div>
                  {item.moderator_notes && (
                    <div className="text-[11px] text-amber-300/90 pt-1">
                      <strong>Moderator note:</strong> {item.moderator_notes}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
