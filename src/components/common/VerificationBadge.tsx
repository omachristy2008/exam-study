import React from 'react';
import { ShieldCheck, Clock, FileText, Cpu, AlertCircle } from 'lucide-react';
import { SourceType, VerificationStatus } from '../../types';

export const VerificationBadge: React.FC<{
  sourceType: SourceType | 'mixed' | string;
  status?: VerificationStatus | string;
  size?: 'sm' | 'md';
  detailed?: boolean;
}> = ({ sourceType, status = 'verified', size = 'md', detailed = false }) => {
  if (sourceType === 'real_past_question') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-sm`}
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
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } bg-white/[0.06] text-[#FFA05C] border-[#FF6A00]/40 shadow-sm`}
      >
        <Cpu className={size === 'sm' ? 'w-3 h-3 text-[#FFA05C]' : 'w-3.5 h-3.5 text-[#FFA05C]'} />
        <span>AI GENERATED PRACTICE</span>
      </span>
    );
  }

  if (sourceType === 'student_submitted' && status === 'pending_review') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } bg-amber-950/60 text-amber-300 border-amber-500/40`}
      >
        <Clock className={size === 'sm' ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />
        <span>PENDING REVIEW</span>
      </span>
    );
  }

  if (sourceType === 'student_submitted' && status === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } bg-cyan-950/60 text-cyan-300 border-cyan-500/40`}
      >
        <FileText className={size === 'sm' ? 'w-3 h-3 text-cyan-400' : 'w-3.5 h-3.5 text-cyan-400'} />
        <span>COMMUNITY VERIFIED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border backdrop-blur-sm ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      } bg-purple-950/60 text-purple-300 border-purple-500/40`}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      <span>EXAM SIMULATION</span>
    </span>
  );
};
