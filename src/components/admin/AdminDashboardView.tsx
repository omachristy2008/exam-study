import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  PlusCircle,
  Building2,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { UploadRecord, CustomInstitutionAggregate, University } from '../../types';
import { VerificationBadge } from '../common/VerificationBadge';

export const AdminDashboardView: React.FC = () => {
  const { user, showToast } = useApp();

  const [stats, setStats] = useState<any>({
    total_users: 1420,
    total_questions: 3500,
    total_exams_taken: 8900,
    pending_uploads: 3,
  });
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [customInstitutions, setCustomInstitutions] = useState<CustomInstitutionAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  // New official uni form
  const [newUniName, setNewUniName] = useState('');
  const [newUniShort, setNewUniShort] = useState('');
  const [newUniState, setNewUniState] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin & Moderation Center
            </h1>
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm text-[#A8969C] mt-1">
            Review community question submissions, manage custom institutions, and audit platform health.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-[#FFA05C] border border-white/10 transition-all self-start sm:self-auto cursor-pointer backdrop-blur-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Active Students</div>
          <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FFA05C]" />
            <span>{stats.total_users?.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Verified Questions</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>{stats.total_questions?.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Exams Completed</div>
          <div className="text-2xl sm:text-3xl font-black text-[#FFA05C] flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span>{stats.total_exams_taken?.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 space-y-1 shadow-xl">
          <div className="text-xs text-slate-300 font-semibold">Pending Moderation</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{stats.pending_uploads}</span>
          </div>
        </div>
      </div>

      {/* Student Upload Moderation Queue */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Student Past Paper Moderation Queue ({uploads.length})</span>
          </h2>
        </div>

        {uploads.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No pending submissions in the moderation queue.
          </div>
        ) : (
          <div className="space-y-4">
            {uploads.map(upload => (
              <div
                key={upload.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {upload.course_or_subject} ({upload.year} • {upload.semester})
                      </span>
                      <VerificationBadge sourceType="student_submitted" status={upload.status} size="sm" />
                    </div>
                    <div className="text-xs text-slate-300">
                      Institution: <strong className="text-white">{upload.institution_name}</strong> • File: {upload.file_name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {upload.status === 'pending_review' ? (
                      <>
                        <button
                          onClick={() => handleModerate(upload.id, 'rejected')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleModerate(upload.id, 'approved')}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
                        >
                          Approve & Publish to Library (+200 XP)
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
                  <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {upload.extracted_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aggregated Custom University Submissions */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#FFA05C]" />
          <span>User-Contributed Custom Institutions</span>
        </h2>
        <p className="text-xs text-slate-300">
          Institutions submitted by students via "Other / Not Listed". Promote recurring ones to the official system database so all students can select them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customInstitutions.map(item => (
            <div
              key={item.name}
              className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-between gap-3 backdrop-blur-sm"
            >
              <div>
                <div className="font-bold text-sm text-white">{item.name}</div>
                <div className="text-xs text-slate-300">{item.count} students registered with this name</div>
              </div>

              <button
                onClick={() => handlePromoteCustom(item)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#FF6A00] text-[#FFA05C] hover:text-white border border-[#FF6A00]/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                Promote to Official DB
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Add Official University Form */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-[#FFA05C]" />
          <span>Register New Official University</span>
        </h2>

        <form onSubmit={handleAddOfficialUni} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={newUniName}
            onChange={e => setNewUniName(e.target.value)}
            placeholder="Full Name (e.g. Lagos State University)"
            className="sm:col-span-2 px-4 py-3 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
            required
          />
          <input
            type="text"
            value={newUniShort}
            onChange={e => setNewUniShort(e.target.value)}
            placeholder="Short Code (e.g. LASU)"
            className="px-4 py-3 text-xs bg-white/[0.04] border border-white/10 focus:border-[#FF6A00] rounded-2xl text-white outline-none backdrop-blur-sm"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF7A1A] hover:from-[#FF7A1A] hover:to-[#FF8A3D] text-white text-xs font-bold shadow-lg shadow-[#FF6A00]/25 transition-all cursor-pointer border border-white/20"
          >
            Add University
          </button>
        </form>
      </div>
    </div>
  );
};
