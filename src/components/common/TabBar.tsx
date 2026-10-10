import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileText,
  CalendarDays,
  Award, 
  CheckSquare, 
  User 
} from 'lucide-react';

export const TabBar: React.FC = () => {
  const { currentTab, setCurrentTab, setActiveSubPage, records, rectifications, appeals, currentUser } = useDuty();

  // Calculate pending items based on user role
  const pendingAuditCount = records.filter(r => r.status === 'pending_audit').length;
  const pendingRectifyCount = rectifications.filter(t => t.status === 'pending' || t.status === 'submitted').length;
  const pendingAppealCount = appeals.filter(a => a.status === 'pending').length;

  let totalTodos = 0;
  if (currentUser.role === 'admin') {
    totalTodos = pendingAuditCount + pendingAppealCount + rectifications.filter(t => t.status === 'submitted').length;
  } else if (currentUser.role === 'homeroom_teacher') {
    const myClassId = currentUser.homeroomClassId || 'class_g1_1';
    // 班主任待办：待整改 + 需补充材料的申诉（need_more_info 也要亮角标）
    totalTodos =
      rectifications.filter(t => t.classId === myClassId && t.status === 'pending').length +
      appeals.filter(a => a.classId === myClassId && (a.status === 'pending' || a.status === 'need_more_info')).length;
  } else {
    // duty teacher
    totalTodos = records.filter(r => r.status === 'rejected' && r.inspectorId === currentUser.id).length;
  }

  const handleTabClick = (tab: 'workbench' | 'tasks' | 'scores' | 'approvals' | 'profile') => {
    setCurrentTab(tab);
    setActiveSubPage(null);
  };

  // 根据当前角色定制 Tab 2 的文本和图标
  const getTab2Config = () => {
    if (currentUser.role === 'admin') {
      return {
        label: '排班管理',
        Icon: ClipboardCheck
      };
    }
    if (currentUser.role === 'homeroom_teacher') {
      return {
        label: '班级台账',
        Icon: FileText
      };
    }
    return {
      label: '我的排班',
      Icon: CalendarDays
    };
  };

  const tab2Config = getTab2Config();

  return (
    <nav className="shrink-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(15,23,42,0.03)]">
      <div className="grid grid-cols-5 h-16 items-center px-1.5 py-1">
        {/* Tab 1: 工作台 */}
        <button
          onClick={() => handleTabClick('workbench')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
            currentTab === 'workbench'
              ? 'text-blue-700 bg-blue-50/80 font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'workbench' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-1">工作台</span>
        </button>

        {/* Tab 2: 角色自适应（管理员: 排班管理 | 班主任: 班级台账 | 值周教师: 我的排班） */}
        <button
          onClick={() => handleTabClick('tasks')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
            currentTab === 'tasks'
              ? 'text-blue-700 bg-blue-50/80 font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <div className="relative">
            <tab2Config.Icon className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'tasks' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-1">
            {tab2Config.label}
          </span>
        </button>

        {/* Tab 3: 班级积分 */}
        <button
          onClick={() => handleTabClick('scores')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
            currentTab === 'scores'
              ? 'text-blue-700 bg-blue-50/80 font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <div className="relative">
            <Award className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'scores' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-1">班级积分</span>
        </button>

        {/* Tab 4: 待办审批 */}
        <button
          onClick={() => handleTabClick('approvals')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
            currentTab === 'approvals'
              ? 'text-blue-700 bg-blue-50/80 font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <div className="relative">
            <CheckSquare className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'approvals' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
            {totalTodos > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-2xs">
                {totalTodos}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-1">
            {currentUser.role === 'admin' ? '审批中心' : '我的待办'}
          </span>
        </button>

        {/* Tab 5: 个人中心 */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
            currentTab === 'profile'
              ? 'text-blue-700 bg-blue-50/80 font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/60'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform duration-200 ${currentTab === 'profile' ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-1">我的</span>
        </button>
      </div>
    </nav>
  );
};
