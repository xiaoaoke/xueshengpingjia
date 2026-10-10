import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  Award, 
  TrendingUp, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  Flame, 
  Share2, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { ScoreBadge } from '../common/ScoreBadge';

export const ClassScoresView: React.FC = () => {
  const { 
    classes, 
    settlement, 
    currentUser, 
    setCurrentTab, 
    setActiveSubPage, 
    records 
  } = useDuty();

  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // 实时榜单（未发布态）
  const filteredClasses = classes
    .filter(c => selectedGrade === 'all' || c.grade === selectedGrade)
    .sort((a, b) => b.currentScore - a.currentScore);

  const isPublished = settlement.status === 'published';

  // 发布态：渲染不可变快照 rankings；未发布态：实时分
  const snapshotRows = isPublished && settlement.rankings.length > 0
    ? settlement.rankings
        .filter(r => selectedGrade === 'all' || r.grade === selectedGrade)
        .sort((a, b) => a.rank - b.rank)
    : [];
  const useSnapshot = snapshotRows.length > 0;
  const podiumName = useSnapshot
    ? (snapshotRows[0]?.className || '')
    : (filteredClasses[0]?.fullName || '暂无');
  const podiumScore = useSnapshot
    ? (snapshotRows[0]?.finalScore ?? null)
    : (filteredClasses[0]?.currentScore ?? null);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">班级常规积分榜</h2>
          <p className="text-[11px] text-slate-500">
            {isPublished
              ? `第${settlement.weekNumber}教学周正式发布版本 (已锁定快照${settlement.publishedAt ? ` · ${settlement.publishedAt}` : ''})`
              : `第${settlement.weekNumber}教学周预估实时成绩 (未正式发布)`}
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setActiveSubPage('settlement_pipeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors ${
              isPublished 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPublished ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isPublished ? '重新结算/修订' : '结算并发布'}</span>
          </button>
        )}
      </div>

      {/* Week and Grade Filters */}
      <div className="flex items-center justify-between gap-2">
        {/* Grade filter */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          {[
            { key: 'all', label: '全校年级' },
            { key: '高一年级', label: '高一' },
            { key: '高二年级', label: '高二' },
            { key: '高三年级', label: '高三' }
          ].map((g) => (
            <button
              key={g.key}
              onClick={() => setSelectedGrade(g.key)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                selectedGrade === g.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Status tag */}
        <div className="shrink-0">
          {isPublished ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>正式成绩</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>预估动态</span>
            </span>
          )}
        </div>
      </div>

      {/* Amended banner：发布后有调账，正式榜仍为快照 */}
      {isPublished && settlement.amendedAt && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-800 flex items-center justify-between gap-2">
          <span>
            正式榜为 {settlement.publishedAt} 发布版本，其后 {settlement.amendedAt} 发生过调账，建议重新结算发布修订版。
          </span>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveSubPage('settlement_pipeline')}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0 cursor-pointer"
            >
              去重新发布
            </button>
          )}
        </div>
      )}

      {/* Honor Podium Banner (Top 1) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-100">本周流动红旗领跑班级</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {podiumName} · {podiumScore !== null ? podiumScore.toFixed(1) : '—'}分
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveSubPage('score_detail')}
          className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium cursor-pointer"
        >
          查看明细
        </button>
      </div>

      {/* Class Leaderboard List（发布态用快照 rankings，未发布态用实时分） */}
      <div className="space-y-2">
        {(useSnapshot ? snapshotRows : filteredClasses).map((row: any, index) => {
          const cls = useSnapshot ? classes.find(c => c.id === row.classId) : row;
          const rank = useSnapshot ? row.rank : index + 1;
          const displayScore = useSnapshot ? row.finalScore : row.currentScore;
          const displayName = useSnapshot ? row.className : row.name;
          const displayGrade = useSnapshot ? row.grade : row.grade;
          const displayHomeroom = cls?.homeroomTeacher || '';
          const isTop3 = rank <= 3;
          const isMyClass = currentUser.homeroomClassId === (row.classId || row.id);

          return (
            <div
              key={row.classId || row.id}
              onClick={() => setActiveSubPage('score_detail')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isMyClass
                  ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    rank === 1
                      ? 'bg-amber-400 text-amber-950 shadow-2xs'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-800'
                      : rank === 3
                      ? 'bg-amber-700/30 text-amber-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {rank}
                </div>

                {/* Class Info (Student privacy respected: only class and homeroom teacher) */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {displayName}
                    </span>
                    {isTop3 && (
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                    )}
                    {isMyClass && (
                      <span className="text-[10px] px-1 rounded bg-blue-600 text-white font-medium">
                        我的班级
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {displayGrade} · 班主任：{displayHomeroom}
                  </div>
                </div>
              </div>

              {/* Score and chevron */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-base font-extrabold font-mono text-slate-900">
                    {Number(displayScore).toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    基准100分
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy compliance notice */}
      <div className="text-center text-[11px] text-slate-400 pt-2">
        遵循《中小学生个人信息保护规范》· 常规考评榜单仅展示班集体总分，不展示学生个人名单
      </div>
    </div>
  );
};
