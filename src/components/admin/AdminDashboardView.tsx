import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  PlusCircle,
  Building2,
  ArrowRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { UploadRecord, CustomInstitutionAggregate, University } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

export const AdminDashboardView: React.FC = () => {
  const { user, isAdmin, navigate, showToast } = useApp();

  const [stats, setStats] = useState<any>({
    students_count: 0,
    universities_count: 0,
    courses_count: 0,
    real_questions_count: 0,
    pending_uploads_count: 0,
    custom_institutions_count: 0,
  });
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [customInstitutions, setCustomInstitutions] = useState<CustomInstitutionAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  // New official university form
  const [newUniName, setNewUniName] = useState('');
  const [newUniShort, setNewUniShort] = useState('');
  const [newUniState, setNewUniState] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, uploadsData, customData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUploads(),
        api.getCustomInstitutions(),
      ]);
      setStats(statsData);
      setUploads(uploadsData);
      setCustomInstitutions(customData);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // If user is not the authorized administrator, render a secure access-denied screen
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#F5F5F5]">
              Restricted Administrative Space
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              This space and its API endpoints are protected and accessible strictly by the verified platform administrator (<strong className="text-purple-300">omachristy4@gmail.com</strong>).
            </p>
          </div>

          <div className="p-3 bg-[#1A1A1E] border border-[#27272C] rounded-xl text-left space-y-1">
            <div className="text-[10px] font-bold text-[#71717A] uppercase">Active Session</div>
            <div className="text-xs text-[#F5F5F5] font-semibold flex items-center justify-between">
              <span>{user ? user.email : 'Unauthenticated Guest'}</span>
              <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[10px] border border-rose-500/30">
                Unauthorized
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <span>Return to Study Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] text-[#A1A1AA] hover:text-white font-semibold text-xs border border-[#27272C] transition-all cursor-pointer"
            >
              Sign In with Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleModerate = async (uploadId: string, status: 'approved' | 'rejected') => {
    try {
      await api.moderateUpload(uploadId, {
        status,
        moderator_notes:
          status === 'approved'
            ? 'Verified against curriculum blueprint. Added to public library.'
            : 'Unclear image scan or duplicate content.',
      });
      showToast(`Upload has been ${status}!`, status === 'approved' ? 'success' : 'info');
      loadAdminData();
    } catch (e) {
      showToast('Moderation action failed.', 'error');
    }
  };

  const handlePromoteCustom = async (item: CustomInstitutionAggregate) => {
    try {
      await api.promoteCustomInstitution({
        name: item.name,
        short_name: item.name.split(' ').map(w => w[0]).join('').toUpperCase(),
        state: 'National',
      });
      showToast(`Promoted "${item.name}" to official university database!`, 'success');
      loadAdminData();
    } catch (e) {
      showToast('Could not promote institution.', 'error');
    }
  };

  const handleAddOfficialUni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName.trim()) return;
    try {
      await api.addUniversity({
        name: newUniName.trim(),
        short_name: newUniShort.trim() || undefined,
        state: newUniState.trim() || undefined,
      });
      showToast(`Added ${newUniName} to official database!`, 'success');
      setNewUniName('');
      setNewUniShort('');
      setNewUniState('');
      loadAdminData();
    } catch (e) {
      showToast('Failed to add university.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
              Admin & Moderation Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-purple-950 text-purple-300 text-xs font-bold border border-purple-500/30">
              omachristy4@gmail.com
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Review community question submissions, manage custom institutions, and maintain database integrity.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1E] hover:bg-[#202026] text-xs font-bold text-[#FFA05C] border border-[#27272C] transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#151518] border border-[#27272C] space-y-1">
          <div className="text-xs text-[#A1A1AA] font-semibold">Active Students</div>
          <div className="text-2xl font-black text-[#F5F5F5] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6A00]" />
            <span>{(stats.students_count ?? 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#151518] border border-[#27272C] space-y-1">
          <div className="text-xs text-[#A1A1AA] font-semibold">Verified Questions</div>
          <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>{(stats.real_questions_count ?? 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#151518] border border-[#27272C] space-y-1">
          <div className="text-xs text-[#A1A1AA] font-semibold">Active Universities</div>
          <div className="text-2xl font-black text-[#FFA05C] flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span>{stats.universities_count ?? 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#151518] border border-[#27272C] space-y-1">
          <div className="text-xs text-[#A1A1AA] font-semibold">Pending Moderation</div>
          <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{stats.pending_uploads_count ?? uploads.length}</span>
          </div>
        </div>
      </div>

      {/* Student Upload Moderation Queue */}
      <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Past Question Moderation Queue ({uploads.length})</span>
          </h2>
        </div>

        {uploads.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A]">
            No submissions pending moderation.
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map(upload => (
              <div
                key={upload.id}
                className="p-4 rounded-xl bg-[#1A1A1E] border border-[#27272C] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272C] pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[#F5F5F5]">
                        {upload.course_code || upload.subject_name || 'Academic Paper'} ({upload.year} • {upload.semester})
                      </span>
                      <VerificationBadge sourceType="student_submitted" status={upload.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#A1A1AA]">
                      Institution: <strong className="text-[#F5F5F5]">{upload.university_name || 'WAEC'}</strong> • File: {upload.file_name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {upload.status === 'pending_review' ? (
                      <>
                        <button
                          onClick={() => handleModerate(upload.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleModerate(upload.id, 'approved')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                        >
                          Approve & Publish (+200 XP)
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400">
                        {upload.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {upload.extracted_text && (
                  <div className="p-3 bg-[#151518] border border-[#27272C] rounded-lg text-xs font-mono text-[#A1A1AA] whitespace-pre-wrap leading-relaxed">
                    {upload.extracted_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aggregated Custom University Submissions */}
      <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#FF6A00]" />
          <span>User-Contributed Custom Institutions</span>
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          Institutions submitted by students via &ldquo;Other / Not Listed&rdquo;. Promote recurring ones to the official system database so all students can select them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customInstitutions.map(item => (
            <div
              key={item.name}
              className="p-4 rounded-xl bg-[#1A1A1E] border border-[#27272C] flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#F5F5F5]">{item.name}</div>
                <div className="text-[11px] text-[#71717A]">{item.student_count} student(s) registered</div>
              </div>

              <button
                onClick={() => handlePromoteCustom(item)}
                className="px-3 py-1.5 rounded-lg bg-[#151518] hover:bg-[#FF6A00] text-[#FFA05C] hover:text-white border border-[#FF6A00]/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                Promote to DB
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Add Official University Form */}
      <div className="bg-[#151518] border border-[#27272C] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-[#FF6A00]" />
          <span>Register New Official University</span>
        </h2>

        <form onSubmit={handleAddOfficialUni} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={newUniName}
            onChange={e => setNewUniName(e.target.value)}
            placeholder="Full Name (e.g. Lagos State University)"
            className="sm:col-span-2 px-3.5 py-2.5 text-xs bg-[#1A1A1E] border border-[#27272C] focus:border-[#FF6A00] rounded-xl text-[#F5F5F5] outline-none placeholder-[#71717A]"
            required
          />
          <input
            type="text"
            value={newUniShort}
            onChange={e => setNewUniShort(e.target.value)}
            placeholder="Short Code (e.g. LASU)"
            className="px-3.5 py-2.5 text-xs bg-[#1A1A1E] border border-[#27272C] focus:border-[#FF6A00] rounded-xl text-[#F5F5F5] outline-none placeholder-[#71717A]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A1A] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Add University
          </button>
        </form>
      </div>
    </div>
  );
};
