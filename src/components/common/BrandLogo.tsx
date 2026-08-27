import React from 'react';
import { Sparkles, ShieldCheck, Clock, FileText, Cpu, AlertCircle } from 'lucide-react';
import { SourceType, VerificationStatus } from '../../types';
import { APP_CONFIG } from '../../config/branding';

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; showTagline?: boolean }> = ({
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A3D] flex items-center justify-center text-white shadow-lg shadow-[#FF6A00]/30 border border-white/20`}
      >
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
            {APP_CONFIG.name}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FFA05C] border border-[#FF6A00]/40 backdrop-blur-md">
            PRO
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] text-slate-400 -mt-0.5">{APP_CONFIG.tagline}</p>
        )}
      </div>
    </div>
  );
};

export const VerificationBadge: React.FC<{
  sourceType: SourceType | 'mixed';
  status?: VerificationStatus;
  size?: 'sm' | 'md';
  detailed?: boolean;
}> = ({ sourceType, status = 'verified', size = 'md', detailed = false }) => {
  if (sourceType === 'real_past_question') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-emerald-900/30 text-emerald-300 border-emerald-400/30 shadow-sm shadow-emerald-950/40`}
      >
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />
        <span>VERIFIED PAST QUESTION</span>
        {detailed && <span className="text-[10px] text-emerald-400/80 lowercase">(authorized source)</span>}
      </span>
    );
  }

  if (sourceType === 'ai_generated') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-[#FF6A00]/15 text-[#FFA05C] border-[#FF6A00]/35 shadow-sm shadow-black/20`}
      >
        <Cpu className={size === 'sm' ? 'w-3 h-3 text-[#FF7A1A]' : 'w-3.5 h-3.5 text-[#FF7A1A]'} />
        <span>AI GENERATED PRACTICE</span>
      </span>
    );
  }

  if (sourceType === 'student_submitted' && status === 'pending_review') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-amber-900/30 text-amber-300 border-amber-400/30 shadow-sm shadow-amber-950/40`}
      >
        <Clock className={size === 'sm' ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />
        <span>PENDING REVIEW</span>
      </span>
    );
  }

  if (sourceType === 'student_submitted' && status === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-cyan-900/30 text-cyan-300 border-cyan-400/30 shadow-sm shadow-cyan-950/40`}
      >
        <FileText className={size === 'sm' ? 'w-3 h-3 text-cyan-400' : 'w-3.5 h-3.5 text-cyan-400'} />
        <span>COMMUNITY VERIFIED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } bg-purple-900/30 text-purple-300 border-purple-400/30 shadow-sm shadow-purple-950/40`}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      <span>EXAM SIMULATION</span>
    </span>
  );
};
