import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  CheckSquare, 
  FileCheck2, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Camera, 
  ChevronRight, 
  ShieldAlert, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ScoreBadge } from '../common/ScoreBadge';
import { RectificationTicket, AppealTicket, InspectionRecord } from '../../types';

export const ApprovalCenter: React.FC = () => {
  const {
    currentUser,
    records,
    rectifications,
    appeals,
    auditRecord,
    submitRectification,
    recheckRectification,
    arbitrateAppeal,
    supplementAppeal,
    activeSubPage,
    setActiveSubPage,
    setSelectedRecordId,
    openModal,
    showToast
  } = useDuty();

  const getInitialTab = (): 'audit' | 'rectify' | 'appeal' => {
    if (activeSubPage === 'rectify_list') return 'rectify';
    if (activeSubPage === 'appeal_list') return 'appeal';
    if (activeSubPage === 'audit_center') return 'audit';
    if (currentUser.role === 'homeroom_teacher') return 'rectify';
    return 'audit';
  };

  const [activeTab, setActiveTab] = useState<'audit' | 'rectify' | 'appeal'>(getInitialTab);

  React.useEffect(() => {
    if (activeSubPage === 'rectify_list') setActiveTab('rectify');
    else if (activeSubPage === 'appeal_list') setActiveTab('appeal');
    else if (activeSubPage === 'audit_center') setActiveTab('audit');
  }, [activeSubPage]);

  // Filtered lists
  const pendingAudits = records.filter((r) => r.status === 'pending_audit');
  const myRectifications = currentUser.role === 'homeroom_teacher' 
    ? rectifications.filter((t) => t.classId === currentUser.homeroomClassId)
    : rectifications;
  const myAppeals = currentUser.role === 'homeroom_teacher'
    ? appeals.filter((a) => a.classId === currentUser.homeroomClassId)
    : appeals;

  // Selected item modals
  const [activeRectifyTicket, setActiveRectifyTicket] = useState<RectificationTicket | null>(null);
  const [activeAppealTicket, setActiveAppealTicket] = useState<AppealTicket | null>(null);

  // Rectification submission form state
  const [rectifyNote, setRectifyNote] = useState('卫生委员已组织全组值日生按标准将走廊彻底清扫干净，并对责任人提出纪律提醒。');
  const [rectifyPhoto, setRectifyPhoto] = useState('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80');
  const rectifyFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRectifyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setRectifyPhoto(reader.result);
        showToast('已成功上传整改现场实拍照片！', 'success');
      }
    };
    reader.onerror = () => {
      showToast('照片读取失败，请重新选取', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Recheck opinion form state
  const [recheckOpinion, setRecheckOpinion] = useState('');

  // Appeal arbitration form state
  const [arbitrateDecision, setArbitrateDecision] = useState<'maintain' | 'adjust' | 'revoke' | 'request_info'>('maintain');
  const [adjustedScoreValue, setAdjustedScoreValue] = useState<number>(-1);
  const [decisionRemark, setDecisionRemark] = useState('');

  // Appeal supplement (need_more_info 回程) form state
  const [supplementAppealTicket, setSupplementAppealTicket] = useState<AppealTicket | null>(null);
  const [supplementReason, setSupplementReason] = useState('');

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {currentUser.role === 'admin' ? '德育处审批中心' : '班级待办工单'}
          </h2>
          <p className="text-[11px] text-slate-500">常规检查审核、整改闭环验收与申诉仲裁</p>
        </div>
      </div>

      {/* 3 Categories Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'audit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>检查审核 ({pendingAudits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rectify')}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'rectify' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>整改闭环 ({myRectifications.filter(t => t.status === 'pending' || t.status === 'submitted').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appeal')}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'appeal' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>
            扣分申诉 ({myAppeals.filter(a => a.status === 'pending' || (currentUser.role === 'homeroom_teacher' && a.status === 'need_more_info')).length})
          </span>
        </button>
      </div>

      {/* TAB 1: 检查待审核列表 */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          {pendingAudits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700">暂无待审核检查记录</div>
              <p className="text-[11px] text-slate-400 mt-0.5">所有值周教师提交的巡查记录均已审核处理</p>
            </div>
          ) : (
            pendingAudits.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="shrink-0 whitespace-nowrap font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {rec.className}
                    </span>
                    <ScoreBadge score={rec.score} isPendingAudit={true} size="sm" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900 leading-snug">
                    {rec.ruleTitle}
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    <div>{rec.inspectorName} 提交 · {rec.timeSlotName}</div>
                    <div className="whitespace-nowrap">{rec.createdAt}</div>
                  </div>
                </div>

                {rec.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {rec.description}
                  </p>
                )}

                {rec.photos && rec.photos.length > 0 && (
                  <div className="flex gap-2">
                    {rec.photos.map((p, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={p} alt="证据" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {currentUser.role === 'admin' ? (
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => {
                        openModal({
                          type: 'audit_reject_confirm',
                          title: '确认退回？',
                          message: `确定退回【${rec.className}】的【${rec.ruleTitle}】？记录将退回提交人，本次不计分。`,
                          confirmText: '确认退回',
                          cancelText: '取消',
                          onConfirm: () => auditRecord(rec.id, 'reject', '证据不充分，建议现场口头提醒')
                        });
                      }}
                      className="w-1/2 h-10 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>退回修改</span>
                    </button>
                    <button
                      onClick={() => auditRecord(rec.id, 'approve', '核准有效')}
                      className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>审核通过 (生效计分)</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 text-right">
                    <button
                      onClick={() => {
                        setSelectedRecordId(rec.id);
                        setActiveSubPage('record_detail');
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      查看详情
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: 整改闭环工单列表 */}
      {activeTab === 'rectify' && (
        <div className="space-y-3">
          {myRectifications.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="shrink-0 whitespace-nowrap font-bold text-xs text-slate-900 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                    {ticket.className}
                  </span>
                  <div className="shrink-0">
                    {ticket.status === 'pending' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                        待整改反馈
                      </span>
                    )}
                    {ticket.status === 'submitted' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        待复查验收
                      </span>
                    )}
                    {ticket.status === 'passed' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        整改已通过
                      </span>
                    )}
                    {ticket.status === 'rejected' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        复查未通过
                      </span>
                    )}
                    {ticket.status === 'cancelled' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        已随申诉撤销
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900 leading-snug">
                  {ticket.issueTitle}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  <div>责任人：{ticket.dutyPerson}</div>
                  <div className="whitespace-nowrap">截止：{ticket.deadline}</div>
                </div>
              </div>

              {/* Timeline preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-2">
                <div className="font-semibold text-slate-700">工单进展轨迹：</div>
                {ticket.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                    <div>
                      <span className="font-medium text-slate-900">{step.action}</span>
                      <span className="text-slate-400 mx-1">({step.operator})</span>
                      <span className="text-slate-400 font-mono text-[10px]">{step.time}</span>
                      {step.note && <div className="text-slate-500 mt-0.5">{step.note}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="pt-1 flex justify-end gap-2">
                {currentUser.role === 'homeroom_teacher' && (ticket.status === 'pending' || ticket.status === 'rejected') && (
                  <button
                    onClick={() => setActiveRectifyTicket(ticket)}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>提交整改照片与说明</span>
                  </button>
                )}

                {currentUser.role === 'admin' && ticket.status === 'submitted' && (
                  <button
                    onClick={() => setActiveRectifyTicket(ticket)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>现场复查验收</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: 扣分申诉列表 */}
      {activeTab === 'appeal' && (
        <div className="space-y-3">
          {myAppeals.map((appeal) => (
            <div
              key={appeal.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="shrink-0 whitespace-nowrap font-bold text-xs text-slate-900 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md">
                    {appeal.className}
                  </span>
                  <div className="shrink-0">
                    {appeal.status === 'pending' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        待德育处复核
                      </span>
                    )}
                    {appeal.status === 'resolved' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        已办结裁决
                      </span>
                    )}
                    {appeal.status === 'need_more_info' && (
                      <span className="whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        需补充材料
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900 leading-snug">
                  申诉工单 #{appeal.id.slice(-4)}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  <div>申诉人：{appeal.appellantName}</div>
                  <div className="whitespace-nowrap">提交时间：{appeal.submittedAt}</div>
                </div>
              </div>

              {/* Appeal Reason */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                <div className="font-semibold text-purple-950">申诉理由与事实说明：</div>
                <p className="leading-relaxed text-slate-700">{appeal.reason}</p>
              </div>

              {appeal.evidencePhotos && appeal.evidencePhotos.length > 0 && (
                <div className="flex gap-2">
                  {appeal.evidencePhotos.map((url, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                      <img src={url} alt="申诉证据" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Arbitration result if resolved */}
              {appeal.decision && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    <span>复核仲裁决定：{
                      appeal.decision === 'maintain' ? '维持原判' :
                      appeal.decision === 'revoke' ? '撤销扣分 (全额冲正)' :
                      appeal.decision === 'adjust' ? `调整分值为 ${appeal.adjustedScore} 分` : '要求补充资料'
                    }</span>
                  </div>
                  <p className="text-slate-600">{appeal.decisionRemark}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    复核人：{appeal.decidedBy} · 时间：{appeal.decidedAt}
                  </div>
                </div>
              )}

              {/* Admin Arbitration Action */}
              {currentUser.role === 'admin' && appeal.status === 'pending' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveAppealTicket(appeal)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>进入复核仲裁决定</span>
                  </button>
                </div>
              )}

              {/* Homeroom Supplement Action (need_more_info 回程) */}
              {currentUser.role === 'homeroom_teacher' && appeal.status === 'need_more_info' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSupplementAppealTicket(appeal);
                      setSupplementReason(appeal.reason);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>补充申诉材料</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rectification Modal (Submit or Recheck) */}
      {activeRectifyTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                {currentUser.role === 'homeroom_teacher' ? '提交整改反馈' : '整改复查验收'}
              </h3>
              <button
                onClick={() => setActiveRectifyTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                取消
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-semibold text-slate-900">{activeRectifyTicket.issueTitle}</div>
              <div className="text-slate-500">{activeRectifyTicket.className} · 截止时间：{activeRectifyTicket.deadline}</div>
            </div>

            {currentUser.role === 'homeroom_teacher' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">整改落实情况说明</label>
                  <textarea
                    rows={3}
                    value={rectifyNote}
                    onChange={(e) => setRectifyNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                    placeholder="说明清理整改过程及教育成效..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">整改后现场照片</label>
                  {/* Real hidden file input */}
                  <input
                    ref={rectifyFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleRectifyPhotoUpload}
                  />
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => rectifyFileInputRef.current?.click()}
                      className="w-18 h-18 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative group cursor-pointer shadow-2xs hover:border-blue-400 transition-all"
                      title="点击上传或拍照"
                    >
                      <img src={rectifyPhoto} alt="整改后照片" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        点击更换
                      </div>
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => rectifyFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>拍照 / 选择真实照片</span>
                      </button>
                      <p className="text-[10px] text-slate-400">
                        支持手机拍照或从本地相册选择真实实拍图
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setActiveRectifyTicket(null)}
                    className="w-1/3 h-10 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      submitRectification(activeRectifyTicket.id, rectifyNote, [rectifyPhoto]);
                      setActiveRectifyTicket(null);
                    }}
                    className="w-2/3 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    提交进入待复查
                  </button>
                </div>
              </div>
            ) : (
              // Admin recheck
              <div className="space-y-3 text-xs">
                {/* 班主任整改反馈证据（验收前必须可见） */}
                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 space-y-2">
                  <div className="font-semibold text-orange-900">班主任整改反馈：</div>
                  <p className="text-slate-700 leading-relaxed">
                    {activeRectifyTicket.rectifyDescription || '（未填写说明）'}
                  </p>
                  {activeRectifyTicket.rectifyPhotos && activeRectifyTicket.rectifyPhotos.length > 0 && (
                    <div className="flex gap-2">
                      {activeRectifyTicket.rectifyPhotos.map((url, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt={`整改后照片 ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {activeRectifyTicket.submittedAt && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      提交时间：{activeRectifyTicket.submittedAt}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">复查验收评语</label>
                  <textarea
                    rows={2}
                    value={recheckOpinion}
                    onChange={(e) => setRecheckOpinion(e.target.value)}
                    placeholder="填写验收意见，如现场清洁达标..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      recheckRectification(activeRectifyTicket.id, false, recheckOpinion || '整改不彻底，仍有死角未清理');
                      setActiveRectifyTicket(null);
                    }}
                    className="w-1/2 h-10 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    未达标·退回重新整改
                  </button>
                  <button
                    onClick={() => {
                      recheckRectification(activeRectifyTicket.id, true, recheckOpinion || '现场复查达标，准予办结');
                      setActiveRectifyTicket(null);
                    }}
                    className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    验收通过·办结工单
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appeal Arbitration Modal (Admin) */}
      {activeAppealTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">扣分申诉仲裁裁决</h3>
              <button
                onClick={() => setActiveAppealTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                取消
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-semibold text-slate-900">受申诉班级：{activeAppealTicket.className}</div>
              <div className="text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                申诉理由：{activeAppealTicket.reason}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">裁决决定</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'maintain', label: '维持原判' },
                    { val: 'revoke', label: '撤销扣分 (冲正)' },
                    { val: 'adjust', label: '调整分值' },
                    { val: 'request_info', label: '要求补充资料' }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setArbitrateDecision(item.val as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        arbitrateDecision === item.val
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {arbitrateDecision === 'adjust' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">调整后分值 (扣分)</label>
                  <div className="flex gap-2">
                    {[-0.5, -1, -1.5, -2].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAdjustedScoreValue(v)}
                        className={`flex-1 h-9 rounded-lg border font-mono font-bold text-xs ${
                          adjustedScoreValue === v
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {v}分
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">仲裁处理意见</label>
                <textarea
                  rows={2}
                  value={decisionRemark}
                  onChange={(e) => setDecisionRemark(e.target.value)}
                  placeholder="如：经核实活动假单无误，给予冲正撤销..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setActiveAppealTicket(null)}
                  className="w-1/3 h-10 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    arbitrateAppeal(
                      activeAppealTicket.id,
                      arbitrateDecision,
                      adjustedScoreValue,
                      decisionRemark || '经德育处会议核实裁决生效'
                    );
                    setActiveAppealTicket(null);
                  }}
                  className="w-2/3 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  执行裁决决定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Supplement Modal (班主任补充材料回程) */}
      {supplementAppealTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">补充申诉材料</h3>
              <button
                onClick={() => setSupplementAppealTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                取消
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-semibold text-slate-900">{supplementAppealTicket.className}</div>
              <div className="text-slate-500 leading-relaxed bg-amber-50 p-2 rounded-lg border border-amber-100">
                德育处要求补充材料：{supplementAppealTicket.decisionRemark || '请补充更充分的佐证材料'}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">补充后的申诉理由与事实陈述</label>
                <textarea
                  rows={4}
                  value={supplementReason}
                  onChange={(e) => setSupplementReason(e.target.value)}
                  placeholder="请在原申诉基础上补充更详细的说明或新的佐证线索..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSupplementAppealTicket(null)}
                  className="w-1/3 h-10 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (!supplementReason.trim()) {
                      showToast('请填写补充材料说明', 'warning');
                      return;
                    }
                    supplementAppeal(
                      supplementAppealTicket.id,
                      supplementReason,
                      supplementAppealTicket.evidencePhotos || []
                    );
                    setSupplementAppealTicket(null);
                  }}
                  className="w-2/3 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  提交补充材料
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
