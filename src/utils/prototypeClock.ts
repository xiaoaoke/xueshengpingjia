/**
 * 原型时钟：全系统统一的时间基准。
 * 原型世界“今天”固定为 2026-10-09（周五），与 DutyScheduleView 的
 * RECENT_MONTH_WEEKS / “回到今日”硬编码保持一致；时分秒取真实时钟。
 * 所有 createdAt / 查重窗口 / 整改截止日 必须走这里，禁止直接用 new Date()/toISOString。
 */

export const PROTOTYPE_TODAY = '2026-10-09';

// 教学周表（与 DutyScheduleView 的 RECENT_MONTH_WEEKS 同源，此处仅保留日期归属）
const WEEK_RANGES: { week: number; start: string; end: string }[] = [
  { week: 4, start: '2026-09-21', end: '2026-09-27' },
  { week: 5, start: '2026-09-28', end: '2026-10-04' },
  { week: 6, start: '2026-10-05', end: '2026-10-11' },
  { week: 7, start: '2026-10-12', end: '2026-10-18' }
];

/** 原型“现在”：日期=2026-10-09，时分秒取真实时钟 */
export function appNow(): Date {
  const real = new Date();
  const d = new Date(2026, 9, 9, real.getHours(), real.getMinutes(), real.getSeconds());
  return d;
}

/** 'YYYY-MM-DD HH:mm' */
export function formatDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 原型今日的日期串 'YYYY-MM-DD' */
export function todayString(): string {
  return PROTOTYPE_TODAY;
}

/** 整改截止：当天 18:00（未过点）否则次日 18:00，'YYYY-MM-DD HH:mm' */
export function nextDeadline(): string {
  const now = appNow();
  if (now.getHours() < 18) {
    return `${PROTOTYPE_TODAY} 18:00`;
  }
  const tomorrow = new Date(2026, 9, 10);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${tomorrow.getFullYear()}-${p(tomorrow.getMonth() + 1)}-${p(tomorrow.getDate())} 18:00`;
}

/** 依据日期串判定所属教学周，未命中返回 0 */
export function weekNumberForDate(date: string): number {
  const hit = WEEK_RANGES.find((w) => date >= w.start && date <= w.end);
  return hit ? hit.week : 0;
}
