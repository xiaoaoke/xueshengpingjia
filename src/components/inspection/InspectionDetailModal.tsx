import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Upload,
  Calendar,
  X,
  ZoomIn,
  Sparkles,
  FileCheck2,
  Check
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ScoreBadge } from '../common/ScoreBadge';
import { decideAudit } from '../../utils/auditPolicy';

export const InspectionDetailModal: React.FC = () => {
  const {
    selectedRecordId,
    setActiveSubPage,
    records,
    rules,
    appeals,
    currentUser,
    auditRecord,
    resubmitRecord,
    submitAppeal,
    showToast,
    openModal,
    moralAuditEnabled
  } = useDuty();

  const record = records.find((r) => r.id === selectedRecordId);

  const DEFAULT_FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80';

  // Local state for actions
  const [auditRemark, setAuditRemark] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPhotos, setEditedPhotos] = useState<string[]>([]);
  const [editedScore, setEditedScore] = useState<number>(-1);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState('经核实，当时为学校统一调配活动场地，并非本班日常包干区，且学生已在规定时限内完成清理，特申请撤销扣分。');
  const [appealPhoto, setAppealPhoto] = useState('https://images.unsplash.com/photo-1584697964190-705b89368d40?w=600&auto=format&fit=crop&q=80');
  const appealFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAppealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择有效的图片格式（JPG/PNG/WEBP等）', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('图片大小不能超过 15MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAppealPhoto(reader.result);
        showToast('已成功上传申诉现场反证照片！', 'success');
      }
    };
    reader.onerror = () => {
      showToast('照片读取失败，请重新选取', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!record) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="text-xs text-slate-500 mb-3">未找到该条检查记录或已移除</div>
        <button
          onClick={() => setActiveSubPage(null)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-2xs"
        >
          返回检查列表
        </button>
      </div>
    );
  }

  // 双轨制：申诉态独立于记录状态
  const hasUnresolvedAppeal = appeals.some(
    (a) => a.recordId === record.id && a.status !== 'resolved'
  );

  const handleAuditApprove = () => {
    auditRecord(record.id, 'approve', auditRemark || '审核通过，已核准扣分证据');
  };

  const handleAuditReject = () => {
    openModal({
      type: 'audit_reject_confirm',
      title: '确认退回？',
      message: '记录将退回提交人修改，本次检查不产生有效计分。确定退回？',
      confirmText: '确认退回',
      cancelText: '取消',
      onConfirm: () => {
        auditRecord(record.id, 'reject', auditRemark || '证据存疑或不符合扣分标准，予以退回');
      }
    });
  };

  const resubmitFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleResubmitPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('请选择有效的图片格式（JPG/PNG/WEBP等）', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('图片大小不能超过 15MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditedPhotos((prev) => [...prev, reader.result as string]);
        showToast('证据照片已添加', 'success');
      }
    };
    reader.onerror = () => {
      showToast('照片读取失败，请重新选取', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 重提后按统一口径判定是否送审（用于按钮文案预告）
  const resubmitRule = rules.find((r) => r.id === record.ruleId);
  const willNeedAudit =
    decideAudit(resubmitRule, editedScore, moralAuditEnabled) === 'pending_audit';

  const handleResubmit = () => {
    resubmitRecord(record.id, {
      description: editedDescription || record.description,
      photos: editedPhotos,
      score: editedScore
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-3.5 pb-16 animate-in fade-in duration-150">
      {/* 1. Header Navigation Bar (顶部导航条与流水号) */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-all cursor-pointer font-bold text-xs shadow-2xs group active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>返回</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 font-mono px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80">
            流水号 #{record.id.slice(-6)}
          </span>
        </div>
      </div>

      {/* 2. Core Event Hero Card (主事件看板卡片) */}
      <div className="bg-white rounded-3xl p-4.5 border border-slate-200/90 shadow-2xs space-y-3.5 relative overflow-hidden">
        {/* Top: Class Badge + Status Tag */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-xs font-black border border-blue-200/80 shadow-2xs">
              {record.className}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {record.grade}
            </span>
          </div>

          <StatusBadge status={record.status} size="sm" appealPending={hasUnresolvedAppeal} />
        </div>

        {/* Title & Score Pill Banner */}
        <div className="flex items-start justify-between gap-3 pt-0.5">
          <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug flex-1 break-words">
            {record.ruleTitle}
          </h2>
          <div className="shrink-0 pt-0.5">
            <ScoreBadge score={record.score} isPendingAudit={record.status === 'pending_audit'} size="md" />
          </div>
        </div>

        {/* 2x2 Clean Grid Specs (结构化元数据磁贴) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400 font-medium">检查教师</div>
              <div className="text-xs font-bold text-slate-800 truncate">{record.inspectorName}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400 font-medium">巡查时段</div>
              <div className="text-xs font-bold text-slate-800 truncate">{record.timeSlotName}</div>
            </div>
          </div>

          <div className="col-span-2 p-2.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400 font-medium">责任区域与地点</div>
              <div className="text-xs font-bold text-slate-800 leading-snug break-words">{record.zone}</div>
            </div>
          </div>

          <div className="col-span-2 p-2.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium">登记提交时间</span>
            </div>
            <span className="text-slate-700 font-mono text-xs font-bold">{record.createdAt}</span>
          </div>
        </div>
      </div>

      {/* 3. Workflow Progress Tracker (事件全流程生命周期看板) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>巡查计分流转进度</span>
          </span>
          <span className="text-[11px] font-semibold text-blue-600">
            {record.status === 'pending_audit' ? '阶段 2/3 · 德育处审核中' : record.status === 'active' ? '已生效入账' : record.status === 'rejected' ? '已退回补充' : '处理中'}
          </span>
        </div>

        {/* 3-step Horizontal Flow Bar */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-2 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 text-[10px]">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-[11px] font-bold text-emerald-900">巡查录入</span>
            <span className="text-[10px] text-emerald-700 mt-0.5">已提交</span>
          </div>

          {/* Step 2 */}
          <div className={`flex flex-col items-center text-center p-2 rounded-2xl border ${
            record.status === 'pending_audit'
              ? 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-2xs'
              : record.status === 'rejected'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold text-white ${
              record.status === 'pending_audit'
                ? 'bg-amber-500 animate-pulse'
                : record.status === 'rejected'
                ? 'bg-rose-500'
                : 'bg-emerald-600'
            }`}>
              {record.status === 'pending_audit' ? '2' : record.status === 'rejected' ? '!' : '✓'}
            </div>
            <span className="text-[11px] font-bold">德育处复核</span>
            <span className="text-[10px] opacity-80 mt-0.5">
              {record.status === 'pending_audit' ? '待审核' : record.status === 'rejected' ? '已退回' : '已核准'}
            </span>
          </div>

          {/* Step 3 */}
          <div className={`flex flex-col items-center text-center p-2 rounded-2xl border ${
            record.status === 'active'
              ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
              : 'bg-slate-50 border-slate-200/70 text-slate-400'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold ${
              record.status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              3
            </div>
            <span className="text-[11px] font-bold">量化计分</span>
            <span className="text-[10px] opacity-80 mt-0.5">
              {record.status === 'active' ? '分值生效' : '待生效'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Situation Description Card (现场情况记录) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
            <span>现场情况陈述与记录</span>
          </label>
          <span className="text-[10px] text-slate-400 font-medium">如实记录现场</span>
        </div>

        {isEditing ? (
          <textarea
            rows={3}
            value={editedDescription || record.description}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full p-3 text-xs rounded-2xl border border-blue-400 focus:outline-none bg-blue-50/40 leading-relaxed font-medium"
          />
        ) : (
          <div className="p-3.5 bg-slate-50/80 rounded-2xl text-xs text-slate-700 leading-relaxed border border-slate-100 font-medium">
            {record.description || '现场巡查无特殊补充说明。'}
          </div>
        )}
      </div>

      {/* 5. Photos Evidence Section (现场照片证据) */}
      {record.photos && record.photos.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-indigo-600 rounded-full"></span>
              <span>现场照片证据 ({record.photos.length}张)</span>
            </label>
            <span className="text-[11px] text-blue-600 font-medium flex items-center gap-0.5">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>点击查看原图</span>
            </span>
          </div>

          <div className={record.photos.length === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-2.5'}>
            {record.photos.map((url, idx) => {
              const photoSrc = url || DEFAULT_FALLBACK_PHOTO;
              return (
                <div 
                  key={idx}
                  onClick={() => setPreviewPhotoUrl(photoSrc)} 
                  className="aspect-16/10 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 relative group cursor-pointer shadow-2xs hover:border-blue-500 transition-all"
                >
                  <img
                    src={photoSrc}
                    alt={`现场证据照片 ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_FALLBACK_PHOTO;
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-2xs">
                    <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 text-xs font-bold flex items-center gap-1 shadow-md">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>查看原图</span>
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                    现场实录
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Audit Remarks if rejected/audited */}
      {record.auditRemark && (
        <div className={`p-4 rounded-3xl text-xs space-y-2 border shadow-2xs ${
          record.status === 'rejected' 
            ? 'bg-rose-50/90 border-rose-200 text-rose-950' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>德育处复核判定意见</span>
            </div>
            <span className="text-[10px] text-rose-700/80 font-normal">审核人: {record.auditorName || '德育处'}</span>
          </div>
          <p className="leading-relaxed bg-white/80 p-3 rounded-2xl border border-rose-200/70 text-rose-950 font-semibold text-xs">
            {record.auditRemark}
          </p>
          {record.auditedAt && (
            <div className="text-[10px] text-rose-700/70 font-mono text-right">{record.auditedAt} 审核办结</div>
          )}
        </div>
      )}

      {/* 7. Role-Specific Action Panels */}

      {/* Admin Audit Panel (德育处审批) */}
      {currentUser.role === 'admin' && record.status === 'pending_audit' && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 border border-amber-200 rounded-3xl p-4.5 shadow-2xs space-y-3">
          <h3 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>德育处管理员审核判定</span>
          </h3>
          <input
            type="text"
            value={auditRemark}
            onChange={(e) => setAuditRemark(e.target.value)}
            placeholder="输入审核意见（可选）..."
            className="w-full h-10 px-3 text-xs bg-white rounded-xl border border-amber-200 focus:outline-none focus:border-amber-500 font-medium"
          />
          <div className="flex gap-2.5">
            <button
              onClick={handleAuditReject}
              className="w-1/2 h-11 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-95 shadow-2xs"
            >
              <XCircle className="w-4 h-4" />
              <span>退回修改 (不计分)</span>
            </button>
            <button
              onClick={handleAuditApprove}
              className="w-1/2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer transition-colors active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>审核通过 (计分生效)</span>
            </button>
          </div>
        </div>
      )}

      {/* Duty Teacher Resubmit Panel */}
      {currentUser.role === 'duty_teacher' && record.status === 'rejected' && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-3xl p-4.5 shadow-2xs space-y-3">
          <h3 className="text-xs font-black text-rose-950 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>记录已被退回，请补充修改后重新提交</span>
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              <p className="text-[11px] text-rose-700">
                可修改现场说明（上方文本框）、补充证据照片并调整分值后重新提交。
              </p>

              {/* 分值调整 chips */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">调整分值</label>
                <div className="flex gap-2">
                  {[-0.5, -1, -2, -3].map((v) => (
                    <button
                      key={v}
                      onClick={() => setEditedScore(v)}
                      className={`flex-1 h-9 rounded-lg border font-mono font-bold text-xs transition-colors cursor-pointer ${
                        editedScore === v
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {v}分
                    </button>
                  ))}
                </div>
              </div>

              {/* 证据照片补充 */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">证据照片</label>
                <input
                  ref={resubmitFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleResubmitPhotoUpload}
                />
                <div className="flex flex-wrap items-center gap-2">
                  {editedPhotos.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                      <img src={url} alt={`证据 ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setEditedPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 w-4 h-4 bg-slate-900/70 text-white text-[10px] rounded-bl-lg cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => resubmitFileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 text-[10px] cursor-pointer transition-colors"
                  >
                    + 添加
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-1/3 h-11 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleResubmit}
                  className="w-2/3 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {willNeedAudit ? '保存并重新提交审核' : '保存并重新提交（生效计分）'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditedDescription(record.description);
                setEditedPhotos(record.photos ? [...record.photos] : []);
                setEditedScore(record.score);
              }}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>编辑说明/照片/分值并重新提交</span>
            </button>
          )}
        </div>
      )}

      {/* Homeroom Teacher Actions */}
      {currentUser.role === 'homeroom_teacher' && (
        <div className="space-y-2">
          {record.status === 'rejected' && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-2xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>此检查记录已被德育处退回，不扣减本班常规考核积分。</span>
            </div>
          )}

          {record.score < 0 &&
            !record.appealId &&
            ['active', 'need_rectify', 'rechecking', 'closed'].includes(record.status) && (
            <button
              onClick={() => setShowAppealModal(true)}
              className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>对该扣分记录发起申诉</span>
            </button>
          )}

          {record.status === 'need_rectify' && (
            <button
              onClick={() => {
                setActiveSubPage('rectify_list');
              }}
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>前往提交整改反馈照片</span>
            </button>
          )}
        </div>
      )}

      {/* 8. Lightbox Modal (照片高清放大灯箱) */}
      {previewPhotoUrl && (
        <div
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div 
            className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 bg-slate-900/90 text-white border-b border-white/10">
              <span className="text-xs font-bold">现场高清证据照片</span>
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 flex items-center justify-center max-h-[70vh] overflow-hidden bg-black/40">
              <img
                src={previewPhotoUrl}
                alt="证据大图"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_FALLBACK_PHOTO;
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 9. Homeroom Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">班主任扣分申诉申请</h3>
                  <p className="text-[11px] text-slate-500">{record.className} · {record.ruleTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAppealModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
              >
                取消
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">申诉理由与事实陈述</label>
                <textarea
                  rows={3}
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="请详细说明实际情况及申请撤销/调整扣分的依据..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-purple-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">佐证材料与反证照片</label>
                <input
                  ref={appealFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAppealPhotoUpload}
                />
                <div className="flex items-center gap-3">
                  {appealPhoto && (
                    <div 
                      onClick={() => appealFileInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative group cursor-pointer shadow-2xs hover:border-purple-400 transition-all"
                      title="点击上传或拍照"
                    >
                      <img src={appealPhoto} alt="证据照片" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        更换
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => appealFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>拍照 / 上传反证照片</span>
                    </button>
                    <p className="text-[10px] text-slate-400">
                      支持本地相册选取或手机拍照
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="w-1/3 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  放弃
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!appealReason.trim()) {
                      showToast('请填写申诉理由', 'warning');
                      return;
                    }
                    submitAppeal(record.id, appealReason, appealPhoto ? [appealPhoto] : []);
                    setShowAppealModal(false);
                  }}
                  className="w-2/3 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  提交德育处裁决
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
