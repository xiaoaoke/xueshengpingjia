import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { todayString, weekNumberForDate } from '../../utils/prototypeClock';
import { WeeklyDutyBrief } from '../../types';
import { ArrowLeft, Users, Crown, StickyNote, Send, Save, CheckCircle2, CalendarClock } from 'lucide-react';

/**
 * 值周任务书：本周值周名单 + 值周组长 + 交接备忘。
 * 管理员可编辑/发布；值周教师只读（高亮自己的班次清单）。
 */
export const WeeklyBriefView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    shifts,
    weeklyBrief,
    saveWeeklyBrief,
    publishWeeklyBrief,
    setActiveSubPage
  } = useDuty();

  const isAdmin = currentUser.role === 'admin';
  const isDutyTeacher = currentUser.role === 'duty_teacher';

  // 编辑态（管理员）
  const [leadTeacherId, setLeadTeacherId] = useState(weeklyBrief.leadTeacherId);
  const [memberIds, setMemberIds] = useState<string[]>(weeklyBrief.memberIds);
  const [handoverNote, setHandoverNote] = useState(weeklyBrief.handoverNote);

  const nameOf = (id: string) => allUsers.find((u) => u.id === id)?.name || id;

  const buildBrief = (): WeeklyDutyBrief => ({
    ...weeklyBrief,
    leadTeacherId,
    leadTeacherName: nameOf(leadTeacherId),
    memberIds,
    handoverNote
  });

  const toggleMember = (id: string) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  // 本周班次清单（按当前任务书周次）
  const weekShifts = shifts.filter((s) => weekNumberForDate(s.date) === weeklyBrief.weekNumber);
  const myShifts = weekShifts.filter((s) => s.teacherId === currentUser.id);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900">第{weeklyBrief.weekNumber}周值周任务书</h2>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          weeklyBrief.status === 'published'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {weeklyBrief.status === 'published' ? '已发布' : '草稿'}
        </span>
      </div>

      {/* 发布信息 */}
      {weeklyBrief.status === 'published' && weeklyBrief.publishedAt && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
          由 {weeklyBrief.publishedBy} 于 {weeklyBrief.publishedAt} 正式发布
        </div>
      )}

      {/* 值周名单 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <span>值周名单</span>
        </div>

        {isAdmin ? (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">值周组长</label>
              <select
                value={leadTeacherId}
                onChange={(e) => setLeadTeacherId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.title})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">值周组员（点击勾选）</label>
              <div className="flex flex-wrap gap-1.5">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-medium cursor-pointer transition-colors ${
                      memberIds.includes(u.id)
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <Crown className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-slate-700">值周组长：</span>
              <strong className="text-slate-900">{weeklyBrief.leadTeacherName}</strong>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weeklyBrief.memberIds.map((id) => (
                <span
                  key={id}
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-medium ${
                    id === currentUser.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {nameOf(id)}{id === currentUser.id ? '（我）' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 交接备忘 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <StickyNote className="w-4 h-4 text-amber-600" />
          <span>交接备忘</span>
        </div>
        {isAdmin ? (
          <textarea
            rows={5}
            value={handoverNote}
            onChange={(e) => setHandoverNote(e.target.value)}
            placeholder="填写本周重点任务、交接事项、注意事项..."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {weeklyBrief.handoverNote || '暂无交接备忘'}
          </div>
        )}
      </div>

      {/* 我的班次清单（值周教师） */}
      {isDutyTeacher && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4 text-indigo-600" />
            <span>我的本周班次（{myShifts.length} 项）</span>
          </div>
          {myShifts.length === 0 ? (
            <div className="p-6 text-center text-[11px] text-slate-400 bg-slate-50 rounded-xl">
              本周暂无排班
            </div>
          ) : (
            myShifts.map((s) => (
              <div key={s.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{s.date} ({s.dayOfWeek}) · {s.timeSlot}</div>
                  <div className="text-slate-500 truncate">{s.zone}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  s.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : s.status === 'in_progress'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {s.status === 'completed' ? '已完成' : s.status === 'in_progress' ? '进行中' : '待执勤'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* 管理员操作 */}
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={() => saveWeeklyBrief(buildBrief())}
            className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存草稿</span>
          </button>
          <button
            onClick={() => publishWeeklyBrief(buildBrief())}
            className="w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            {weeklyBrief.status === 'published' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>重新发布任务书</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>正式发布并通知值周组</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
