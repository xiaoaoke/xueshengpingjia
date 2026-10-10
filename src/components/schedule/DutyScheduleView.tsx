import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import {
  CalendarDays,
  Plus,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  MapPin,
  Trash2,
  Calendar,
  Sparkles,
  RefreshCw,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  LayoutGrid,
  BookOpen
} from 'lucide-react';
import { DutyShift } from '../../types';
import { 
  checkTeacherScheduleConflict, 
  getAvailableTeachersForSlot, 
  scanDayConflicts 
} from '../../utils/scheduleConflict';

// 最近一个月的 4 个教学周定义（涵盖 9月21日 至 10月16日）
export interface WeekInfo {
  weekNum: number;
  name: string;
  rangeText: string;
  isCurrent: boolean;
  days: {
    day: string;
    date: string;
    monthDay: string;
    displayNum: string;
    isWeekend?: boolean;
  }[];
}

const RECENT_MONTH_WEEKS: WeekInfo[] = [
  {
    weekNum: 4,
    name: '第4教学周',
    rangeText: '09/21 - 09/27',
    isCurrent: false,
    days: [
      { day: '周一', date: '2026-09-21', monthDay: '09/21', displayNum: '21', isWeekend: false },
      { day: '周二', date: '2026-09-22', monthDay: '09/22', displayNum: '22', isWeekend: false },
      { day: '周三', date: '2026-09-23', monthDay: '09/23', displayNum: '23', isWeekend: false },
      { day: '周四', date: '2026-09-24', monthDay: '09/24', displayNum: '24', isWeekend: false },
      { day: '周五', date: '2026-09-25', monthDay: '09/25', displayNum: '25', isWeekend: false },
      { day: '周六', date: '2026-09-26', monthDay: '09/26', displayNum: '26', isWeekend: true },
      { day: '周日', date: '2026-09-27', monthDay: '09/27', displayNum: '27', isWeekend: true }
    ]
  },
  {
    weekNum: 5,
    name: '第5教学周',
    rangeText: '09/28 - 10/04',
    isCurrent: false,
    days: [
      { day: '周一', date: '2026-09-28', monthDay: '09/28', displayNum: '28', isWeekend: false },
      { day: '周二', date: '2026-09-29', monthDay: '09/29', displayNum: '29', isWeekend: false },
      { day: '周三', date: '2026-09-30', monthDay: '09/30', displayNum: '30', isWeekend: false },
      { day: '周四', date: '2026-10-01', monthDay: '10/01', displayNum: '1', isWeekend: false },
      { day: '周五', date: '2026-10-02', monthDay: '10/02', displayNum: '2', isWeekend: false },
      { day: '周六', date: '2026-10-03', monthDay: '10/03', displayNum: '3', isWeekend: true },
      { day: '周日', date: '2026-10-04', monthDay: '10/04', displayNum: '4', isWeekend: true }
    ]
  },
  {
    weekNum: 6,
    name: '第6教学周',
    rangeText: '10/05 - 10/11',
    isCurrent: true,
    days: [
      { day: '周一', date: '2026-10-05', monthDay: '10/05', displayNum: '5', isWeekend: false },
      { day: '周二', date: '2026-10-06', monthDay: '10/06', displayNum: '6', isWeekend: false },
      { day: '周三', date: '2026-10-07', monthDay: '10/07', displayNum: '7', isWeekend: false },
      { day: '周四', date: '2026-10-08', monthDay: '10/08', displayNum: '8', isWeekend: false },
      { day: '周五', date: '2026-10-09', monthDay: '10/09', displayNum: '9', isWeekend: false },
      { day: '周六', date: '2026-10-10', monthDay: '10/10', displayNum: '10', isWeekend: true },
      { day: '周日', date: '2026-10-11', monthDay: '10/11', displayNum: '11', isWeekend: true }
    ]
  },
  {
    weekNum: 7,
    name: '第7教学周',
    rangeText: '10/12 - 10/18',
    isCurrent: false,
    days: [
      { day: '周一', date: '2026-10-12', monthDay: '10/12', displayNum: '12', isWeekend: false },
      { day: '周二', date: '2026-10-13', monthDay: '10/13', displayNum: '13', isWeekend: false },
      { day: '周三', date: '2026-10-14', monthDay: '10/14', displayNum: '14', isWeekend: false },
      { day: '周四', date: '2026-10-15', monthDay: '10/15', displayNum: '15', isWeekend: false },
      { day: '周五', date: '2026-10-16', monthDay: '10/16', displayNum: '16', isWeekend: false },
      { day: '周六', date: '2026-10-17', monthDay: '10/17', displayNum: '17', isWeekend: true },
      { day: '周日', date: '2026-10-18', monthDay: '10/18', displayNum: '18', isWeekend: true }
    ]
  }
];

export const DutyScheduleView: React.FC = () => {
  const {
    currentUser,
    setCurrentTab,
    setActiveSubPage,
    shifts,
    dutyPosts,
    allUsers,
    addShift,
    updateShift,
    deleteShift,
    checkInShift,
    completeShift,
    reportShiftAbsence,
    approveShiftSubstitute,
    openModal,
    showToast
  } = useDuty();

  const isAdmin = currentUser.role === 'admin';

  // 视角范围：管理员默认看全校 ('all')；值周教师默认严格只看自己的排班 ('mine')，杜绝出现其他老师
  const [scopeFilter, setScopeFilter] = useState<'mine' | 'all'>(isAdmin ? 'all' : 'mine');

  // 当登录用户身份切换时，同步更新视角范围
  React.useEffect(() => {
    setScopeFilter(currentUser.role === 'admin' ? 'all' : 'mine');
  }, [currentUser.id, currentUser.role]);

  // 视图模式：'week' (周视图) | 'month' (最近一月全景月历)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // 当前周索引（默认为第6教学周，即索引2）
  const [currentWeekIdx, setCurrentWeekIdx] = useState<number>(2);

  // 当前选中的日期（默认为 2026-10-09 周五）
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-09');
  const [selectedDay, setSelectedDay] = useState<string>('周五');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state for adding shift
  const [selectedPostId, setSelectedPostId] = useState<string>(dutyPosts[0]?.id || 'custom');
  const [newTeacherId, setNewTeacherId] = useState<string>(currentUser.id);
  const [newDate, setNewDate] = useState<string>('2026-10-09');
  const [newDayOfWeek, setNewDayOfWeek] = useState<string>('周五');
  const [newTimeSlot, setNewTimeSlot] = useState<string>('晨门礼仪巡查 (07:20-08:00)');
  const [newZone, setNewZone] = useState<string>('知行楼二层及中庭');

  // Quick reassign modal state
  const [reassignShift, setReassignShift] = useState<DutyShift | null>(null);
  const [reassignTeacherId, setReassignTeacherId] = useState<string>('');
  // 代岗指派弹窗（缺岗班次）
  const [showSubstituteModal, setShowSubstituteModal] = useState<boolean>(false);

  const currentWeek = RECENT_MONTH_WEEKS[currentWeekIdx] || RECENT_MONTH_WEEKS[2];

  // 快速切换周次
  const handlePrevWeek = () => {
    if (currentWeekIdx > 0) {
      const nextIdx = currentWeekIdx - 1;
      setCurrentWeekIdx(nextIdx);
      const targetWeek = RECENT_MONTH_WEEKS[nextIdx];
      setSelectedDate(targetWeek.days[0].date);
      setSelectedDay(targetWeek.days[0].day);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIdx < RECENT_MONTH_WEEKS.length - 1) {
      const nextIdx = currentWeekIdx + 1;
      setCurrentWeekIdx(nextIdx);
      const targetWeek = RECENT_MONTH_WEEKS[nextIdx];
      setSelectedDate(targetWeek.days[0].date);
      setSelectedDay(targetWeek.days[0].day);
    }
  };

  const handleResetToToday = () => {
    setCurrentWeekIdx(2);
    setSelectedDate('2026-10-09');
    setSelectedDay('周五');
    showToast('已回到本周今日 (10/09 周五)', 'info');
  };

  // 点击选择特定日期
  const handleSelectSpecificDay = (day: string, date: string, weekIdx?: number) => {
    setSelectedDay(day);
    setSelectedDate(date);
    if (weekIdx !== undefined) {
      setCurrentWeekIdx(weekIdx);
    }
    setNewDate(date);
    setNewDayOfWeek(day);
  };

  // 根据当前日期及视角范围精确过滤排班列表（值周教师视角严格只过滤本人）
  const filteredShifts = shifts.filter((s) => {
    const isDateMatch = s.date ? s.date === selectedDate : s.dayOfWeek === selectedDay;
    if (!isDateMatch) return false;
    // 值周教师视角严格只展示本人排班，绝不能混入其他老师
    if (scopeFilter === 'mine') {
      return s.teacherId === currentUser.id;
    }
    return true;
  });

  // 获取特定日期的排班列表（用于周视图日历卡片和月历统计，严格遵从个人/全校视角）
  const getShiftsForDate = (date: string, dayOfWeek: string) => {
    return shifts.filter((s) => {
      const isDateMatch = s.date ? s.date === date : (!s.date && s.dayOfWeek === dayOfWeek);
      if (!isDateMatch) return false;
      if (scopeFilter === 'mine') {
        return s.teacherId === currentUser.id;
      }
      return true;
    });
  };

  // 当日冲突检测
  const dayConflicts = scanDayConflicts(filteredShifts, selectedDay);

  // 岗位联动预填
  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId);
    if (postId === 'custom') return;
    const post = dutyPosts.find((p) => p.id === postId);
    if (post) {
      setNewZone(post.location);
      if (post.defaultTeacherId) {
        setNewTeacherId(post.defaultTeacherId);
      }
      if (post.timeSlots && post.timeSlots.length > 0) {
        setNewTimeSlot(post.timeSlots[0]);
      }
      showToast(`已联动载入【${post.name}】的区域与教师`, 'info');
    }
  };

  // 实时冲突校验
  const selectedTeacherObj = allUsers.find((u) => u.id === newTeacherId);
  const modalConflict = checkTeacherScheduleConflict(
    shifts,
    newTeacherId,
    selectedTeacherObj?.name || '巡查教师',
    newDate,
    newDayOfWeek,
    newTimeSlot
  );

  const availableTeachers = getAvailableTeachersForSlot(
    allUsers,
    shifts,
    newDate,
    newDayOfWeek,
    newTimeSlot
  );

  const handleCreateShift = () => {
    const teacher = allUsers.find((u) => u.id === newTeacherId);
    if (modalConflict.hasConflict) {
      openModal({
        type: 'schedule_conflict',
        title: '排班逻辑冲突提示',
        message: modalConflict.reason,
        confirmText: '我知道了，重新选择人员',
        onConfirm: () => {}
      });
      return;
    }

    const res = addShift({
      postId: selectedPostId !== 'custom' ? selectedPostId : undefined,
      date: newDate,
      dayOfWeek: newDayOfWeek,
      timeSlot: newTimeSlot,
      zone: newZone,
      teacherId: newTeacherId,
      teacherName: teacher?.name || '巡查教师',
      status: 'pending'
    });

    if (!res.success && res.conflict) {
      openModal({
        type: 'schedule_conflict',
        title: '排班时间冲突',
        message: res.conflict,
        confirmText: '我知道了',
        onConfirm: () => {}
      });
    } else {
      setShowAddModal(false);
      showToast('新增排班成功！', 'success');
    }
  };

  const handleOpenReassign = (shift: DutyShift) => {
    setReassignShift(shift);
    const freeTeachers = getAvailableTeachersForSlot(
      allUsers,
      shifts,
      shift.date,
      shift.dayOfWeek,
      shift.timeSlot,
      shift.id
    );
    setReassignTeacherId(freeTeachers[0]?.id || allUsers[0]?.id || '');
  };

  const handleConfirmReassign = () => {
    if (!reassignShift || !reassignTeacherId) return;
    const targetTeacher = allUsers.find((u) => u.id === reassignTeacherId);
    if (!targetTeacher) return;

    const res = updateShift(reassignShift.id, {
      teacherId: targetTeacher.id,
      teacherName: targetTeacher.name
    });

    if (!res.success && res.conflict) {
      showToast(`调班失败：${res.conflict}`, 'error');
    } else {
      showToast(`已成功将执勤人调换为【${targetTeacher.name}】`, 'success');
      setReassignShift(null);
    }
  };

  // 全月排班统计
  const totalMonthShifts = shifts.length;

  return (
    <div className="space-y-3.5 pb-16 animate-in fade-in duration-150">
      {/* 1. 顶部标题与操作栏 (重构为两层自适应布局，彻底消除挤压折行) */}
      <div className="space-y-2">
        {/* Row 1: Title + Action Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="text-sm font-black text-slate-900 tracking-tight whitespace-nowrap shrink-0">
              {currentUser.role === 'admin' 
                ? '全校值周排班管理' 
                : (currentUser.role === 'homeroom_teacher' ? '全校值周执勤公示' : '我的值周排班')}
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200/60 whitespace-nowrap shrink-0">
              最近1月
            </span>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                setNewDate(selectedDate);
                setNewDayOfWeek(selectedDay);
                setShowAddModal(true);
              }}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>新增排班</span>
            </button>
          )}
          <button
            onClick={() => setActiveSubPage('duty_brief')}
            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors active:scale-95 shrink-0 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>任务书</span>
          </button>
        </div>

        {/* 班主任角色身份引导说明 */}
        {currentUser.role === 'homeroom_teacher' && (
          <div className="p-3 bg-indigo-50/80 border border-indigo-200/90 rounded-2xl flex items-center justify-between gap-2.5 text-xs text-indigo-950">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
              <span className="truncate">
                您当前为<strong>班主任</strong>，无需参与值周巡查。
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('tasks')}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-2xs"
            >
              返回班级台账
            </button>
          </div>
        )}

        {/* Row 2: Subtitle info + View Switcher pill */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="text-[11px] text-slate-500 truncate min-w-0">
            2026秋季学期 · 第4至第7周
          </p>

          {/* 周/月视图切换胶囊 */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 text-[11px] font-bold shrink-0">
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'week'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              周视图
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                viewMode === 'month'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>月度日历</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 周视图模式：上下周切换控制器 + 5天星期胶囊 */}
      {viewMode === 'week' && (
        <div className="space-y-2">
          {/* 周次导航翻页器 (防止任何折行) */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs">
            <button
              onClick={handlePrevWeek}
              disabled={currentWeekIdx === 0}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg font-bold transition-all shrink-0 whitespace-nowrap ${
                currentWeekIdx === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700 cursor-pointer active:scale-95'
              }`}
              title="查看前一周排班"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px]">上周</span>
            </button>

            <div className="flex items-center gap-1.5 min-w-0 justify-center">
              <span className="font-black text-slate-900 text-xs whitespace-nowrap">
                {currentWeek.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-medium whitespace-nowrap">
                ({currentWeek.rangeText})
              </span>
              {currentWeek.isCurrent ? (
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold shrink-0 whitespace-nowrap">
                  本周
                </span>
              ) : (
                <button
                  onClick={handleResetToToday}
                  className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[9px] font-bold cursor-pointer shrink-0 whitespace-nowrap"
                >
                  回本周
                </button>
              )}
            </div>

            <button
              onClick={handleNextWeek}
              disabled={currentWeekIdx === RECENT_MONTH_WEEKS.length - 1}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg font-bold transition-all shrink-0 whitespace-nowrap ${
                currentWeekIdx === RECENT_MONTH_WEEKS.length - 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700 cursor-pointer active:scale-95'
              }`}
              title="查看下一周排班"
            >
              <span className="text-[11px]">下周</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 7天星期卡片 (涵盖周一至周日完整周期，周末精细化区分) */}
          <div className="grid grid-cols-7 gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
            {currentWeek.days.map((d) => {
              const isSelected = selectedDate === d.date;
              const dayShifts = getShiftsForDate(d.date, d.day);
              const hasConflict = dayShifts.some((s) => s.hasConflict);
              const isWeekend = d.isWeekend ?? (d.day === '周六' || d.day === '周日');

              return (
                <button
                  key={d.date}
                  onClick={() => handleSelectSpecificDay(d.day, d.date)}
                  className={`py-1.5 px-0.5 rounded-xl text-center transition-all cursor-pointer relative active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-[0_4px_12px_rgba(37,99,235,0.3)] ring-1 ring-blue-500'
                      : isWeekend
                      ? 'bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 border border-amber-200/50'
                      : 'text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white'
                  }`}
                >
                  <div className={`text-[10px] tracking-tight font-medium ${
                    isSelected 
                      ? 'text-blue-100' 
                      : isWeekend 
                      ? 'text-amber-700 font-semibold' 
                      : 'text-slate-500'
                  }`}>
                    {d.day}
                  </div>
                  <div className={`text-[11px] font-mono font-black mt-0.5 tracking-tight ${
                    isSelected 
                      ? 'text-white' 
                      : isWeekend 
                      ? 'text-amber-900' 
                      : 'text-slate-800'
                  }`}>
                    {d.monthDay}
                  </div>
                  
                  {/* 排班数量小徽标 */}
                  <div className="mt-0.5">
                    {dayShifts.length > 0 ? (
                      <span className={`text-[8px] px-1 py-0.2 rounded-full font-bold inline-block leading-tight ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : isWeekend
                          ? 'bg-amber-100/90 text-amber-800 border border-amber-300/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}>
                        {dayShifts.length}岗
                      </span>
                    ) : (
                      <span className={`text-[8px] px-0.5 py-0.2 rounded-full inline-block leading-tight ${
                        isSelected 
                          ? 'text-blue-200' 
                          : isWeekend 
                          ? 'text-amber-400' 
                          : 'text-slate-400'
                      }`}>
                        无班
                      </span>
                    )}
                  </div>

                  {/* 冲突报警红点：仅学校管理员可见 */}
                  {hasConflict && currentUser.role === 'admin' && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 月度日历模式：最近一月全景矩阵 (4周连贯 7天全周制) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>最近一月排班全景日历 (周一至周日)</span>
            </div>
            <span className="text-[11px] text-slate-500">
              共计 <strong className="text-blue-600 font-bold">{totalMonthShifts}</strong> 个执勤班次
            </span>
          </div>

          {/* 星期表头 (7天制) */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 pb-1">
            <span>周一</span>
            <span>周二</span>
            <span>周三</span>
            <span>周四</span>
            <span>周五</span>
            <span className="text-amber-600 font-bold">周六</span>
            <span className="text-amber-600 font-bold">周日</span>
          </div>

          {/* 4周日历矩阵 (7列) */}
          <div className="space-y-1.5">
            {RECENT_MONTH_WEEKS.map((week, wIdx) => (
              <div key={week.weekNum} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
                  <span className="font-bold text-slate-600">{week.name}</span>
                  <span className="font-mono">{week.rangeText}</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {week.days.map((d) => {
                    const isSelected = selectedDate === d.date;
                    const dayShifts = getShiftsForDate(d.date, d.day);
                    const hasConflict = dayShifts.some((s) => s.hasConflict);
                    const isToday = d.date === '2026-10-09';
                    const isWeekend = d.isWeekend ?? (d.day === '周六' || d.day === '周日');

                    return (
                      <button
                        key={d.date}
                        onClick={() => handleSelectSpecificDay(d.day, d.date, wIdx)}
                        className={`p-1 rounded-xl text-center border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                            : isToday
                            ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-bold hover:bg-blue-100'
                            : isWeekend
                            ? 'bg-amber-50/60 border-amber-200/60 text-amber-950 hover:bg-amber-100/70'
                            : 'bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px]">
                          <span className={`font-mono font-bold ${
                            isSelected 
                              ? 'text-white' 
                              : isWeekend 
                              ? 'text-amber-900' 
                              : 'text-slate-800'
                          }`}>
                            {d.displayNum}日
                          </span>
                          {isToday && (
                            <span className={`text-[7px] px-0.5 rounded-xs ${isSelected ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`}>
                              今
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center justify-center">
                          {dayShifts.length > 0 ? (
                            <span className={`text-[8px] px-1 py-0.2 rounded-md font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : isWeekend
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {dayShifts.length}人
                            </span>
                          ) : (
                            <span className="text-[8px] text-slate-300">-</span>
                          )}
                        </div>

                        {hasConflict && currentUser.role === 'admin' && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 text-[11px] text-slate-400 text-center flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>选中</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-100 border border-blue-400"></span>
              <span>今日</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-100 border border-amber-400"></span>
              <span>周末</span>
            </span>
            {currentUser.role === 'admin' && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>冲突</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. 当天冲突警示横幅：仅学校管理员在统筹调度时可见 */}
      {dayConflicts.length > 0 && currentUser.role === 'admin' && (
        <div className="p-3.5 bg-rose-50/90 border border-rose-300 rounded-2xl shadow-2xs text-rose-950 flex items-start justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-rose-800 flex items-center gap-1.5 flex-wrap min-w-0">
                <span>排班冲突预警 ({dayConflicts.length} 处)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold">
                  急需调整
                </span>
              </div>
              <p className="text-[11px] text-rose-900 mt-0.5 leading-snug line-clamp-2">
                {dayConflicts[0].reason}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const confShift = shifts.find(s => s.id === dayConflicts[0].shiftId);
              if (confShift) handleOpenReassign(confShift);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl shadow-2xs shrink-0 cursor-pointer transition-colors active:scale-95"
          >
            一键调班
          </button>
        </div>
      )}

      {/* 5. 当日排班卡片列表（包含具体日期标头） */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="whitespace-nowrap">
              {scopeFilter === 'mine' ? '我的执勤岗位' : '全校执勤岗位'} · {selectedDate.slice(5)} {selectedDay}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200/50 whitespace-nowrap shrink-0">
              {filteredShifts.length}岗
            </span>
          </div>

          {/* 若为值周教师端，提供“我的执勤 / 全校日程”切换药丸，默认严格为“我的执勤” */}
          {!isAdmin && currentUser.role !== 'homeroom_teacher' ? (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 text-[10px] font-bold shrink-0">
              <button
                onClick={() => setScopeFilter('mine')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  scopeFilter === 'mine'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                我的执勤
              </button>
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  scopeFilter === 'all'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全校日程
              </button>
            </div>
          ) : (
            filteredShifts.length > 0 && (
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>实时监测</span>
              </span>
            )
          )}
        </div>

        {filteredShifts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/90 shadow-2xs">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700">
              {scopeFilter === 'mine' ? '您在该日暂无执勤任务' : '该日暂无排班记录'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {scopeFilter === 'mine' ? '该日无需到岗巡查，可切换其他日期查看' : '管理员可点击右上角新增值周教师岗位'}
            </p>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setNewDate(selectedDate);
                  setNewDayOfWeek(selectedDay);
                  setShowAddModal(true);
                }}
                className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>为该日新增排班</span>
              </button>
            )}
          </div>
        ) : (
          filteredShifts.map((shift) => {
            const conflictCheck = checkTeacherScheduleConflict(
              shifts,
              shift.teacherId,
              shift.teacherName,
              shift.date,
              shift.dayOfWeek,
              shift.timeSlot,
              shift.id
            );
            // 权限隔离红线：排班冲突检测与调度专属于学校管理员，值周教师端绝不显示冲突警告或调班功能
            const showConflict = (shift.hasConflict || conflictCheck.hasConflict) && currentUser.role === 'admin';
            const conflictReason = shift.conflictReason || conflictCheck.reason;

            return (
              <div
                key={shift.id}
                className={`p-4 rounded-3xl border transition-all ${
                  showConflict
                    ? 'bg-rose-50/90 border-2 border-rose-400 shadow-md ring-2 ring-rose-200'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {shift.teacherName}
                      </span>
                      {shift.teacherId === currentUser.id && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200/50 font-bold">
                          本人
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {shift.date || selectedDate}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{shift.timeSlot}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="min-w-0 truncate">责任区域：{shift.zone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {showConflict && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-2xs animate-pulse flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3 text-white shrink-0" />
                        <span>重叠冲突岗</span>
                      </span>
                    )}
                    {shift.status === 'completed' && !showConflict && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 whitespace-nowrap">
                        已完成巡查
                      </span>
                    )}
                    {shift.status === 'in_progress' && !showConflict && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse shrink-0 whitespace-nowrap">
                        执勤进行中
                      </span>
                    )}
                    {(!shift.status || shift.status === 'pending') && !showConflict && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0 whitespace-nowrap">
                        待执勤
                      </span>
                    )}
                    {/* 签到状态徽标 */}
                    {shift.checkInAt && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 whitespace-nowrap">
                        已签到 {shift.checkInAt.slice(11)}
                      </span>
                    )}
                    {shift.absenceReason && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0 whitespace-nowrap">
                        缺岗上报
                      </span>
                    )}
                    {shift.substituteTeacherName && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 whitespace-nowrap">
                        代岗：{shift.substituteTeacherName}
                      </span>
                    )}
                  </div>
                </div>

                {/* 冲突明细警告框：仅学校管理员在调度管理时可见 */}
                {showConflict && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-rose-100/90 border border-rose-300 text-rose-950 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs">
                      <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>排班逻辑冲突警告（时间重叠/岗位冲突）</span>
                    </div>
                    <p className="text-[11px] text-rose-900 leading-relaxed pl-5 font-medium">
                      {conflictReason}
                    </p>
                    <div className="pl-5 pt-1 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleOpenReassign(shift)}
                        className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap transition-colors"
                      >
                        <RefreshCw className="w-3 h-3 shrink-0" />
                        <span>换人调班解决冲突</span>
                      </button>
                      <button
                        onClick={() => deleteShift(shift.id)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-[11px] font-medium cursor-pointer shrink-0 whitespace-nowrap transition-colors"
                      >
                        移除冲突班次
                      </button>
                    </div>
                  </div>
                )}

                {/* 缺岗原因展示 + 管理员指派代岗 */}
                {shift.absenceReason && (
                  <div className="mt-2.5 p-2.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
                    <span className="font-bold">缺岗原因：</span>{shift.absenceReason}
                    {shift.substituteTeacherName && (
                      <span className="ml-1 font-bold text-indigo-700">（已指派 {shift.substituteTeacherName} 代岗）</span>
                    )}
                  </div>
                )}

                {/* 值周教师侧：签到/完成执勤/报缺岗（仅本人班次） */}
                {!showConflict && shift.teacherId === currentUser.id && currentUser.role !== 'admin' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                    {!shift.absenceReason && !shift.checkInAt && shift.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => checkInShift(shift.id)}
                          className="px-3 py-1.5 text-[11px] text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs cursor-pointer font-medium"
                        >
                          签到
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('请填写请假/缺岗原因：');
                            if (reason && reason.trim()) reportShiftAbsence(shift.id, reason.trim());
                          }}
                          className="px-3 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer font-medium"
                        >
                          报缺岗
                        </button>
                      </>
                    )}
                    {shift.status === 'in_progress' && !shift.absenceReason && (
                      <button
                        onClick={() => completeShift(shift.id)}
                        className="px-3 py-1.5 text-[11px] text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs cursor-pointer font-medium"
                      >
                        完成执勤
                      </button>
                    )}
                  </div>
                )}

                {currentUser.role === 'admin' && !showConflict && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">操作调度：</span>
                    <div className="flex items-center gap-2">
                      {shift.absenceReason && !shift.substituteTeacherName && (
                        <button
                          onClick={() => {
                            setSelectedPostId('custom');
                            setReassignShift(shift);
                            const freeTeachers = getAvailableTeachersForSlot(
                              allUsers.filter(u => u.role === 'duty_teacher'),
                              shifts,
                              shift.date,
                              shift.dayOfWeek,
                              shift.timeSlot,
                              shift.id
                            );
                            setReassignTeacherId(freeTeachers[0]?.id || '');
                            setShowSubstituteModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>指派代岗</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenReassign(shift)}
                        className="px-2.5 py-1 text-[11px] text-blue-700 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>调班</span>
                      </button>
                      <button
                        onClick={() => deleteShift(shift.id)}
                        className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>移除</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Admin 全员公示底栏 */}
      {currentUser.role === 'admin' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-4 text-xs text-blue-900 flex items-center justify-between shadow-2xs">
          <div>
            <div className="font-extrabold text-blue-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>排班发布状态：已全员公示</span>
            </div>
            <div className="text-[11px] text-blue-700 mt-0.5">
              支持最近一月全周期轮排，排班冲突实时智能阻断
            </div>
          </div>
          <button
            onClick={() => showToast('已重新下发全员值周排班提醒通知', 'success')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shrink-0 cursor-pointer shadow-2xs transition-all active:scale-95"
          >
            一键提醒
          </button>
        </div>
      )}

      {/* 7. 新增排班弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">新增值周排班</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
              >
                取消
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  联动选择巡查岗位
                </label>
                <select
                  value={selectedPostId}
                  onChange={(e) => handlePostSelect(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-blue-50/50 text-slate-900 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="custom">-- 自定义巡查地点 --</option>
                  {dutyPosts.filter(p => p.isActive).map((post) => (
                    <option key={post.id} value={post.id}>
                      [{post.campus}] {post.name} ({post.defaultTeacherName || '未指定'})
                    </option>
                  ))}
                </select>
                {selectedPostId !== 'custom' && (
                  <p className="text-[10px] text-blue-600 mt-1">
                    * 已自动带入该岗位预设负责区域与默认教师
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  分配执勤教师
                </label>
                <select
                  value={newTeacherId}
                  onChange={(e) => setNewTeacherId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">星期</label>
                  <select
                    value={newDayOfWeek}
                    onChange={(e) => {
                      const dayVal = e.target.value;
                      setNewDayOfWeek(dayVal);
                      const matched = currentWeek.days.find(d => d.day === dayVal);
                      if (matched) {
                        setNewDate(matched.date);
                      }
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((d) => (
                      <option key={d} value={d}>
                        {d} {d === '周六' || d === '周日' ? '(周末)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">执勤日期</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => {
                      const dateVal = e.target.value;
                      setNewDate(dateVal);
                      if (dateVal) {
                        const dateObj = new Date(dateVal);
                        if (!isNaN(dateObj.getTime())) {
                          const dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                          const inferredDay = dayMap[dateObj.getDay()];
                          if (inferredDay) {
                            setNewDayOfWeek(inferredDay);
                          }
                        }
                      }
                    }}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">执勤时段</label>
                <select
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="晨门礼仪巡查 (07:20-08:00)">晨门礼仪巡查 (07:20-08:00)</option>
                  <option value="大课间与眼保健操 (09:40-10:20)">大课间与眼保健操 (09:40-10:20)</option>
                  <option value="午间就餐与午休 (11:50-13:30)">午间就餐与午休 (11:50-13:30)</option>
                  <option value="放学及包干区清扫 (17:20-18:00)">放学及包干区清扫 (17:20-18:00)</option>
                  <option value="晚自习与就寝秩序 (21:30-22:30)">晚自习与就寝秩序 (21:30-22:30)</option>
                  <option value="周末自习与课后托管巡查 (09:00-11:30)">周末自习与课后托管巡查 (09:00-11:30)</option>
                  <option value="周末校园安全及活动巡防 (15:00-17:30)">周末校园安全及活动巡防 (15:00-17:30)</option>
                  <option value="周日寄宿生返校及校门秩序 (17:30-19:00)">周日寄宿生返校及校门秩序 (17:30-19:00)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">责任巡查区域</label>
                <input
                  type="text"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  placeholder="如：知行楼二层及中庭"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              {modalConflict.hasConflict ? (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-950 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                    <span>⚠️ 警示：检测到严重排班逻辑冲突！</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                    {modalConflict.reason}
                  </p>
                  <div className="pt-1 border-t border-rose-200">
                    <div className="text-[11px] font-bold text-rose-900 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>推荐该时段空闲执勤教师：</span>
                    </div>
                    {availableTeachers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {availableTeachers.map((availTeacher) => (
                          <button
                            type="button"
                            key={availTeacher.id}
                            onClick={() => {
                              setNewTeacherId(availTeacher.id);
                              showToast(`已更换执勤教师为【${availTeacher.name}】`, 'success');
                            }}
                            className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-0.5"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{availTeacher.name} (空闲)</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-rose-600">
                        当前时段暂无其他空闲教师，请更换值周时段或日期。
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>排班逻辑校验通过：{selectedTeacherObj?.name} 该时段空闲无冲突</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleCreateShift}
                disabled={modalConflict.hasConflict}
                className={`w-2/3 h-11 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all ${
                  modalConflict.hasConflict
                    ? 'bg-rose-400 text-white cursor-not-allowed opacity-90'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                }`}
              >
                {modalConflict.hasConflict ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>存在冲突，请先调整人员</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>保存并确认排班</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. 快速调班换人弹窗 */}
      {reassignShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">快速换人调班</h3>
              <button
                onClick={() => setReassignShift(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
              >
                取消
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 space-y-1">
                <div>执勤日期：<strong className="text-slate-900">{reassignShift.date} ({reassignShift.dayOfWeek})</strong></div>
                <div>巡查时段：<strong className="text-slate-900">{reassignShift.timeSlot}</strong></div>
                <div>责任区域：<strong className="text-slate-900">{reassignShift.zone}</strong></div>
                <div>原执勤教师：<span className="text-rose-600 font-bold">{reassignShift.teacherName} (冲突)</span></div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  选择调换的空闲教师
                </label>
                <select
                  value={reassignTeacherId}
                  onChange={(e) => setReassignTeacherId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold outline-none focus:border-blue-500"
                >
                  {allUsers
                    .filter((u) => u.id !== reassignShift.teacherId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setReassignShift(null)}
                className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReassign}
                className="w-2/3 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                确认调换并消除冲突
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. 缺岗代岗指派弹窗 */}
      {showSubstituteModal && reassignShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">指派代岗人员</h3>
              <button
                onClick={() => {
                  setShowSubstituteModal(false);
                  setReassignShift(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
              >
                取消
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-slate-700 space-y-1">
                <div>执勤日期：<strong className="text-slate-900">{reassignShift.date} ({reassignShift.dayOfWeek})</strong></div>
                <div>巡查时段：<strong className="text-slate-900">{reassignShift.timeSlot}</strong></div>
                <div>责任区域：<strong className="text-slate-900">{reassignShift.zone}</strong></div>
                <div>缺岗教师：<span className="text-rose-600 font-bold">{reassignShift.teacherName}</span></div>
                <div>缺岗原因：<span className="text-rose-700">{reassignShift.absenceReason || '未填写'}</span></div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  选择代岗教师（仅列空闲值周教师）
                </label>
                <select
                  value={reassignTeacherId}
                  onChange={(e) => setReassignTeacherId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold outline-none focus:border-indigo-500"
                >
                  {getAvailableTeachersForSlot(
                    allUsers.filter(u => u.role === 'duty_teacher'),
                    shifts,
                    reassignShift.date,
                    reassignShift.dayOfWeek,
                    reassignShift.timeSlot,
                    reassignShift.id
                  )
                    .filter((u) => u.id !== reassignShift.teacherId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  代岗不改变原排班记录，打卡与展示以实际在岗人为准。
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setShowSubstituteModal(false);
                  setReassignShift(null);
                }}
                className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const target = allUsers.find(u => u.id === reassignTeacherId);
                  if (!target) return;
                  const res = approveShiftSubstitute(reassignShift.id, target.id, target.name);
                  if (!res.success && res.conflict) {
                    showToast(`代岗指派失败：${res.conflict}`, 'error');
                    return;
                  }
                  setShowSubstituteModal(false);
                  setReassignShift(null);
                }}
                className="w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                确认代岗指派
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
