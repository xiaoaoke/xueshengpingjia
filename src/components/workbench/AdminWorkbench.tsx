import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  CalendarClock, 
  CheckSquare, 
  TrendingUp, 
  BarChart3, 
  Settings2, 
  ChevronRight, 
  ArrowUpRight, 
  AlertCircle, 
  ShieldAlert, 
  FileCheck2, 
  RotateCcw,
  MapPin,
  BookOpen,
  Layers,
  ShieldCheck,
  X,
  Check
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { ScoreBadge } from '../common/ScoreBadge';

export const AdminWorkbench: React.FC = () => {
  const [showAuditModal, setShowAuditModal] = React.useState(false);
  const {
    currentUser,
    setCurrentTab,
    setActiveSubPage,
    setSelectedRecordId,
    records,
    rectifications,
    appeals,
    moralAuditEnabled,
    setMoralAuditEnabled
  } = useDuty();

  const pendingAuditRecords = records.filter(r => r.status === 'pending_audit');
  const pendingRechecks = rectifications.filter(t => t.status === 'submitted');
  const pendingAppeals = appeals.filter(a => a.status === 'pending');
  const pendingRectifies = rectifications.filter(t => t.status === 'pending');

  // 统计口径统一：实时记录数（mock 常量 totalInspections 不再作为展示源）
  const totalTodayInspections = records.length;

  return (
    <div className="space-y-4 pb-16">
      {/* Top Admin Summary Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-[#0d182e] to-slate-900 rounded-3xl p-5 text-white shadow-[0_8px_24px_rgba(15,23,42,0.3)] border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1.5">
            <span className="font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              管理工作台 · 德育处总揽
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-400/30">
              第6教学周
            </span>
          </div>

          <div className="mt-2.5">
            <div className="text-xs text-slate-300 font-medium">本周常规巡查任务完成率</div>
            <div className="text-3xl font-black tracking-tight font-mono text-white mt-0.5">
              82.5%
            </div>
            <div className="text-xs text-blue-200 mt-1.5 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
              <span>{pendingAuditRecords.length} 条检查记录等待审核生效</span>
            </div>
          </div>
        </div>

        {/* Ambient glow backdrop */}
        <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 3 Large KPI Number Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div 
          onClick={() => {
            setActiveSubPage('records_list');
          }}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center cursor-pointer hover:border-blue-300 hover:scale-[1.02] transition-all"
        >
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {totalTodayInspections}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">累计检查</div>
        </div>

        <div 
          onClick={() => {
            setCurrentTab('approvals');
            setActiveSubPage('audit_center');
          }}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center cursor-pointer hover:border-amber-300 hover:scale-[1.02] transition-all"
        >
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {pendingAuditRecords.length}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">待审核</div>
        </div>

        <div 
          onClick={() => {
            setCurrentTab('approvals');
            setActiveSubPage('rectify_list');
          }}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center cursor-pointer hover:border-orange-300 hover:scale-[1.02] transition-all"
        >
          <div className="text-2xl font-black text-orange-600 font-mono tracking-tight">
            {pendingRectifies.length + pendingRechecks.length}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">待整改</div>
        </div>
      </div>

      {/* Quick Action Matrix (8项快捷功能导航，规范统一的 Design System 样式) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
            <span className="text-xs font-black text-slate-900 tracking-tight">快捷功能</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">管理与调度</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* 1. Schedule Management */}
          <button
            onClick={() => {
              setCurrentTab('tasks');
              setActiveSubPage('schedule_admin');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100/90 group-hover:from-blue-600 group-hover:to-indigo-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <CalendarClock className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700 whitespace-nowrap transition-colors">
              值周排班
            </span>
          </button>

          {/* 2. Duty Post Management */}
          <button
            onClick={() => {
              setActiveSubPage('duty_posts');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100/90 group-hover:from-indigo-600 group-hover:to-purple-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <MapPin className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-700 whitespace-nowrap transition-colors">
              岗位管理
            </span>
          </button>

          {/* 2.5 Weekly Duty Brief */}
          <button
            onClick={() => {
              setActiveSubPage('duty_brief');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-50 to-teal-100/90 group-hover:from-teal-600 group-hover:to-emerald-600 text-teal-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-teal-700 whitespace-nowrap transition-colors">
              值周任务书
            </span>
          </button>

          {/* 3. Audit Approvals */}
          <button
            onClick={() => {
              setCurrentTab('approvals');
              setActiveSubPage('audit_center');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center relative"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100/90 group-hover:from-amber-600 group-hover:to-amber-700 text-amber-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs relative">
              <CheckSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
              {pendingAuditRecords.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {pendingAuditRecords.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-amber-700 whitespace-nowrap transition-colors">
              检查审核
            </span>
          </button>

          {/* 4. Settlement / Score Publishing (成绩发布) */}
          <button
            onClick={() => {
              setCurrentTab('scores');
              setActiveSubPage('settlement_pipeline');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-100/90 group-hover:from-emerald-600 group-hover:to-teal-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 whitespace-nowrap transition-colors">
              成绩发布
            </span>
          </button>

          {/* 5. Analytics */}
          <button
            onClick={() => {
              setCurrentTab('profile');
              setActiveSubPage('data_analytics');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-50 to-fuchsia-100/90 group-hover:from-purple-600 group-hover:to-fuchsia-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <BarChart3 className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-purple-700 whitespace-nowrap transition-colors">
              数据统计
            </span>
          </button>

          {/* 6. Score Rules */}
          <button
            onClick={() => setActiveSubPage('score_rules')}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-50 to-red-100/90 group-hover:from-rose-600 group-hover:to-red-600 text-rose-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-rose-700 whitespace-nowrap transition-colors">
              评分规则
            </span>
          </button>

          {/* 7. Class Structure */}
          <button
            onClick={() => setActiveSubPage('class_structure')}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-50 to-cyan-100/90 group-hover:from-sky-600 group-hover:to-cyan-600 text-sky-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <Layers className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-sky-700 whitespace-nowrap transition-colors">
              班级架构
            </span>
          </button>

          {/* 8. Moral Audit Policy Config Button */}
          <button
            onClick={() => setShowAuditModal(true)}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95 text-center relative"
            title="点击打开德育处审批设置"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-100/90 group-hover:from-orange-600 group-hover:to-amber-600 text-orange-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <ShieldCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 group-hover:text-orange-700 whitespace-nowrap transition-colors">
              审批设置
            </span>
          </button>
        </div>
      </div>

      {/* Moral Audit Global Policy Card (超管德育处审批开关) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              moralAuditEnabled ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">德育处审批设置</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  moralAuditEnabled 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {moralAuditEnabled ? '需要审批' : '免审即生效'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {moralAuditEnabled
                  ? '开启中：扣分/常规记录按规则送审复核；加分项始终需审核，防止刷分'
                  : '已关闭：扣分记录直接实时计入班级积分榜；加分项仍需审核，防止刷分'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={moralAuditEnabled}
            onClick={() => setMoralAuditEnabled(!moralAuditEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-2xs ${
              moralAuditEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                moralAuditEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Administrative Todos (管理待办) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>管理待办处理</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {pendingAuditRecords.length + pendingRechecks.length + pendingAppeals.length} 项待处理
          </span>
        </div>

        <div className="space-y-2">
          {/* Item 1: Inspection Audit */}
          <div 
            onClick={() => {
              setCurrentTab('approvals');
              setActiveSubPage('audit_center');
            }}
            className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100/70 transition-colors flex items-center justify-between cursor-pointer gap-2"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  检查记录待审核
                </div>
                <div className="text-[11px] text-amber-700 truncate">
                  {pendingAuditRecords.length} 条需要德育处审核确认分值
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-amber-800 shrink-0 whitespace-nowrap">
              <span>立即处理</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </div>
          </div>

          {/* Item 2: Rectification Recheck */}
          <div 
            onClick={() => {
              setCurrentTab('approvals');
              setActiveSubPage('rectify_list');
            }}
            className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 hover:bg-blue-100/70 transition-colors flex items-center justify-between cursor-pointer gap-2"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  整改验收复查
                </div>
                <div className="text-[11px] text-blue-700 truncate">
                  {pendingRechecks.length} 条班主任已反馈，等待实地/照片验收
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-blue-800 shrink-0 whitespace-nowrap">
              <span>去复查</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </div>
          </div>

          {/* Item 3: Appeal Arbitration */}
          {pendingAppeals.length > 0 && (
            <div 
              onClick={() => {
                setCurrentTab('approvals');
                setActiveSubPage('appeal_list');
              }}
              className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 hover:bg-purple-100/70 transition-colors flex items-center justify-between cursor-pointer gap-2"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    班主任扣分申诉待裁决
                  </div>
                  <div className="text-[11px] text-purple-700 truncate">
                    {pendingAppeals.length} 条申诉请求等待核实证据
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-purple-800 shrink-0 whitespace-nowrap">
                <span>仲裁复核</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Moral Audit Policy Configuration Modal (审批设置弹窗) */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">德育处审批策略设置</h3>
                  <p className="text-[11px] text-slate-500">配置巡查扣分是否需要管理员二次复核</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              <div
                onClick={() => setMoralAuditEnabled(true)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  moralAuditEnabled 
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">需要德育处审批</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">常规模式</span>
                  </div>
                  {moralAuditEnabled && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  值周教师录入后推送至德育处待办池，管理员审核确认后正式计入班级积分榜。加分项始终需审核。
                </p>
              </div>

              <div
                onClick={() => setMoralAuditEnabled(false)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  !moralAuditEnabled 
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">免审模式（即时生效）</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">快速模式</span>
                  </div>
                  {!moralAuditEnabled && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  值周教师录入扣分后直接实时计入班级积分榜，免二次审核。加分项仍自动送审，防止刷分。
                </p>
              </div>
            </div>

            {/* Bottom Confirm */}
            <button
              onClick={() => setShowAuditModal(false)}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              完成并保存配置
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
