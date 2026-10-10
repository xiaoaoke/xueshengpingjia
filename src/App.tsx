import React, { useState } from 'react';
import { DutyProvider, useDuty } from './context/DutyContext';
import { Header } from './components/common/Header';
import { TabBar } from './components/common/TabBar';
import { ModalDialog } from './components/common/ModalDialog';
import { FlowGuideBar } from './components/flows/FlowGuideBar';

// Workbenches
import { TeacherWorkbench } from './components/workbench/TeacherWorkbench';
import { HomeroomWorkbench } from './components/workbench/HomeroomWorkbench';
import { AdminWorkbench } from './components/workbench/AdminWorkbench';

// Inspection
import { QuickInspectForm } from './components/inspection/QuickInspectForm';
import { InspectionList } from './components/inspection/InspectionList';
import { InspectionDetailModal } from './components/inspection/InspectionDetailModal';

// Schedule
import { DutyScheduleView } from './components/schedule/DutyScheduleView';
import { WeeklyBriefView } from './components/schedule/WeeklyBriefView';

// Approvals & Todos
import { ApprovalCenter } from './components/approvals/ApprovalCenter';

// Scores & Settlement
import { ClassScoresView } from './components/scores/ClassScoresView';
import { ScoreDetailModal } from './components/scores/ScoreDetailModal';
import { SettlementPipelineModal } from './components/scores/SettlementPipelineModal';

// Analytics & Reports
import { DataAnalyticsView } from './components/analytics/DataAnalyticsView';
import { DutyLogView } from './components/report/DutyLogView';

// Profile & Notifications
import { ProfileView, ScoreRulesView, ClassStructureView } from './components/profile/ProfileView';
import { DutyPostManager } from './components/profile/DutyPostManager';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

const MainAppContent: React.FC = () => {
  const { 
    currentUser, 
    currentTab, 
    activeSubPage, 
    isMobileFrame, 
    toasts 
  } = useDuty();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Render content according to currentTab and activeSubPage
  const renderTabContent = () => {
    // Sub-pages take highest priority
    if (activeSubPage === 'quick_inspect') {
      return <QuickInspectForm />;
    }
    if (activeSubPage === 'record_detail') {
      return <InspectionDetailModal />;
    }
    if (activeSubPage === 'records_list') {
      return <InspectionList />;
    }
    if (activeSubPage === 'schedule_view' || activeSubPage === 'schedule_admin') {
      return <DutyScheduleView />;
    }
    if (activeSubPage === 'duty_brief') {
      return <WeeklyBriefView />;
    }
    if (activeSubPage === 'duty_posts') {
      return <DutyPostManager />;
    }
    if (activeSubPage === 'score_rules') {
      return <ScoreRulesView />;
    }
    if (activeSubPage === 'class_structure') {
      return <ClassStructureView />;
    }
    if (activeSubPage === 'audit_center' || activeSubPage === 'rectify_list' || activeSubPage === 'appeal_list') {
      return <ApprovalCenter />;
    }
    if (activeSubPage === 'score_detail') {
      return <ScoreDetailModal />;
    }
    if (activeSubPage === 'settlement_pipeline') {
      return <SettlementPipelineModal />;
    }
    if (activeSubPage === 'data_analytics') {
      return <DataAnalyticsView />;
    }
    if (activeSubPage === 'duty_log') {
      return <DutyLogView />;
    }

    // Default Tab content
    switch (currentTab) {
      case 'workbench':
        if (currentUser.role === 'duty_teacher') {
          return <TeacherWorkbench />;
        }
        if (currentUser.role === 'homeroom_teacher') {
          return <HomeroomWorkbench />;
        }
        return <AdminWorkbench />;

      case 'tasks':
        // 班主任核心需求为本班巡查受检流水台账，值周教师和管理员为值周排班
        if (currentUser.role === 'homeroom_teacher') {
          return <InspectionList />;
        }
        return <DutyScheduleView />;

      case 'scores':
        return <ClassScoresView />;

      case 'approvals':
        return <ApprovalCenter />;

      case 'profile':
        return <ProfileView />;

      default:
        return <TeacherWorkbench />;
    }
  };

  return (
    <div className="min-h-screen bg-[#e7edf4] flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Prototype Flow Guide bar (F01-F08) */}
      <FlowGuideBar />

      {/* Global Navigation Header */}
      <Header onOpenNotifs={() => setIsNotifOpen(true)} />

      {/* Main View Area: Mobile Simulator vs Full Desktop */}
      <main className="flex-1 flex justify-center items-start px-2 py-3 sm:px-4 sm:py-6">
        {isMobileFrame ? (
          <div className="relative group my-auto">
            {/* Outer Smartphone Titanium / Metal Frame */}
            <div className="w-[390px] h-[844px] max-h-[calc(100dvh-5.5rem)] bg-slate-900 rounded-[3rem] p-3 shadow-device border-[4px] border-slate-800/90 relative flex flex-col overflow-hidden transition-all duration-300">
              
              {/* Screen Inner Glass */}
              <div className="w-full h-full bg-slate-50 rounded-[2.25rem] overflow-hidden flex flex-col relative border border-slate-200/60 shadow-inner">
                
                {/* Dynamic Island & Status Bar */}
                <div className="h-10 bg-slate-900 text-white px-6 flex items-center justify-between text-xs font-semibold shrink-0 select-none relative z-30">
                  <span className="font-mono tracking-tight text-[11px] text-slate-200">09:41</span>
                  
                  {/* Dynamic Island Pill */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-5 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 border border-slate-800/80 shadow-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900/90 border border-slate-700/80 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-500/80"></div>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse"></div>
                  </div>

                  {/* Right Status Icons */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-200">
                    <span className="text-[10px] font-bold">5G</span>
                    <div className="w-4.5 h-2.5 rounded-[3px] border border-white/70 p-0.5 flex items-center">
                      <div className="w-full h-full bg-white rounded-[1.5px]"></div>
                    </div>
                  </div>
                </div>

                {/* Mobile Main Scrollable Content */}
                <div className="phone-scroll flex-1 overflow-y-auto px-3.5 py-3 relative no-scrollbar bg-slate-50">
                  {renderTabContent()}
                </div>

                {/* Bottom TabBar */}
                <TabBar />

                {/* iOS Home Indicator Bar */}
                <div className="h-4 bg-white/95 flex items-center justify-center shrink-0 z-40 select-none -mt-1 pb-1">
                  <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Wide Responsive Frame */
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-card border border-slate-200/90 overflow-hidden flex flex-col min-h-[820px] relative transition-all duration-300">
            {/* Desktop Top Titlebar Strip */}
            <div className="h-10 bg-slate-100/80 border-b border-slate-200/80 px-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block"></span>
                </div>
                <span className="text-slate-400 ml-2">|</span>
                <span className="font-medium text-slate-600">智慧校园值周管理工作台 · 宽屏模式</span>
              </div>
              <span className="text-[11px] text-slate-400">100% 响应式自适应</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8 relative bg-slate-50/50">
              {renderTabContent()}
            </div>
            <TabBar />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ModalDialog />
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Toast Notification Stack */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top-2 duration-150 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.type === 'warning'
                ? 'bg-amber-600 text-white border-amber-500'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DutyProvider>
      <MainAppContent />
    </DutyProvider>
  );
}
