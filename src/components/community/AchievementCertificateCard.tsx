import { Award, BadgeCheck, Calendar } from 'lucide-react';
import React from 'react';
import { CourseCertificate } from '../../types';

interface AchievementCertificateCardProps {
  certificate: CourseCertificate;
  studentName: string;
  compact?: boolean;
}

export const AchievementCertificateCard: React.FC<AchievementCertificateCardProps> = ({
  certificate,
  studentName,
  compact = false,
}) => {
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  if (compact) {
    return (
      <div className="relative p-4 rounded-2xl border border-[#f59e0b]/40 bg-gradient-to-br from-[#191c21] to-[#1f1a12] flex items-start gap-3.5 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/10 blur-2xl rounded-full pointer-events-none" />
        <div className="w-11 h-11 rounded-2xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 flex items-center justify-center flex-shrink-0 relative z-10">
          <Award className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white truncate">{certificate.courseTitle}</h4>
            <BadgeCheck className="w-3.5 h-3.5 text-[#58f5e0] shrink-0" />
          </div>
          <p className="text-[10px] text-[#bacac6] mt-0.5">Verified {issuedDate}</p>
          <p className="text-[9px] text-[#bacac6]/60 font-mono mt-0.5">{certificate.verificationCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border-2 border-[#f59e0b]/50 bg-gradient-to-br from-[#191c21] via-[#1a1812] to-[#191c21] p-6 sm:p-8 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)]">
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#f59e0b]/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute inset-0 border border-[#f59e0b]/20 rounded-3xl m-1.5 pointer-events-none" />

      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Award className="w-6 h-6 text-[#f59e0b]" />
          <span className="text-xs uppercase font-black tracking-[0.2em] text-[#f59e0b]">Vormirix Achievement</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white">{certificate.courseTitle}</h2>

        <p className="text-xs text-[#bacac6]">
          Awarded to <span className="font-bold text-white">{studentName}</span>
        </p>

        <p className="text-xs text-[#bacac6] max-w-sm mx-auto leading-relaxed">
          Successfully completed <span className="text-white font-semibold">{certificate.courseTitle}</span>
          {typeof certificate.score === 'number' && (
            <>
              {' '}
              with a score of <span className="text-[#58f5e0] font-bold">{certificate.score}%</span>
            </>
          )}
        </p>

        <div className="flex items-center justify-center gap-1.5 text-[#58f5e0] text-xs font-bold">
          <BadgeCheck className="w-4 h-4 fill-current" />
          <span>Verified Achievement</span>
        </div>

        <div className="pt-4 border-t border-[#f59e0b]/20 flex items-center justify-center gap-4 text-[10px] text-[#bacac6]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Issued {issuedDate}
          </span>
          <span className="font-mono">{certificate.verificationCode}</span>
        </div>
      </div>
    </div>
  );
};
