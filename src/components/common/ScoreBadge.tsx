import React from 'react';

interface ScoreBadgeProps {
  score: number;
  isPendingAudit?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, isPendingAudit = false, size = 'md' }) => {
  const isPositive = score > 0;
  const isZero = score === 0;

  const fontSizes = {
    sm: 'text-[11px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5 font-medium',
    lg: 'text-sm px-2.5 py-1 font-semibold'
  };

  if (isPendingAudit) {
    return (
      <div className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200/80 ${fontSizes[size]}`}>
        <span>{score > 0 ? `+${score}` : score}</span>
        <span className="font-sans font-medium text-[10px] text-amber-600">
          {size === 'sm' ? '分' : '分 (待审)'}
        </span>
      </div>
    );
  }

  if (isZero) {
    return (
      <div className={`inline-flex shrink-0 whitespace-nowrap items-center gap-0.5 rounded font-mono bg-slate-100 text-slate-600 border border-slate-200 ${fontSizes[size]}`}>
        <span>0</span>
        <span className="font-sans font-normal text-[10px] text-slate-500">分</span>
      </div>
    );
  }

  if (isPositive) {
    return (
      <div className={`inline-flex shrink-0 whitespace-nowrap items-center gap-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${fontSizes[size]}`}>
        <span>+{score}</span>
        <span className="font-sans font-normal text-[10px] text-emerald-600">分</span>
      </div>
    );
  }

  // Negative deduction
  return (
    <div className={`inline-flex shrink-0 whitespace-nowrap items-center gap-0.5 rounded font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200/80 ${fontSizes[size]}`}>
      <span>{score}</span>
      <span className="font-sans font-normal text-[10px] text-rose-500">分</span>
    </div>
  );
};
