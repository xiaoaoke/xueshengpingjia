import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  UserCheck, 
  Smartphone, 
  Monitor, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const Header: React.FC<{ onOpenNotifs: () => void }> = ({ onOpenNotifs }) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    currentCampus, 
    setCampus, 
    isOnline, 
    toggleNetwork, 
    offlineDrafts, 
    syncOfflineDrafts,
    isMobileFrame,
    setIsMobileFrame,
    unreadNotifCount,
    openModal
  } = useDuty();

  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleRoleSelect = (targetUserId: string) => {
    setShowRoleMenu(false);
    const target = allUsers.find(u => u.id === targetUserId);
    if (!target) return;
    if (target.id === currentUser.id) return;

    openModal({
      type: 'role_switch_confirm',
      title: '确认切换身份？',
      message: `即将切换至【${target.name} (${target.title})】工作台。切换后将重新加载对应操作权限与业务数据。`,
      confirmText: '立即切换',
      cancelText: '取消',
      onConfirm: () => switchUser(targetUserId)
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
        {/* Left: Brand & Campus */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-[0_4px_12px_rgba(37,99,235,0.25)] shrink-0 ring-2 ring-white">
            值
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                智慧校园值周
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200/60">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span className="truncate">{currentUser.school}</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <button 
                onClick={() => setCampus(currentCampus === '中心校区' ? '城东校区' : '中心校区')}
                className="px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer truncate font-medium text-[10px] border border-slate-200/70"
                title="点击切换校区"
              >
                {currentCampus} ▾
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sync Status + Role Pill + Frame Toggle + Bell */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Network & Sync indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs">
            <button
              onClick={toggleNetwork}
              title={isOnline ? '点击模拟弱网/离线' : '点击恢复在线'}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className="text-[11px] font-medium">
                {isOnline ? '在线' : '离线'}
              </span>
            </button>
            
            <span className="text-slate-300" aria-hidden="true">|</span>

            {offlineDrafts.length > 0 ? (
              <button
                onClick={syncOfflineDrafts}
                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-[11px] cursor-pointer"
                title="点击同步本地离线草稿"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>待同步 ({offlineDrafts.length})</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>已同步</span>
              </span>
            )}
          </div>

          {/* Quick Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200/80 text-blue-800 hover:from-blue-100 hover:to-indigo-100 transition-all text-xs font-medium cursor-pointer shadow-2xs"
              title="切换当前角色"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.name[0]}
              </div>
              <span className="font-bold text-slate-800">{currentUser.name}</span>
              <span className="hidden md:inline px-1.5 py-0.5 rounded-md bg-white/80 text-[10px] text-blue-700 font-semibold border border-blue-200/50">
                {currentUser.role === 'duty_teacher' ? '值周' : currentUser.role === 'homeroom_teacher' ? '班主任' : '管理员'}
              </span>
            </button>

            {/* Role dropdown modal/menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2.5 w-68 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  切换用户身份体验联动
                </div>
                <div className="space-y-1 mt-1">
                  {allUsers.map((user) => {
                    const isCurrent = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleRoleSelect(user.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-50/90 text-blue-900 font-semibold border border-blue-200/60 shadow-2xs'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            user.role === 'admin' 
                              ? 'bg-slate-900 text-white' 
                              : user.role === 'homeroom_teacher'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {user.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-500">{user.title}</div>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-200"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Device Frame Viewport Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMobileFrame 
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title={isMobileFrame ? '切换到全屏桌面布局' : '切换到390px手机画板模式'}
          >
            {isMobileFrame ? (
              <Smartphone className="w-4 h-4 text-blue-600" />
            ) : (
              <Monitor className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifs}
            className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="查看通知消息"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
