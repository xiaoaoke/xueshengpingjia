import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  ArrowLeft, 
  TrendingDown, 
  TrendingUp, 
  RotateCcw, 
  Filter, 
  ChevronRight, 
  Award,
  Sparkles
} from 'lucide-react';
import { ScoreBadge } from '../common/ScoreBadge';
import { StatusBadge } from '../common/StatusBadge';

export const ScoreDetailModal: React.FC = () => {
  const {
    classes,
    records,
    appeals,
    currentUser,
    assessmentCategories,
    setActiveSubPage,
    setSelectedRecordId
  } = useDuty();

  // If homeroom teacher, locked to their class; else default to first class
  const isHomeroom = currentUser.role === 'homeroom_teacher';
  const targetClassId = currentUser.homeroomClassId || classes[0].id;
  const [selectedClassId, setSelectedClassId] = useState<string>(targetClassId);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classRecords = records.filter(r => r.classId === selectedClassId);
  // 排名口径统一：按实时分动态计算，与积分榜同源
  const selectedClassRank = [...classes]
    .sort((a, b) => b.currentScore - a.currentScore)
    .findIndex(c => c.id === selectedClassId) + 1;

  // 维度分口径：所有已生效计分的记录（含待整改/待复查/已办结；撤销后 score=0 自然中性）
  const EFFECTIVE_STATUSES = ['active', 'need_rectify', 'rechecking', 'closed'];
  const categoryDelta = (categoryId: string) =>
    classRecords
      .filter(r => r.ruleCategory === categoryId && EFFECTIVE_STATUSES.includes(r.status))
      .reduce((acc, curr) => acc + curr.score, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回积分榜</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900">班级积分明细流水</h2>
        <span className="text-xs font-mono text-blue-600 font-semibold">{selectedClass.name}</span>
      </div>

      {/* Class Switcher（班主任仅本班，禁止切换他班明细/证据） */}
      {!isHomeroom && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-1">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedClassId === cls.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      )}

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-4 text-white shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-200">当前总评得分</div>
            <div className="text-2xl font-black font-mono mt-0.5">
              {selectedClass.currentScore.toFixed(1)}
              <span className="text-xs font-normal text-blue-200 ml-1">分 (基准100分)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200">年级排名</div>
            <div className="text-xl font-bold font-mono">
              第 {selectedClassRank} 名
            </div>
          </div>
        </div>

        {/* 6 Dimension Breakdown（遍历考评维度，口径含全部已生效计分状态） */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center text-xs">
          {assessmentCategories.map((cat) => (
            <div key={cat.id}>
              <div className="text-[10px] text-blue-200">{cat.name}</div>
              <div className="font-mono font-bold mt-0.5">{100 + categoryDelta(cat.id)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Change Ledger Items */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>加减分考评流水清单 ({classRecords.length} 项)</span>
          <span className="text-[11px] text-slate-400 font-normal">点击条目查看证据</span>
        </div>

        {classRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            暂无加减分记录
          </div>
        ) : (
          classRecords.map((rec) => (
            <div
              key={rec.id}
              onClick={() => {
                setSelectedRecordId(rec.id);
                setActiveSubPage('record_detail');
              }}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-start justify-between gap-2.5">
                <span className="font-bold text-xs text-slate-900 leading-snug break-words flex-1 min-w-0">
                  {rec.ruleTitle}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <ScoreBadge score={rec.score} isPendingAudit={rec.status === 'pending_audit'} size="sm" />
                  <StatusBadge
                    status={rec.status}
                    size="sm"
                    appealPending={appeals.some((a) => a.recordId === rec.id && a.status !== 'resolved')}
                  />
                </div>
              </div>

              {rec.description && (
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {rec.description}
                </p>
              )}

              <div className="pt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-100">
                <span className="truncate flex-1 min-w-0 text-slate-500">
                  {rec.timeSlotName} · {rec.createdAt} · 检查人: {rec.inspectorName}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
