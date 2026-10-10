import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  Award, 
  AlertTriangle, 
  RotateCcw, 
  FileCheck2, 
  ChevronRight, 
  ArrowUpRight, 
  TrendingUp, 
  Flame, 
  Clock 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ScoreBadge } from '../common/ScoreBadge';

export const HomeroomWorkbench: React.FC = () => {
  const { 
    currentUser, 
    setCurrentTab, 
    setActiveSubPage, 
    setSelectedRecordId,
    classes, 
    records, 
    rectifications, 
    appeals 
  } = useDuty();

  // Find class for homeroom teacher (defaults to class_g1_1)
  const myClassId = currentUser.homeroomClassId || 'class_g1_1';
  const myClass = classes.find(c => c.id === myClassId) || classes[0];
  // 排名口径统一：按实时分动态计算（与积分榜同源），不再读静态 currentRank
  const myClassRank = [...classes]
    .sort((a, b) => b.currentScore - a.currentScore)
    .findIndex(c => c.id === myClassId) + 1;

  const classRecords = records.filter(r => r.classId === myClassId);
  const myRectifications = rectifications.filter(t => t.classId === myClassId);
  const pendingRectify = myRectifications.filter(t => t.status === 'pending');
  const myAppeals = appeals.filter(a => a.classId === myClassId);
  // 待复核 + 需补充材料（需班主任行动）都算未决
  const pendingAppeals = myAppeals.filter(a => a.status === 'pending' || a.status === 'need_more_info');

  return (
    <div className="space-y-4 pb-16">
      {/* Top Class Overview Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-5 text-white shadow-[0_8px_24px_rgba(79,70,229,0.22)] border border-indigo-400/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1.5">
            <span className="font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {myClass.fullName} · 班级常规看板
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md font-mono text-[11px] border border-white/20">
              第6周进行中
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2.5">
            <div>
              <div className="text-3xl font-black tracking-tight font-mono text-white">
                {myClass.currentScore}
                <span className="text-sm font-normal text-blue-200 ml-1">分</span>
              </div>
              <div className="text-xs text-blue-200 mt-1 flex items-center gap-1.5 font-medium">
                <span>年级第</span>
                <span className="font-bold text-white font-mono text-sm px-1.5 py-0.2 rounded-md bg-white/10">{myClassRank}</span>
                <span>名</span>
                <span className="text-[11px] text-blue-300">(上周第{myClass.lastWeekRank}名)</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30 backdrop-blur-xs shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-amber-300" />
                <span>文明达标班</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-purple-500/25 blur-3xl pointer-events-none"></div>
      </div>

      {/* 3 Metric Counts */}
      <div className="grid grid-cols-3 gap-2.5">
        <div 
          onClick={() => {
            setCurrentTab('scores');
            setActiveSubPage('score_detail');
          }}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center cursor-pointer hover:border-blue-300 hover:scale-[1.02] transition-all"
        >
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {classRecords.length}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">本周检查项</div>
        </div>

        <div 
          onClick={() => {
            setCurrentTab('approvals');
            setActiveSubPage('rectify_list');
          }}
          className={`p-3.5 rounded-2xl border shadow-2xs text-center cursor-pointer transition-all ${
            pendingRectify.length > 0
              ? 'bg-orange-50/80 border-orange-200 text-orange-700 hover:bg-orange-100/90 hover:scale-[1.02]'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className={`text-2xl font-black font-mono tracking-tight ${pendingRectify.length > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
            {pendingRectify.length}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">待办整改</div>
        </div>

        <div 
          onClick={() => {
            setCurrentTab('approvals');
            setActiveSubPage('appeal_list');
          }}
          className={`p-3.5 rounded-2xl border shadow-2xs text-center cursor-pointer transition-all ${
            pendingAppeals.length > 0
              ? 'bg-purple-50/80 border-purple-200 text-purple-700 hover:bg-purple-100/90 hover:scale-[1.02]'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className={`text-2xl font-black font-mono tracking-tight ${pendingAppeals.length > 0 ? 'text-purple-600' : 'text-slate-900'}`}>
            {pendingAppeals.length}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">申诉复核中</div>
        </div>
      </div>

      {/* Urgent Rectification Alert Card */}
      {pendingRectify.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>待处理整改工单</span>
            </div>
            <span className="text-[11px] text-amber-700 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>截止：{pendingRectify[0].deadline.slice(11)}</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <div className="font-semibold text-xs text-slate-900 mb-1">
              {pendingRectify[0].issueTitle}
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
              值周老师在巡查中发现包干区有杂物，请责任班级抓紧组织值日生清扫并上传整改反馈照片。
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setCurrentTab('approvals');
                  setActiveSubPage('rectify_list');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>去提交整改照片</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Matrix */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          快捷功能
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Class Score Ledger */}
          <button
            onClick={() => {
              setCurrentTab('scores');
              setActiveSubPage('score_detail');
            }}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-blue-50 transition-colors text-slate-700 hover:text-blue-700 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[12px] leading-none font-medium text-slate-800 whitespace-nowrap">积分明细</span>
          </button>

          {/* Rectification Center */}
          <button
            onClick={() => {
              setCurrentTab('approvals');
              setActiveSubPage('rectify_list');
            }}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-blue-50 transition-colors text-slate-700 hover:text-blue-700 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[12px] leading-none font-medium text-slate-800 whitespace-nowrap">整改工单</span>
          </button>

          {/* Score Appeals */}
          <button
            onClick={() => {
              setCurrentTab('approvals');
              setActiveSubPage('appeal_list');
            }}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-blue-50 transition-colors text-slate-700 hover:text-blue-700 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-[12px] leading-none font-medium text-slate-800 whitespace-nowrap">扣分申诉</span>
          </button>

          {/* Grade Ranking */}
          <button
            onClick={() => {
              setCurrentTab('scores');
              setActiveSubPage(null);
            }}
            className="flex flex-col items-center p-2 rounded-xl hover:bg-blue-50 transition-colors text-slate-700 hover:text-blue-700 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors mb-1.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[12px] leading-none font-medium text-slate-800 whitespace-nowrap">年级排名</span>
          </button>
        </div>
      </div>

      {/* Class Recent Records Stream */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-900">本班最新巡查记录流水</h3>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
              {classRecords.length}
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentTab('scores');
              setActiveSubPage('score_detail');
            }}
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
          >
            <span>全部明细</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {classRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
            暂无巡查记录
          </div>
        ) : (
          <div className="space-y-2">
            {classRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => {
                  setSelectedRecordId(rec.id);
                  setActiveSubPage('record_detail');
                }}
                className="p-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200/80 transition-all cursor-pointer space-y-2 group shadow-2xs"
              >
                {/* Top row: Title and Badges */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 leading-snug break-words">
                      {rec.ruleTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <ScoreBadge score={rec.score} isPendingAudit={rec.status === 'pending_audit'} size="sm" />
                    <StatusBadge
                      status={rec.status}
                      size="sm"
                      appealPending={appeals.some((a) => a.recordId === rec.id && a.status !== 'resolved')}
                    />
                  </div>
                </div>

                {/* Bottom row: Time slot, Inspector, Date and Arrow */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-200/40">
                  <div className="flex items-center gap-1.5 flex-wrap text-slate-500">
                    <span className="text-slate-700 font-medium">{rec.timeSlotName}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-[10px] text-slate-400">{rec.createdAt}</span>
                    <span className="text-slate-300">·</span>
                    <span>检查人: {rec.inspectorName}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {/* Audit reject remark hint if rejected */}
                {rec.status === 'rejected' && rec.auditRemark && (
                  <div className="text-[10px] text-rose-700 bg-rose-50/80 px-2 py-1 rounded-md border border-rose-100 leading-tight">
                    退回说明：{rec.auditRemark}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
