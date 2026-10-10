import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { todayString } from '../../utils/prototypeClock';
import { LogIn, CheckCircle, UserX } from 'lucide-react';
import { 
  ClipboardPen, 
  CalendarDays, 
  FileText, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck 
} from 'lucide-react';
export const TeacherWorkbench: React.FC = () => {
  const {
    currentUser,
    setCurrentTab,
    setActiveSubPage,
    records,
    shifts,
    checkInShift,
    completeShift,
    reportShiftAbsence
  } = useDuty();

  const [absenceShiftId, setAbsenceShiftId] = React.useState<string | null>(null);
  const [absenceReason, setAbsenceReason] = React.useState('');

  // Teacher specific statistics（今日=原型时钟的今天）
  const today = todayString();
  const myTodayShifts = shifts.filter(s => s.teacherId === currentUser.id && s.date === today);
  const completedShifts = myTodayShifts.filter(s => s.status === 'completed').length;

  const myRecords = records.filter(r => r.inspectorId === currentUser.id);
  const myPendingAudit = myRecords.filter(r => r.status === 'pending_audit').length;
  const myRejected = myRecords.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-4 pb-16">
      {/* Top Welcome & Duty Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-5 text-white shadow-[0_8px_24px_rgba(37,99,235,0.22)] border border-blue-400/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-blue-100 mb-1.5">
            <span className="font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              值周工作台 · 教师端
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md font-mono text-[11px] border border-white/20">
              第6周 · 周五
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight mb-1 text-white">
            你好，{currentUser.name}
          </h2>
          <p className="text-xs text-blue-100 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>负责区域：{currentUser.dutyZone || '知行楼二层及中庭'}</span>
          </p>

          {/* Progress bar */}
          <div className="mt-4 pt-3.5 border-t border-white/15">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-blue-100">今日巡查任务进度</span>
              <span className="font-mono font-bold">{completedShifts} / {myTodayShifts.length || 4} 项完成</span>
            </div>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-300 shadow-xs" 
                style={{ width: `${(completedShifts / (myTodayShifts.length || 4)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {myRecords.length}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">累计检查</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {myPendingAudit}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">等待审核</div>
        </div>
        <div 
          onClick={() => {
            if (myRejected > 0) {
              setActiveSubPage('records_list');
            }
          }}
          className={`p-3.5 rounded-2xl border shadow-2xs text-center cursor-pointer transition-all ${
            myRejected > 0 
              ? 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/90 hover:scale-[1.02]' 
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className={`text-2xl font-black font-mono tracking-tight ${myRejected > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {myRejected}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">被退回记录</div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-600 tracking-tight flex items-center justify-between">
          <span>快捷功能</span>
          <span className="text-[11px] text-slate-400 font-normal">一键直达</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Quick Inspect */}
          <button
            onClick={() => {
              setActiveSubPage('quick_inspect');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-blue-50/70 transition-all text-slate-700 hover:text-blue-700 cursor-pointer group active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100/80 group-hover:from-blue-600 group-hover:to-indigo-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <ClipboardPen className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[12px] leading-none font-bold text-slate-800 whitespace-nowrap">快速检查</span>
          </button>

          {/* My Schedule (明确跳转至排班 Tab 2) */}
          <button
            onClick={() => {
              setCurrentTab('tasks');
              setActiveSubPage(null);
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-indigo-50/70 transition-all text-slate-700 hover:text-indigo-700 cursor-pointer group active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100/80 group-hover:from-indigo-600 group-hover:to-purple-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <CalendarDays className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[12px] leading-none font-bold text-slate-800 whitespace-nowrap">我的排班</span>
          </button>

          {/* Records List (打开检查记录子页面，保持在工作台上下文，绝不跳到排班 Tab) */}
          <button
            onClick={() => {
              setActiveSubPage('records_list');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-emerald-50/70 transition-all text-slate-700 hover:text-emerald-700 cursor-pointer group active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-100/80 group-hover:from-emerald-600 group-hover:to-teal-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <History className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[12px] leading-none font-bold text-slate-800 whitespace-nowrap">检查记录</span>
          </button>

          {/* Duty Log */}
          <button
            onClick={() => {
              setActiveSubPage('duty_log');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-100/90 group-hover:from-amber-600 group-hover:to-orange-600 text-amber-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <FileText className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[12px] leading-none font-bold text-slate-800 whitespace-nowrap">值周日志</span>
          </button>

          {/* Weekly Duty Brief */}
          <button
            onClick={() => {
              setActiveSubPage('duty_brief');
            }}
            className="flex flex-col items-center px-0.5 py-2.5 rounded-2xl hover:bg-slate-50 transition-all text-slate-700 cursor-pointer group active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-50 to-teal-100/90 group-hover:from-teal-600 group-hover:to-emerald-600 text-teal-600 group-hover:text-white flex items-center justify-center transition-all mb-1.5 shadow-2xs">
              <ClipboardPen className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[12px] leading-none font-bold text-slate-800 whitespace-nowrap">任务书</span>
          </button>
        </div>
      </div>

      {/* Today's Shifts Timeline */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">今日值周时段安排</h3>
          <button
            onClick={() => {
              setCurrentTab('tasks');
              setActiveSubPage(null);
            }}
            className="text-xs text-blue-600 hover:underline flex items-center cursor-pointer"
          >
            <span>全周安排</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {myTodayShifts.map((shift, idx) => (
            <div
              key={shift.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                shift.status === 'completed'
                  ? 'bg-slate-50 border-slate-200 text-slate-500'
                  : shift.status === 'in_progress'
                  ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  shift.status === 'completed'
                    ? 'bg-emerald-100/70 text-emerald-600'
                    : shift.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {shift.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : shift.status === 'in_progress' ? (
                    <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {shift.timeSlot}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {shift.zone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                {shift.absenceReason ? (
                  <span className="text-[11px] font-medium text-rose-600 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200/60">
                    {shift.substituteTeacherName ? `代岗：${shift.substituteTeacherName}` : '已报缺岗·待代岗'}
                  </span>
                ) : shift.status === 'completed' ? (
                  <span className="text-[11px] font-medium text-slate-400 px-2 py-1 rounded-lg bg-slate-100">
                    已执勤{shift.checkInAt ? ` ${shift.checkInAt.slice(11)}` : ''}
                  </span>
                ) : shift.status === 'in_progress' ? (
                  <>
                    <button
                      onClick={() => setActiveSubPage('quick_inspect')}
                      className="px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 transition-all"
                    >
                      <span>去检查</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => completeShift(shift.id)}
                      className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl hover:bg-emerald-100 cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>完成执勤</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => checkInShift(shift.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-95 transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>签到</span>
                    </button>
                    <button
                      onClick={() => {
                        setAbsenceShiftId(shift.id);
                        setAbsenceReason('');
                      }}
                      className="w-8 h-8 flex items-center justify-center text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl cursor-pointer shrink-0 transition-colors"
                      title="请假/缺岗上报"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 缺岗/请假上报弹窗 */}
      {absenceShiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">请假 / 缺岗上报</h3>
              <button
                onClick={() => setAbsenceShiftId(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                取消
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">无法到岗原因</label>
              <textarea
                rows={3}
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                placeholder="如：参加教研活动 / 身体不适请假，请写明事由便于德育处安排代岗..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-rose-400 text-xs leading-relaxed"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAbsenceShiftId(null)}
                className="w-1/3 h-10 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!absenceReason.trim()) {
                    alert('请填写无法到岗原因');
                    return;
                  }
                  reportShiftAbsence(absenceShiftId, absenceReason.trim());
                  setAbsenceShiftId(null);
                }}
                className="w-2/3 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                提交缺岗上报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
