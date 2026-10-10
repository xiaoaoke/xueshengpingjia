import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { AlertTriangle, CheckCircle2, Info, XCircle, ArrowRight } from 'lucide-react';

export const ModalDialog: React.FC = () => {
  const { activeModal, closeModal } = useDuty();

  if (!activeModal) return null;

  const { type, title, message, confirmText, cancelText, onConfirm, onCancel, data } = activeModal;

  const getIcon = () => {
    switch (type) {
      case 'inspect_success':
      case 'record_active':
        return <CheckCircle2 className="w-10 h-10 text-emerald-600" />;
      case 'duplicate_warning':
      case 'schedule_conflict':
      case 'publish_confirm':
      case 'audit_reject_confirm':
      case 'leave_edit_confirm':
        return <AlertTriangle className="w-10 h-10 text-amber-500" />;
      case 'offline_saved':
        return <Info className="w-10 h-10 text-blue-500" />;
      case 'role_switch_confirm':
        return <Info className="w-10 h-10 text-blue-600" />;
      default:
        return <Info className="w-10 h-10 text-blue-600" />;
    }
  };

  const handleConfirm = () => {
    closeModal();
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    closeModal();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-slate-50 border border-slate-100 shadow-xs">
            {getIcon()}
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed text-balance">{message}</p>
        </div>

        {data && (
          <div className="p-3 text-left bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            {data.conflictReason && (
              <div className="font-medium text-amber-700">冲突详情：{data.conflictReason}</div>
            )}
            {data.similarRecord && (
              <div>
                <span className="font-medium text-slate-700">已存在记录：</span>
                {data.similarRecord.className} · {data.similarRecord.ruleTitle} ({data.similarRecord.createdAt})
              </div>
            )}
            {data.summary && <div>{data.summary}</div>}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row-reverse gap-2">
          <button
            onClick={handleConfirm}
            className="w-full h-11 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 active:scale-[0.98]"
          >
            {confirmText || '确定'}
            <ArrowRight className="w-4 h-4" />
          </button>
          {cancelText && (
            <button
              onClick={handleCancel}
              className="w-full h-11 px-4 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
