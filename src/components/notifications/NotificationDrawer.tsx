import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { isNotifVisible } from '../../utils/notificationVisibility';
import {
  X,
  Bell,
  CheckCheck,
  ChevronRight,
  FileCheck2,
  CheckSquare,
  RotateCcw,
  Award,
  Info,
  CalendarClock
} from 'lucide-react';

export const NotificationDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    currentUser,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentTab,
    setActiveSubPage,
    setSelectedRecordId
  } = useDuty();

  if (!isOpen) return null;

  // 与 unreadNotifCount 同一可见性口径
  const visibleNotifications = notifications.filter((n) => isNotifVisible(n, currentUser));

  const handleNotificationClick = (notif: any) => {
    markNotificationRead(notif.id);
    onClose();

    if (notif.relatedRecordId) {
      setSelectedRecordId(notif.relatedRecordId);
      if (notif.type === 'audit') {
        setCurrentTab('approvals');
        setActiveSubPage('audit_center');
      } else if (notif.type === 'rectify') {
        setCurrentTab('approvals');
        setActiveSubPage('rectify_list');
      } else if (notif.type === 'appeal') {
        setCurrentTab('approvals');
        setActiveSubPage('appeal_list');
      } else {
        setCurrentTab('tasks');
        setActiveSubPage('record_detail');
      }
    } else if (notif.type === 'publish') {
      setCurrentTab('scores');
      setActiveSubPage(null);
    } else if (notif.type === 'duty') {
      setCurrentTab('tasks');
      setActiveSubPage('schedule_view');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">通知消息中心</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>全部已读</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {visibleNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              暂无任何系统通知
            </div>
          ) : (
            visibleNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  notif.read
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-blue-50/50 border-blue-200 text-slate-900 shadow-2xs'
                }`}
              >
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-3.5 right-3.5"></span>
                )}

                <div className="flex items-center gap-2 text-xs font-bold mb-1">
                  {notif.type === 'rectify' && <FileCheck2 className="w-4 h-4 text-orange-600" />}
                  {notif.type === 'audit' && <CheckSquare className="w-4 h-4 text-amber-600" />}
                  {notif.type === 'appeal' && <RotateCcw className="w-4 h-4 text-purple-600" />}
                  {notif.type === 'publish' && <Award className="w-4 h-4 text-emerald-600" />}
                  {notif.type === 'duty' && <CalendarClock className="w-4 h-4 text-indigo-600" />}
                  {notif.type === 'system' && <Info className="w-4 h-4 text-blue-600" />}
                  <span>{notif.title}</span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                  {notif.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                  <span className="font-mono">{notif.createdAt}</span>
                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                    <span>前往处理</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
