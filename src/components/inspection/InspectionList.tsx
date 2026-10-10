import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  Filter, 
  Search, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Building, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ScoreBadge } from '../common/ScoreBadge';
import { RecordStatus } from '../../types';

export const InspectionList: React.FC = () => {
  const { 
    records, 
    setCurrentTab,
    activeSubPage,
    setActiveSubPage, 
    setSelectedRecordId, 
    classes, 
    currentUser,
    rectifications,
    appeals
  } = useDuty();

  const isHomeroom = currentUser.role === 'homeroom_teacher';
  const myClassId = currentUser.homeroomClassId || 'class_g1_1';
  const myClassObj = classes.find((c) => c.id === myClassId);

  // 状态筛选与考评维度筛选
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  // 班主任视角严格锁定本班，非班主任可筛选全校班级
  const [classFilter, setClassFilter] = useState<string>(isHomeroom ? myClassId : 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 统计班主任当前关心的本班待办
  const myPendingRectifies = rectifications.filter((r) => r.classId === myClassId && r.status === 'pending').length;
  const myPendingAppeals = appeals.filter((a) => a.classId === myClassId && (a.status === 'pending' || a.status === 'need_more_info')).length;

  const filteredRecords = records.filter((rec) => {
    // 权限红线：班主任角色严格只允许查看本班流水，绝不能看全校或其他班级
    if (isHomeroom && rec.classId !== myClassId) return false;
    if (!isHomeroom && classFilter !== 'all' && rec.classId !== classFilter) return false;
    // 双轨制后 'appealing' 不再写入 record.status，该筛选项改按"存在未决申诉"过滤
    if (statusFilter === 'appealing') {
      const hasAppeal = appeals.some((a) => a.recordId === rec.id && a.status !== 'resolved');
      if (!hasAppeal) return false;
    } else if (statusFilter !== 'all' && rec.status !== statusFilter) {
      return false;
    }
    if (categoryFilter !== 'all' && rec.ruleCategory !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        rec.className.toLowerCase().includes(q) ||
        rec.ruleTitle.toLowerCase().includes(q) ||
        rec.inspectorName.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const categoryOptions = [
    { key: 'all', label: '全部考评维度' },
    { key: 'hygiene', label: '环境卫生' },
    { key: 'discipline', label: '课间纪律' },
    { key: 'uniform', label: '仪表仪容' },
    { key: 'exercises', label: '两操常规' },
    { key: 'dormitory', label: '宿舍午休' },
    { key: 'safety', label: '校园安全' }
  ];

  const categoryLabelMap: Record<string, string> = {
    hygiene: '环境卫生',
    discipline: '课间纪律',
    uniform: '仪表仪容',
    exercises: '两操常规',
    dormitory: '宿舍午休',
    safety: '校园安全'
  };

  return (
    <div className="space-y-3 pb-20 animate-in fade-in duration-150">
      {/* Top title and quick action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              if (activeSubPage) {
                setActiveSubPage(null);
              } else {
                setCurrentTab('workbench');
              }
            }}
            className="p-1.5 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
            title="返回工作台"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {isHomeroom ? `${myClassObj?.name || '高一(1)班'} · 巡查台账` : '常规检查记录'}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              {isHomeroom 
                ? `本班受检流水共 ${filteredRecords.length} 条 · 扣分实时入账` 
                : `共检索到 ${filteredRecords.length} 条记录`}
            </p>
          </div>
        </div>

        {/* 右侧操作按钮区分：班主任不可新建扣分，值周教师/管理员可快速检查 */}
        {isHomeroom ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {myPendingRectifies > 0 ? (
              <button
                onClick={() => {
                  setCurrentTab('approvals');
                  setActiveSubPage('rectify_list');
                }}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors animate-pulse"
              >
                <span>整改待办({myPendingRectifies})</span>
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[10px] font-bold">
                班级受检看板
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveSubPage('quick_inspect')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>快速检查</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { key: 'all', label: '全部' },
          { key: 'pending_audit', label: '待审核' },
          { key: 'active', label: '已生效' },
          { key: 'need_rectify', label: '待整改' },
          { key: 'rejected', label: '已退回' },
          { key: 'appealing', label: '申诉中' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
              statusFilter === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter Row: 班主任严格锁定本班只能按考评维度筛选，非班主任可筛选全校班级 */}
      {isHomeroom ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索考评项目/说明..."
              className="w-full h-9 pl-8 pr-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium text-slate-700"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索班级/项目..."
              className="w-full h-9 pl-8 pr-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 px-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium text-slate-700"
          >
            <option value="all">全校班级</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Records List */}
      <div className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {isHomeroom ? `${myClassObj?.name || '本班'}暂无符合条件的受检记录` : '暂无符合条件的检查记录'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isHomeroom ? '常规考评表现优秀，继续保持' : '请尝试切换筛选状态或发起新巡查'}
            </p>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              onClick={() => {
                setSelectedRecordId(rec.id);
                setActiveSubPage('record_detail');
              }}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
            >
              {/* 卡片顶部行：彻底修复折行与错位 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {isHomeroom ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0 whitespace-nowrap">
                      {categoryLabelMap[rec.ruleCategory] || '常规项'}
                    </span>
                  ) : (
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                      {rec.className}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-800 truncate" title={rec.ruleTitle}>
                    {rec.ruleTitle}
                  </span>
                </div>
                <div className="shrink-0">
                  <StatusBadge
                    status={rec.status}
                    size="sm"
                    appealPending={appeals.some((a) => a.recordId === rec.id && a.status !== 'resolved')}
                  />
                </div>
              </div>

              {rec.description && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rec.description}
                </p>
              )}

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{rec.inspectorName} 提交</span>
                  <span aria-hidden="true">·</span>
                  <span>{rec.timeSlotName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ScoreBadge score={rec.score} isPendingAudit={rec.status === 'pending_audit'} size="sm" />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
