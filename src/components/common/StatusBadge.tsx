import React from 'react';
import { RecordStatus } from '../../types';

interface StatusBadgeProps {
  status: RecordStatus;
  size?: 'sm' | 'md';
  /** 有未决申诉时叠加一枚"申诉中"胶囊（双轨制：申诉态独立于记录状态） */
  appealPending?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', appealPending = false }) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-0.5 gap-1.5';
  const baseClasses = `inline-flex items-center font-bold rounded-full shrink-0 whitespace-nowrap shadow-2xs ${sizeClasses}`;

  const badge = renderBadge(status, baseClasses);
  if (!appealPending) return badge;

  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      {badge}
      <span className={`${baseClasses} bg-purple-50 text-purple-800 border border-purple-200/90`}>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
        申诉中
      </span>
    </span>
  );
};

const renderBadge = (status: RecordStatus, baseClasses: string) => {
  switch (status) {
    case 'pending_audit':
      return (
        <span className={`${baseClasses} bg-amber-50 text-amber-800 border border-amber-200/90`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          待审核
        </span>
      );
    case 'rejected':
      return (
        <span className={`${baseClasses} bg-rose-50 text-rose-800 border border-rose-200/90`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          已退回
        </span>
      );
    case 'active':
      return (
        <span className={`${baseClasses} bg-emerald-50 text-emerald-800 border border-emerald-200/90`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          已生效
        </span>
      );
    case 'need_rectify':
      return (
        <span className={`${baseClasses} bg-orange-50 text-orange-800 border border-orange-200/90`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          待整改
        </span>
      );
    case 'rechecking':
      return (
        <span className={`${baseClasses} bg-blue-50 text-blue-800 border border-blue-200/90`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          待复查
        </span>
      );
    case 'appealing':
      return (
        <span className={`${baseClasses} bg-purple-50 text-purple-800 border border-purple-200/90`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
          申诉中
        </span>
      );
    case 'closed':
      return (
        <span className={`${baseClasses} bg-slate-100 text-slate-600 border border-slate-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          已办结
        </span>
      );
    default:
      return null;
  }
};
