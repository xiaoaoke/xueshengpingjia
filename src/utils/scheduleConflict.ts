import { DutyShift, UserProfile } from '../types';

/**
 * Parses time range like "07:20-08:00" from time slot string into minutes from midnight
 */
export function extractTimeMinutes(slot: string): { start: number; end: number } | null {
  const match = slot.match(/(\d{1,2}):(\d{2})\s*[-–~至]\s*(\d{1,2}):(\d{2})/);
  if (match) {
    const start = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    const end = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
    return { start, end };
  }
  return null;
}

/**
 * Determines whether two time slots overlap in time
 */
export function isTimeSlotOverlapping(slotA: string, slotB: string): boolean {
  if (!slotA || !slotB) return false;
  if (slotA === slotB) return true;

  const rangeA = extractTimeMinutes(slotA);
  const rangeB = extractTimeMinutes(slotB);

  if (rangeA && rangeB) {
    // Two intervals overlap if max(startA, startB) < min(endA, endB)
    return Math.max(rangeA.start, rangeB.start) < Math.min(rangeA.end, rangeB.end);
  }

  // Keyword-based fallback for standard school routine periods
  const routineKeywords = ['晨门', '大课间', '午间', '午休', '放学', '晚自习', '晚休'];
  for (const kw of routineKeywords) {
    if (slotA.includes(kw) && slotB.includes(kw)) {
      return true;
    }
  }

  return false;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  type: 'overlap_shift' | 'teaching_task' | 'daily_overload' | null;
  reason: string;
  conflictingShift?: DutyShift;
}

// 教师固定日程（教研活动/会议等）：业务上应来自教师日程实体，原型先以数据表维护
export interface TeacherFixedEvent {
  teacherId: string;
  dayOfWeek: string;      // '周五' 等
  timeSlotKeywords: string[]; // 时段关键字命中即冲突，如 ['07:', '晨']
  reason: string;
}

export const TEACHER_FIXED_EVENTS: TeacherFixedEvent[] = [
  {
    teacherId: 'user_teacher_zhang',
    dayOfWeek: '周五',
    timeSlotKeywords: ['07:', '晨'],
    reason: '在周五07:40有语文高一年级组集体备课研讨会，与执勤时间冲突！'
  }
];

/**
 * Checks if a teacher has conflicts for a specific date/day and time slot
 */
export function checkTeacherScheduleConflict(
  shifts: DutyShift[],
  teacherId: string,
  teacherName: string,
  date: string,
  dayOfWeek: string,
  timeSlot: string,
  currentShiftId?: string
): ConflictCheckResult {
  // 1. Direct overlapping duty shift on the same day/date
  const existingShift = shifts.find((s) => {
    if (currentShiftId && s.id === currentShiftId) return false;
    if (s.teacherId !== teacherId) return false;
    
    // Check same date or same day of week
    const isSameDay = s.date === date || s.dayOfWeek === dayOfWeek;
    if (!isSameDay) return false;

    return isTimeSlotOverlapping(s.timeSlot, timeSlot);
  });

  if (existingShift) {
    return {
      hasConflict: true,
      type: 'overlap_shift',
      reason: `${teacherName}在${dayOfWeek}该时段已排有【${existingShift.zone} · ${existingShift.timeSlot}】，存在重叠岗位冲突！`,
      conflictingShift: existingShift
    };
  }

  // 2. Known school calendar teaching/meeting conflicts (数据表驱动)
  const fixedEvent = TEACHER_FIXED_EVENTS.find(
    (ev) =>
      ev.teacherId === teacherId &&
      ev.dayOfWeek === dayOfWeek &&
      ev.timeSlotKeywords.some((kw) => timeSlot.includes(kw))
  );
  if (fixedEvent) {
    return {
      hasConflict: true,
      type: 'teaching_task',
      reason: `${teacherName}${fixedEvent.reason}`
    };
  }

  // 3. Excessive duty load check on same day (>= 3 shifts)
  const sameDayShifts = shifts.filter(
    (s) => s.id !== currentShiftId && s.teacherId === teacherId && (s.date === date || s.dayOfWeek === dayOfWeek)
  );
  if (sameDayShifts.length >= 3) {
    return {
      hasConflict: true,
      type: 'daily_overload',
      reason: `${teacherName}在${dayOfWeek}当天已安排 ${sameDayShifts.length} 次执勤，执勤负荷超限！`
    };
  }

  return {
    hasConflict: false,
    type: null,
    reason: ''
  };
}

/**
 * Finds all teachers who are completely free during this date & timeSlot
 */
export function getAvailableTeachersForSlot(
  allUsers: UserProfile[],
  shifts: DutyShift[],
  date: string,
  dayOfWeek: string,
  timeSlot: string,
  currentShiftId?: string
): UserProfile[] {
  return allUsers.filter((user) => {
    const res = checkTeacherScheduleConflict(
      shifts,
      user.id,
      user.name,
      date,
      dayOfWeek,
      timeSlot,
      currentShiftId
    );
    return !res.hasConflict;
  });
}

/**
 * Scans all shifts on a given day to find any conflicts
 */
export function scanDayConflicts(shifts: DutyShift[], dayOfWeek: string): {
  shiftId: string;
  teacherName: string;
  reason: string;
  conflictingShift?: DutyShift;
}[] {
  const dayShifts = shifts.filter((s) => s.dayOfWeek === dayOfWeek);
  const conflicts: {
    shiftId: string;
    teacherName: string;
    reason: string;
    conflictingShift?: DutyShift;
  }[] = [];

  dayShifts.forEach((s) => {
    // If shift has preset conflict
    if (s.hasConflict && s.conflictReason) {
      conflicts.push({
        shiftId: s.id,
        teacherName: s.teacherName,
        reason: s.conflictReason
      });
      return;
    }

    // Dynamic scan against other shifts on the same day
    const check = checkTeacherScheduleConflict(
      dayShifts,
      s.teacherId,
      s.teacherName,
      s.date,
      s.dayOfWeek,
      s.timeSlot,
      s.id
    );

    if (check.hasConflict) {
      conflicts.push({
        shiftId: s.id,
        teacherName: s.teacherName,
        reason: check.reason,
        conflictingShift: check.conflictingShift
      });
    }
  });

  return conflicts;
}
