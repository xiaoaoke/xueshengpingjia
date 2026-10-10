import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  SchoolClass,
  InspectRuleItem,
  InspectionRecord,
  RectificationTicket,
  AppealTicket,
  DutyShift,
  SettlementWeekData,
  NotificationItem,
  OfflineDraft,
  DutyPost,
  ScoreLedgerEntry,
  WeeklyDutyBrief
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_RULES,
  INITIAL_RECORDS,
  INITIAL_RECTIFICATIONS,
  INITIAL_APPEALS,
  INITIAL_SHIFTS,
  INITIAL_SETTLEMENT,
  INITIAL_NOTIFICATIONS,
  INITIAL_DUTY_POSTS,
  INITIAL_LEDGER,
  INITIAL_WEEKLY_BRIEF
} from '../mock/initialData';
import { checkTeacherScheduleConflict } from '../utils/scheduleConflict';
import { appNow, formatDateTime, todayString, nextDeadline, weekNumberForDate } from '../utils/prototypeClock';
import { decideAudit } from '../utils/auditPolicy';
import { isNotifVisible } from '../utils/notificationVisibility';

export interface ModalPayload {
  type: 
    | 'inspect_success' 
    | 'record_active' 
    | 'duplicate_warning' 
    | 'offline_saved' 
    | 'schedule_conflict' 
    | 'audit_reject_confirm' 
    | 'rectify_confirm' 
    | 'publish_confirm' 
    | 'role_switch_confirm' 
    | 'leave_edit_confirm';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  data?: any;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  text: string;
}

interface DutyContextType {
  // Current user & role
  currentUser: UserProfile;
  role: UserRole;
  switchUser: (userId: string) => void;
  allUsers: UserProfile[];
  currentCampus: string;
  setCampus: (campus: string) => void;

  // View frame mode (mobile phone simulation vs full wide screen)
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;

  // Navigation
  currentTab: 'workbench' | 'tasks' | 'scores' | 'approvals' | 'profile';
  setCurrentTab: (tab: 'workbench' | 'tasks' | 'scores' | 'approvals' | 'profile') => void;
  activeSubPage: string | null;
  setActiveSubPage: (page: string | null) => void;
  selectedRecordId: string | null;
  setSelectedRecordId: (id: string | null) => void;

  // Core entities
  classes: SchoolClass[];
  rules: InspectRuleItem[];
  records: InspectionRecord[];
  rectifications: RectificationTicket[];
  appeals: AppealTicket[];
  shifts: DutyShift[];
  dutyPosts: DutyPost[];
  dutyTimeSlots: string[];
  assessmentCategories: { id: string; name: string }[];
  settlement: SettlementWeekData;
  notifications: NotificationItem[];
  offlineDrafts: OfflineDraft[];
  ledger: ScoreLedgerEntry[];

  // Duty Post actions (A05)
  addDutyPost: (post: Omit<DutyPost, 'id'>) => DutyPost;
  updateDutyPost: (id: string, updates: Partial<DutyPost>) => void;
  deleteDutyPost: (id: string) => void;
  toggleDutyPostActive: (id: string) => void;
  addTimeSlot: (slot: string) => void;
  removeTimeSlot: (slot: string) => void;
  renameTimeSlot: (from: string, to: string) => void;
  addCategory: (id: string, name: string) => void;
  removeCategory: (id: string) => void;
  renameCategory: (id: string, name: string) => void;

  // Network & Sync
  isOnline: boolean;
  toggleNetwork: () => void;
  syncOfflineDrafts: () => void;

  // Record actions
  checkDuplicate: (classId: string, ruleId: string) => InspectionRecord | undefined;
  createRecord: (recordData: Partial<InspectionRecord>, silent?: boolean) => { success: boolean; record: InspectionRecord; isPendingAudit: boolean };
  resubmitRecord: (id: string, patch: { description: string; photos: string[]; score: number }) => void;
  auditRecord: (id: string, action: 'approve' | 'reject', remark?: string) => void;

  // Rectification actions
  submitRectification: (ticketId: string, description: string, photos: string[]) => void;
  recheckRectification: (ticketId: string, passed: boolean, opinion: string) => void;

  // Appeal actions
  submitAppeal: (recordId: string, reason: string, photos?: string[]) => void;
  arbitrateAppeal: (appealId: string, decision: 'maintain' | 'adjust' | 'revoke' | 'request_info', adjustedScore?: number, remark?: string) => void;
  supplementAppeal: (appealId: string, reason: string, photos: string[]) => void;

  // Schedule actions
  addShift: (shift: Omit<DutyShift, 'id'>) => { success: boolean; conflict?: string };
  updateShift: (id: string, updates: Partial<DutyShift>) => { success: boolean; conflict?: string };
  deleteShift: (id: string) => void;

  // Duty attendance actions (P3)
  checkInShift: (shiftId: string) => void;
  completeShift: (shiftId: string) => void;
  reportShiftAbsence: (shiftId: string, reason: string) => void;
  approveShiftSubstitute: (shiftId: string, teacherId: string, teacherName: string) => { success: boolean; conflict?: string };

  // Weekly duty brief (P3)
  weeklyBrief: WeeklyDutyBrief;
  saveWeeklyBrief: (brief: WeeklyDutyBrief) => void;
  publishWeeklyBrief: (brief: WeeklyDutyBrief) => void;

  // Settlement actions
  publishSettlement: (scopeGrade?: 'all' | string) => void;

  // Rule actions
  addRule: (rule: Omit<InspectRuleItem, 'id'>) => void;
  updateRule: (id: string, updates: Partial<InspectRuleItem>) => void;

  // Moral Audit Policy Configuration (德育处审批配置)
  moralAuditEnabled: boolean;
  setMoralAuditEnabled: (enabled: boolean) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotifCount: number;

  // Modals & Toasts
  activeModal: ModalPayload | null;
  openModal: (modal: ModalPayload) => void;
  closeModal: () => void;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'warning' | 'error' | 'info') => void;

  // Quick prototype flow launcher (F01 - F08)
  runPrototypeFlow: (flowId: string) => void;
  activeFlowTag: string | null;
}

const DutyContext = createContext<DutyContextType | null>(null);

const STORAGE_KEY = 'SMART_CAMPUS_DUTY_V4';

export const DutyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or stored state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return INITIAL_USERS[0]; // Start with 张老师 (值周教师)
  });
  const [allUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentCampus, setCampus] = useState<string>('中心校区');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  const [currentTab, setCurrentTab] = useState<'workbench' | 'tasks' | 'scores' | 'approvals' | 'profile'>('workbench');
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeFlowTag, setActiveFlowTag] = useState<string | null>(null);

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [rules, setRules] = useState<InspectRuleItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
    return saved ? JSON.parse(saved) : INITIAL_RULES;
  });

  const [records, setRecords] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_records`);
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [rectifications, setRectifications] = useState<RectificationTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rectifications`);
    return saved ? JSON.parse(saved) : INITIAL_RECTIFICATIONS;
  });

  const [appeals, setAppeals] = useState<AppealTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_appeals`);
    return saved ? JSON.parse(saved) : INITIAL_APPEALS;
  });

  const [shifts, setShifts] = useState<DutyShift[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shifts`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length < INITIAL_SHIFTS.length) {
          return INITIAL_SHIFTS;
        }
        return parsed;
      } catch {
        return INITIAL_SHIFTS;
      }
    }
    return INITIAL_SHIFTS;
  });

  const [dutyPosts, setDutyPosts] = useState<DutyPost[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_duty_posts`);
    return saved ? JSON.parse(saved) : INITIAL_DUTY_POSTS;
  });

  const [dutyTimeSlots, setDutyTimeSlots] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_time_slots`);
    return saved ? JSON.parse(saved) : [
      '晨门礼仪巡查 (07:20-08:00)',
      '大课间与眼保健操 (09:40-10:20)',
      '午间就餐与午休 (11:50-13:30)',
      '放学及包干区清扫 (17:20-18:00)',
      '晚自习与就寝秩序 (21:30-22:30)'
    ];
  });

  const [assessmentCategories, setAssessmentCategories] = useState<{ id: string; name: string }[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : [
      { id: 'hygiene', name: '环境卫生' },
      { id: 'discipline', name: '课间纪律' },
      { id: 'uniform', name: '仪表仪容' },
      { id: 'exercises', name: '两操锻炼' },
      { id: 'dormitory', name: '宿舍就寝' },
      { id: 'safety', name: '校园安全' }
    ];
  });

  const [settlement, setSettlement] = useState<SettlementWeekData>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settlement`);
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENT;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // 积分流水账：所有班级分变动的唯一记账入口
  const [ledger, setLedger] = useState<ScoreLedgerEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ledger`);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  // 值周任务书
  const [weeklyBrief, setWeeklyBrief] = useState<WeeklyDutyBrief>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_weekly_brief`);
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_BRIEF;
  });

  // Modals and toasts
  const [activeModal, setActiveModal] = useState<ModalPayload | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auto-sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_records`, JSON.stringify(records));
  }, [records]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
  }, [classes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rectifications`, JSON.stringify(rectifications));
  }, [rectifications]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_appeals`, JSON.stringify(appeals));
  }, [appeals]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shifts`, JSON.stringify(shifts));
  }, [shifts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_duty_posts`, JSON.stringify(dutyPosts));
  }, [dutyPosts]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_time_slots`, JSON.stringify(dutyTimeSlots));
  }, [dutyTimeSlots]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(assessmentCategories));
  }, [assessmentCategories]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settlement`, JSON.stringify(settlement));
  }, [settlement]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ledger`, JSON.stringify(ledger));
  }, [ledger]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_weekly_brief`, JSON.stringify(weeklyBrief));
  }, [weeklyBrief]);

  const [moralAuditEnabled, setMoralAuditEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('MORAL_AUDIT_ENABLED');
    return saved !== null ? saved === 'true' : true;
  });

  const setMoralAuditEnabled = (enabled: boolean) => {
    setMoralAuditEnabledState(enabled);
    localStorage.setItem('MORAL_AUDIT_ENABLED', String(enabled));
    showToast(
      enabled
        ? '已开启德育处审批：扣分/常规记录按规则送审，加分项始终需审核'
        : '已关闭德育处审批：扣分记录直接生效计分；加分项仍需审核防刷分',
      enabled ? 'info' : 'warning'
    );
  };

  const showToast = (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const openModal = (modal: ModalPayload) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  // 统一记账入口：写流水 + 更新班级分。不变量：100 + Σ(delta) === currentScore
  const applyScoreDelta = (params: {
    classId: string;
    recordId?: string;
    action: ScoreLedgerEntry['action'];
    delta: number;
    operatorName: string;
    note?: string;
  }) => {
    if (params.delta === 0) return;
    const target = classes.find((c) => c.id === params.classId);
    if (!target) return;
    const scoreBefore = target.currentScore;
    const scoreAfter = Number((scoreBefore + params.delta).toFixed(1));
    const entry: ScoreLedgerEntry = {
      id: `led_${Date.now()}`,
      classId: params.classId,
      recordId: params.recordId,
      action: params.action,
      delta: params.delta,
      scoreBefore,
      scoreAfter,
      operatorName: params.operatorName,
      createdAt: formatDateTime(appNow()),
      note: params.note
    };
    setLedger((prev) => [entry, ...prev]);
    setClasses((prev) =>
      prev.map((c) => (c.id === params.classId ? { ...c, currentScore: scoreAfter } : c))
    );
    // 发布后调账：正式榜快照保持冻结，仅标记"待重发修订版"
    setSettlement((prev) =>
      prev.status === 'published' && !prev.amendedAt
        ? { ...prev, amendedAt: formatDateTime(appNow()) }
        : prev
    );
  };

  // 扣分生效时自动下发整改单（createRecord / auditRecord / resubmitRecord 共用）
  const buildRectifyTicket = (
    record: InspectionRecord,
    operatorLabel: string,
    note: string
  ): RectificationTicket => {
    const classObj = classes.find((c) => c.id === record.classId);
    return {
      id: `rect_${Date.now()}`,
      recordId: record.id,
      classId: record.classId,
      className: record.className,
      issueTitle: record.ruleTitle,
      dutyPerson: `${classObj?.homeroomTeacher || '班主任'}`,
      deadline: nextDeadline(),
      status: 'pending',
      timeline: [
        {
          time: formatDateTime(appNow()),
          action: '扣分生效自动下发整改单',
          operator: operatorLabel,
          note
        }
      ]
    };
  };

  // Switch user role with prompt
  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return;
    setCurrentUser(target);
    showToast(`已切换身份为：${target.name} (${target.title})`, 'info');
  };

  const toggleNetwork = () => {
    const next = !isOnline;
    setIsOnline(next);
    showToast(next ? '网络连接已恢复，系统在线' : '网络已断开，已进入离线暂存模式', next ? 'success' : 'warning');
  };

  // Duplicate inspector check (check if class has same rule record today)
  const checkDuplicate = (classId: string, ruleId: string) => {
    const today = todayString();
    return records.find(
      (r) => r.classId === classId && r.ruleId === ruleId && r.createdAt.startsWith(today)
    );
  };

  // Create new inspection record
  const createRecord = (data: Partial<InspectionRecord>, silent = false) => {
    const classObj = classes.find((c) => c.id === data.classId);
    const ruleObj = rules.find((r) => r.id === data.ruleId);

    // 审核判定统一收口：加分恒送审；扣分按德育处开关 + 规则配置
    const finalScore = data.score ?? (ruleObj?.defaultScore ?? 0);
    const newStatus = decideAudit(ruleObj, finalScore, moralAuditEnabled);

    const now = appNow();
    const timeStr = formatDateTime(now);

    const newRecord: InspectionRecord = {
      id: `rec_${Date.now()}`,
      classId: data.classId || 'class_g1_1',
      className: classObj?.name || '高一(1)班',
      grade: classObj?.grade || '高一年级',
      ruleId: data.ruleId || 'rule_hyg_1',
      ruleCategory: data.ruleCategory || ruleObj?.category || 'hygiene',
      ruleTitle: data.ruleTitle || ruleObj?.title || '巡查记录',
      score: finalScore,
      type: data.type || (finalScore < 0 ? 'deduct' : finalScore > 0 ? 'add' : 'normal'),
      status: newStatus,
      timeSlot: data.timeSlot || 'recess',
      timeSlotName: data.timeSlotName || '常规检查',
      zone: data.zone || currentUser.dutyZone || '常规检查区域',
      description: data.description || '',
      photos: data.photos && data.photos.length > 0 ? data.photos : ['https://images.unsplash.com/photo-1584697964190-705b89368d40?w=600&auto=format&fit=crop&q=80'],
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      createdAt: timeStr,
      settlementWeek: weekNumberForDate(timeStr.slice(0, 10)),
    };

    // If offline, save to draft
    if (!isOnline) {
      const draft: OfflineDraft = {
        id: `draft_${Date.now()}`,
        timestamp: timeStr,
        classId: newRecord.classId,
        className: newRecord.className,
        ruleTitle: newRecord.ruleTitle,
        score: newRecord.score,
        description: newRecord.description,
        status: 'pending_sync'
      };
      setOfflineDrafts((prev) => [draft, ...prev]);
      openModal({
        type: 'offline_saved',
        title: '提交失败 (网络异常)',
        message: '网络连接异常，检查内容已在本地安全暂存。恢复网络后可一键同步。',
        confirmText: '我知道了',
        onConfirm: closeModal
      });
      return { success: true, record: newRecord, isPendingAudit: false };
    }

    // Add to records
    setRecords((prev) => [newRecord, ...prev]);

    // If active immediately, post score to ledger & update class score
    if (newStatus === 'active') {
      applyScoreDelta({
        classId: newRecord.classId,
        recordId: newRecord.id,
        action: 'instant_effect',
        delta: newRecord.score,
        operatorName: currentUser.name,
        note: newRecord.ruleTitle
      });

      // 扣分生效时自动下发整改单，与对应班级班主任待办联动
      if (newRecord.score < 0) {
        const newTicket = buildRectifyTicket(
          newRecord,
          `${currentUser.name} (值周教师)`,
          newRecord.description || '现场巡查扣分，要求班级按规范及时整改闭环'
        );
        newRecord.rectificationId = newTicket.id;
        setRectifications(prev => [newTicket, ...prev]);
      }
      if (!silent) {
        openModal({
          type: 'record_active',
          title: '记录已生效',
          message: `本次检查已按规则计入${newRecord.className}成绩 (${newRecord.score > 0 ? `+${newRecord.score}` : newRecord.score}分)。`,
          confirmText: '查看记录',
          cancelText: '完成',
          onConfirm: () => {
            closeModal();
            setCurrentTab('tasks');
            setActiveSubPage('records_list');
          },
          onCancel: () => {
            closeModal();
            setActiveSubPage(null);
          }
        });
      }
    } else {
      // Pending audit notification for admin
      const adminNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: '待审核检查提醒',
        content: `${currentUser.name}提交了${newRecord.className}的${newRecord.ruleTitle}，分值 ${newRecord.score} 分，等待管理员审核。`,
        type: 'audit',
        targetRole: 'admin',
        read: false,
        createdAt: timeStr,
        relatedRecordId: newRecord.id
      };
      setNotifications((prev) => [adminNotif, ...prev]);

      if (!silent) {
        openModal({
          type: 'inspect_success',
          title: '提交成功',
          message: '检查记录已提交，等待德育处管理员审核。审核通过前尚未计分。',
          confirmText: '继续检查',
          cancelText: '查看记录',
          onConfirm: () => {
            closeModal();
            setActiveSubPage(null);
            setTimeout(() => setActiveSubPage('quick_inspect'), 50);
          },
          onCancel: () => {
            closeModal();
            setCurrentTab('tasks');
            setActiveSubPage('records_list');
          }
        });
      }
    }

    return { success: true, record: newRecord, isPendingAudit: newStatus === 'pending_audit' };
  };

  // 退回重提：可改说明/照片/分值。rejected 记录从未入账，按新分值走即时/待审分支
  const resubmitRecord = (
    id: string,
    patch: { description: string; photos: string[]; score: number }
  ) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    const ruleObj = rules.find((r) => r.id === record.ruleId);
    const newStatus = decideAudit(ruleObj, patch.score, moralAuditEnabled);
    const timeStr = formatDateTime(appNow());
    const newType: InspectionRecord['type'] =
      patch.score < 0 ? 'deduct' : patch.score > 0 ? 'add' : 'normal';

    const updated: InspectionRecord = {
      ...record,
      description: patch.description,
      photos: patch.photos,
      score: patch.score,
      type: newType,
      status: newStatus,
      auditRemark: undefined,
      auditorName: undefined,
      auditedAt: undefined
    };

    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));

    if (newStatus === 'active') {
      applyScoreDelta({
        classId: record.classId,
        recordId: record.id,
        action: 'instant_effect',
        delta: patch.score,
        operatorName: currentUser.name,
        note: `退回重提生效：${record.ruleTitle}`
      });
      if (patch.score < 0) {
        const newTicket = buildRectifyTicket(
          updated,
          `${currentUser.name} (值周教师)`,
          patch.description || '重提扣分生效，要求班级按规范及时整改闭环'
        );
        setRectifications((prev) => [newTicket, ...prev]);
        setRecords((prev) =>
          prev.map((r) => (r.id === id ? { ...r, rectificationId: newTicket.id } : r))
        );
      }
    }

    // 重提成功一律通知管理员（含免审直接生效的情形）
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: '退回记录已重新提交',
        content: `${currentUser.name}重新提交了${record.className}的【${record.ruleTitle}】（${newStatus === 'active' ? '免审已生效计分' : '等待审核'}），请知悉。`,
        type: 'audit',
        targetRole: 'admin',
        read: false,
        createdAt: timeStr,
        relatedRecordId: record.id
      },
      ...prev
    ]);

    showToast(
      newStatus === 'active' ? '已重新提交并生效计分' : '已重新提交，等待德育处审核',
      'success'
    );
  };

  // Sync offline drafts
  const syncOfflineDrafts = () => {
    if (offlineDrafts.length === 0) {
      showToast('暂无待同步的离线草稿', 'info');
      return;
    }
    offlineDrafts.forEach((draft) => {
      createRecord({
        classId: draft.classId,
        className: draft.className,
        ruleTitle: draft.ruleTitle,
        score: draft.score,
        description: draft.description
      }, true); // silent：多条草稿同步时不逐条弹窗
    });
    setOfflineDrafts([]);
    showToast('离线数据已成功同步至服务器！', 'success');
  };

  // Admin Audits a record
  const auditRecord = (id: string, action: 'approve' | 'reject', remark = '') => {
    const record = records.find((r) => r.id === id);
    if (!record) return;

    const now = appNow();
    const timeStr = formatDateTime(now);

    if (action === 'approve') {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'active',
                auditRemark: remark || '审核通过，分值生效',
                auditorName: currentUser.name,
                auditedAt: timeStr
              }
            : r
        )
      );
      // Post score to ledger & apply to class
      applyScoreDelta({
        classId: record.classId,
        recordId: record.id,
        action: 'audit_effect',
        delta: record.score,
        operatorName: currentUser.name,
        note: record.ruleTitle
      });
      showToast(`已通过审核，${record.className}计分已生效 (${record.score > 0 ? `+${record.score}` : record.score}分)`, 'success');

      // 扣分审核通过后，自动下发整改单至班主任待办池
      if (record.score < 0) {
        const newTicket = buildRectifyTicket(
          record,
          `${currentUser.name} (德育管理员)`,
          remark || '扣分审核生效，请班主任及时督促整改反馈'
        );
        setRectifications(prev => [newTicket, ...prev]);
        setRecords(prev =>
          prev.map(r => (r.id === record.id ? { ...r, rectificationId: newTicket.id } : r))
        );
      }
    } else {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'rejected',
                auditRemark: remark || '证据不充分，予以退回',
                auditorName: currentUser.name,
                auditedAt: timeStr
              }
            : r
        )
      );
      showToast('已退回该条检查记录，本次不计分', 'warning');
    }
  };

  // Submit Rectification
  const submitRectification = (ticketId: string, description: string, photos: string[]) => {
    const now = appNow();
    const timeStr = formatDateTime(now);

    setRectifications((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'submitted',
            rectifyDescription: description,
            rectifyPhotos: photos,
            submittedAt: timeStr,
            timeline: [
              ...t.timeline,
              {
                time: timeStr,
                action: '班主任提交整改反馈',
                operator: currentUser.name,
                note: description
              }
            ]
          };
        }
        return t;
      })
    );

    // Update parent record status
    const ticket = rectifications.find((t) => t.id === ticketId);
    if (ticket) {
      setRecords((prev) =>
        prev.map((r) => (r.id === ticket.recordId ? { ...r, status: 'rechecking' } : r))
      );
    }

    showToast('整改内容已提交，已进入待复查状态', 'success');
  };

  // Recheck Rectification
  const recheckRectification = (ticketId: string, passed: boolean, opinion: string) => {
    const now = appNow();
    const timeStr = formatDateTime(now);

    setRectifications((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: passed ? 'passed' : 'rejected',
            recheckOpinion: opinion,
            recheckerName: currentUser.name,
            recheckedAt: timeStr,
            timeline: [
              ...t.timeline,
              {
                time: timeStr,
                action: passed ? '管理员验收通过' : '验收未通过退回',
                operator: currentUser.name,
                note: opinion
              }
            ]
          };
        }
        return t;
      })
    );

    const ticket = rectifications.find((t) => t.id === ticketId);
    if (ticket) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === ticket.recordId
            ? { ...r, status: passed ? 'closed' : 'need_rectify' }
            : r
        )
      );
    }

    showToast(passed ? '整改验收通过，工单已办结' : '整改未达标，已退回重新整改', passed ? 'success' : 'warning');
  };

  // Submit Appeal
  const submitAppeal = (recordId: string, reason: string, photos: string[] = []) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    const newAppeal: AppealTicket = {
      id: `appeal_${Date.now()}`,
      recordId,
      classId: record.classId,
      className: record.className,
      appellantName: currentUser.name,
      reason,
      evidencePhotos: photos,
      status: 'pending',
      submittedAt: formatDateTime(appNow())
    };

    setAppeals((prev) => [newAppeal, ...prev]);
    // 双轨制：申诉只挂 appealId，不覆盖 record.status（整改/审核生命周期独立流转）
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId ? { ...r, appealId: newAppeal.id } : r
      )
    );

    // Notify admin
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: '收到扣分申诉申请',
        content: `${currentUser.name}对${record.className} ${record.ruleTitle}发起申诉，请德育处复核。`,
        type: 'appeal',
        targetRole: 'admin',
        read: false,
        createdAt: formatDateTime(appNow()),
        relatedRecordId: recordId
      },
      ...prev
    ]);

    showToast('申诉材料已提交，德育处将进行复核裁决', 'success');
  };

  // Arbitrate Appeal
  const arbitrateAppeal = (
    appealId: string, 
    decision: 'maintain' | 'adjust' | 'revoke' | 'request_info', 
    adjustedScore?: number, 
    remark = ''
  ) => {
    const appeal = appeals.find((a) => a.id === appealId);
    if (!appeal) return;

    const record = records.find((r) => r.id === appeal.recordId);
    const now = appNow();
    const timeStr = formatDateTime(now);

    setAppeals((prev) =>
      prev.map((a) =>
        a.id === appealId
          ? {
              ...a,
              decision,
              adjustedScore,
              decisionRemark: remark,
              decidedBy: currentUser.name,
              decidedAt: timeStr,
              status: decision === 'request_info' ? 'need_more_info' : 'resolved'
            }
          : a
      )
    );

    if (record) {
      if (decision === 'maintain') {
        // 双轨制：维持原判不动 record.status（整改进度保留）
        showToast('复核决定：维持原判，扣分有效', 'info');
      } else if (decision === 'revoke') {
        // Rollback score via ledger
        applyScoreDelta({
          classId: record.classId,
          recordId: record.id,
          action: 'appeal_revoke',
          delta: -record.score,
          operatorName: currentUser.name,
          note: `申诉撤销冲正：${record.ruleTitle}`
        });
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? { ...r, status: 'closed', score: 0, description: `${r.description} (申诉成立撤销原扣分)` }
              : r
          )
        );
        // 撤销扣分则关联整改工单一并作废
        setRectifications((prev) =>
          prev.map((t) =>
            t.recordId === record.id && t.status !== 'passed' && t.status !== 'cancelled'
              ? {
                  ...t,
                  status: 'cancelled' as const,
                  timeline: [
                    ...t.timeline,
                    {
                      time: timeStr,
                      action: '申诉撤销扣分，整改工单随之作废',
                      operator: currentUser.name,
                      note: remark || '原扣分已冲正，不再要求整改'
                    }
                  ]
                }
              : t
          )
        );
        showToast('复核决定：撤销扣分，分数已全额冲正！关联整改工单已作废', 'success');
      } else if (decision === 'adjust' && adjustedScore !== undefined) {
        // Adjust score delta via ledger
        const scoreDiff = adjustedScore - record.score;
        applyScoreDelta({
          classId: record.classId,
          recordId: record.id,
          action: 'appeal_adjust',
          delta: scoreDiff,
          operatorName: currentUser.name,
          note: `申诉调分 ${record.score} → ${adjustedScore}`
        });
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id
              ? { ...r, score: adjustedScore, description: `${r.description} (经申诉复核分值调整为 ${adjustedScore}分)` }
              : r
          )
        );
        showToast(`复核决定：分值调整为 ${adjustedScore}分，已更新班级积分`, 'success');
      }
    }
  };

  // 申诉补充材料：need_more_info → pending，供管理员重新仲裁
  const supplementAppeal = (appealId: string, reason: string, photos: string[]) => {
    const appeal = appeals.find((a) => a.id === appealId);
    if (!appeal) return;
    const timeStr = formatDateTime(appNow());

    setAppeals((prev) =>
      prev.map((a) =>
        a.id === appealId
          ? {
              ...a,
              status: 'pending',
              reason: reason || a.reason,
              evidencePhotos: photos.length > 0 ? photos : a.evidencePhotos,
              decision: undefined,
              decisionRemark: undefined
            }
          : a
      )
    );

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: '申诉已补充材料',
        content: `${appeal.className}班主任已补充申诉材料，请德育处重新复核裁决。`,
        type: 'appeal',
        targetRole: 'admin',
        read: false,
        createdAt: timeStr,
        relatedRecordId: appeal.recordId
      },
      ...prev
    ]);

    showToast('补充材料已提交，申诉重新进入待复核', 'success');
  };

  // Add Duty Shift with conflict check
  const addShift = (shiftData: Omit<DutyShift, 'id'>) => {
    // Dynamic Conflict detection using schedule logic check
    const check = checkTeacherScheduleConflict(
      shifts,
      shiftData.teacherId,
      shiftData.teacherName,
      shiftData.date,
      shiftData.dayOfWeek,
      shiftData.timeSlot
    );

    if (check.hasConflict) {
      return { 
        success: false, 
        conflict: check.reason 
      };
    }

    const newShift: DutyShift = {
      ...shiftData,
      id: `shift_${Date.now()}`
    };

    setShifts((prev) => [...prev, newShift]);
    showToast(`排班添加成功：${newShift.teacherName} (${newShift.dayOfWeek} ${newShift.timeSlot})`, 'success');
    return { success: true };
  };

  const updateShift = (id: string, updates: Partial<DutyShift>) => {
    const target = shifts.find(s => s.id === id);
    if (target) {
      const merged = { ...target, ...updates };
      const teacher = allUsers.find(u => u.id === merged.teacherId) || { name: merged.teacherName };
      const check = checkTeacherScheduleConflict(
        shifts,
        merged.teacherId,
        teacher.name,
        merged.date,
        merged.dayOfWeek,
        merged.timeSlot,
        id
      );
      if (check.hasConflict) {
        return { success: false, conflict: check.reason };
      }
    }

    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, hasConflict: false, conflictReason: undefined } : s))
    );
    showToast('排班调整成功！', 'success');
    return { success: true };
  };

  const deleteShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    showToast('已移除该排班任务', 'info');
  };

  // ---- 值勤履约闭环（P3）----

  // 签到：仅排班本人、pending 状态；幂等（已签到只提示）
  const checkInShift = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;
    if (shift.checkInAt) {
      showToast(`已于 ${shift.checkInAt} 签到，无需重复签到`, 'info');
      return;
    }
    if (shift.status === 'completed') {
      showToast('该班次已完成执勤', 'info');
      return;
    }
    const timeStr = formatDateTime(appNow());
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId ? { ...s, checkInAt: timeStr, status: 'in_progress' } : s
      )
    );
    showToast(`签到成功（${timeStr}），请按时到岗履职`, 'success');
  };

  // 完成执勤（到岗确认）：仅 in_progress 可完成
  const completeShift = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;
    if (shift.status !== 'in_progress') {
      showToast('请先签到后再完成执勤', 'warning');
      return;
    }
    setShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, status: 'completed' } : s))
    );
    showToast('已完成执勤确认，本班次到岗履职闭环', 'success');
  };

  // 缺岗/请假上报：打标记 + 通知管理员（status 不变，等待代岗）
  const reportShiftAbsence = (shiftId: string, reason: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;
    const timeStr = formatDateTime(appNow());
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? { ...s, absenceReason: reason, absenceReportedBy: currentUser.name }
          : s
      )
    );
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: '值勤缺岗上报',
        content: `${currentUser.name}上报${shift.date}【${shift.timeSlot}】(${shift.zone})无法到岗：${reason}。请德育处尽快指派代岗人员。`,
        type: 'duty',
        targetRole: 'admin',
        read: false,
        createdAt: timeStr,
      },
      ...prev
    ]);
    showToast('缺岗已上报，等待德育处指派代岗', 'success');
  };

  // 代岗审批：不改原 teacherId（审计友好），写 substitute* 字段；对代岗人做冲突检测
  const approveShiftSubstitute = (shiftId: string, teacherId: string, teacherName: string): { success: boolean; conflict?: string } => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return { success: false };
    const check = checkTeacherScheduleConflict(
      shifts,
      teacherId,
      teacherName,
      shift.date,
      shift.dayOfWeek,
      shift.timeSlot,
      shift.id
    );
    if (check.hasConflict) {
      return { success: false, conflict: check.reason };
    }
    const timeStr = formatDateTime(appNow());
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? { ...s, substituteTeacherId: teacherId, substituteTeacherName: teacherName }
          : s
      )
    );
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: '代岗指派通知',
        content: `经德育处审批，${teacherName}代岗${shift.date}【${shift.timeSlot}】(${shift.zone})，原排班教师${shift.teacherName}。请代岗人按时签到到岗。`,
        type: 'duty',
        targetRole: 'all',
        read: false,
        createdAt: timeStr,
      },
      ...prev
    ]);
    showToast(`已指派【${teacherName}】代岗该班次`, 'success');
    return { success: true };
  };

  // ---- 值周任务书 ----

  const saveWeeklyBrief = (brief: WeeklyDutyBrief) => {
    setWeeklyBrief(brief);
    showToast('值周任务书草稿已保存', 'success');
  };

  const publishWeeklyBrief = (brief: WeeklyDutyBrief) => {
    const timeStr = formatDateTime(appNow());
    const published: WeeklyDutyBrief = {
      ...brief,
      status: 'published',
      publishedAt: timeStr,
      publishedBy: currentUser.name
    };
    setWeeklyBrief(published);
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `第${brief.weekNumber}周值周任务书已发布`,
        content: `值周组长：${brief.leadTeacherName}；组员${brief.memberIds.length}人。请值周教师查看任务书并按时到岗履职。`,
        type: 'duty',
        targetRole: 'all',
        read: false,
        createdAt: timeStr,
      },
      ...prev
    ]);
    showToast(`第${brief.weekNumber}周值周任务书已发布并通知值周组`, 'success');
  };

  // Duty Post actions (A05)
  const addDutyPost = (postData: Omit<DutyPost, 'id'>) => {
    const newPost: DutyPost = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: todayString()
    };
    setDutyPosts((prev) => [newPost, ...prev]);
    showToast(`巡查岗位【${newPost.name}】录入成功！`, 'success');
    return newPost;
  };

  const updateDutyPost = (id: string, updates: Partial<DutyPost>) => {
    setDutyPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('巡查岗位信息已更新', 'success');
  };

  const deleteDutyPost = (id: string) => {
    setDutyPosts((prev) => prev.filter((p) => p.id !== id));
    showToast('已删除该巡查岗位', 'info');
  };

  const toggleDutyPostActive = (id: string) => {
    setDutyPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextActive = !p.isActive;
          showToast(`已${nextActive ? '启用' : '停用'}岗位【${p.name}】`, 'info');
          return { ...p, isActive: nextActive };
        }
        return p;
      })
    );
  };

  const addTimeSlot = (slot: string) => {
    setDutyTimeSlots(prev => [...prev, slot]);
    showToast('已添加巡查时段', 'success');
  };

  const removeTimeSlot = (slot: string) => {
    setDutyTimeSlots(prev => prev.filter(s => s !== slot));
    setDutyPosts(prev => prev.map(p => ({
      ...p,
      timeSlots: p.timeSlots.filter(s => s !== slot)
    })));
    showToast('已移除巡查时段', 'info');
  };

  const renameTimeSlot = (from: string, to: string) => {
    const next = to.trim();
    if (!next || next === from) return;
    setDutyTimeSlots(prev => prev.map(s => (s === from ? next : s)));
    setDutyPosts(prev => prev.map(p => ({
      ...p,
      timeSlots: p.timeSlots.map(s => (s === from ? next : s))
    })));
    setShifts(prev => prev.map(s => (s.timeSlot === from ? { ...s, timeSlot: next } : s)));
    showToast('巡查时段已更新', 'success');
  };

  const addCategory = (id: string, name: string) => {
    setAssessmentCategories(prev => [...prev, { id, name }]);
    showToast('已添加考评维度', 'success');
  };

  const removeCategory = (id: string) => {
    setAssessmentCategories(prev => prev.filter(c => c.id !== id));
    setDutyPosts(prev => prev.map(p => ({
      ...p,
      primaryCategories: p.primaryCategories.filter(c => c !== id)
    })));
    showToast('已移除考评维度', 'info');
  };

  const renameCategory = (id: string, name: string) => {
    const next = name.trim();
    if (!next) return;
    setAssessmentCategories(prev => prev.map(c => (c.id === id ? { ...c, name: next } : c)));
    setRules(prev => prev.map(r => (r.category === id ? { ...r, categoryName: next } : r)));
    showToast('考核维度已更新', 'success');
  };

  // Publish settlement: 生成不可变排名快照（发布后实时分再变动只标记 amendedAt，不改快照）
  const publishSettlement = (scopeGrade: 'all' | string = 'all') => {
    const now = appNow();
    const timeStr = formatDateTime(now);

    const scopedClasses = classes.filter((c) => scopeGrade === 'all' || c.grade === scopeGrade);
    const rankings = [...scopedClasses]
      .sort((a, b) => b.currentScore - a.currentScore)
      .map((c, idx) => {
        // add/deduct 从 ledger 按符号分桶，保证 base+add+deduct === final
        const classLedger = ledger.filter((l) => l.classId === c.id);
        const addScore = Number(
          classLedger.filter((l) => l.delta > 0).reduce((s, l) => s + l.delta, 0).toFixed(1)
        );
        const deductScore = Number(
          classLedger.filter((l) => l.delta < 0).reduce((s, l) => s + l.delta, 0).toFixed(1)
        );
        return {
          classId: c.id,
          className: c.name,
          grade: c.grade,
          baseScore: 100,
          addScore,
          deductScore,
          finalScore: c.currentScore,
          rank: idx + 1,
          isHonorClass: idx < 3
        };
      });

    setSettlement((prev) => ({
      ...prev,
      status: 'published',
      publishedAt: timeStr,
      publishedBy: currentUser.name,
      amendedAt: undefined,
      totalInspections: records.length,
      pendingAuditCount: records.filter((r) => r.status === 'pending_audit').length,
      pendingAppealCount: appeals.filter((a) => a.status !== 'resolved').length,
      rankings
    }));

    // Add broadcast notification
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        title: `第${settlement.weekNumber}周值周成绩正式发布`,
        content: `第${settlement.weekNumber}周常规考核成绩与文明流动红旗榜单已正式公布（${scopeGrade === 'all' ? '全校范围' : scopeGrade}，${rankings.length}个班级），欢迎前往成绩中心查看。`,
        type: 'publish',
        targetRole: 'all',
        read: false,
        createdAt: timeStr
      },
      ...prev
    ]);

    showToast(`第${settlement.weekNumber}周正式成绩发布成功！已向全校师生推送通知`, 'success');
  };

  // Rule actions
  const addRule = (rule: Omit<InspectRuleItem, 'id'>) => {
    const newRule: InspectRuleItem = {
      ...rule,
      id: `rule_${Date.now()}`
    };
    setRules((prev) => [...prev, newRule]);
    showToast(`新增规则【${newRule.title}】成功`, 'success');
  };

  const updateRule = (id: string, updates: Partial<InspectRuleItem>) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    showToast('规则配置已保存', 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    // 只标记当前角色可见的通知，避免切换身份后他方未读被误清
    setNotifications((prev) =>
      prev.map((n) => (isNotifVisible(n, currentUser) ? { ...n, read: true } : n))
    );
    showToast('已全部标记为已读', 'info');
  };

  // 通知可见性统一谓词（抽屉列表与未读角标共用，杜绝角标≠列表）
  const unreadNotifCount = notifications.filter((n) => !n.read && isNotifVisible(n, currentUser)).length;

  // Run Prototype Flow (F01 - F08)
  const runPrototypeFlow = (flowId: string) => {
    setActiveFlowTag(flowId);
    switch (flowId) {
      case 'F01': // 登录 → 身份选择 → 工作台
        setCurrentTab('profile');
        setActiveSubPage('role_switch');
        showToast('【流程F01】登录与身份切换：选择不同教师角色体验专属工作台', 'info');
        break;
      case 'F02': // 首页 → 我的任务 → 快速检查 → 提交成功
        switchUser('user_teacher_zhang');
        setCurrentTab('tasks');
        setActiveSubPage('quick_inspect');
        showToast('【流程F02】快速检查：填报班级常规巡查扣分/加分', 'info');
        break;
      case 'F03': // 检查记录 → 检查详情 → 退回原因 → 修改提交
        switchUser('user_teacher_zhang');
        setCurrentTab('tasks');
        setActiveSubPage('records_list');
        setSelectedRecordId('rec_20261008_05'); // The rejected record
        showToast('【流程F03】查看退回记录并了解退回原因', 'info');
        break;
      case 'F04': // 待办 → 检查详情 → 审核通过 → 计分生效
        switchUser('user_admin_li');
        setCurrentTab('approvals');
        setActiveSubPage('audit_center');
        showToast('【流程F04】审批待办：管理员审核扣分证据并生效', 'info');
        break;
      case 'F05': // 排班 → 编辑排班 → 冲突提示 → 保存发布
        switchUser('user_admin_li');
        setCurrentTab('tasks');
        setActiveSubPage('schedule_admin');
        showToast('【流程F05】值周排班管理与冲突检测', 'info');
        break;
      case 'F06': // 班级积分 → 检查详情 → 提交申诉 → 管理员裁决
        switchUser('user_homeroom_wang');
        setCurrentTab('scores');
        setActiveSubPage(null);
        showToast('【流程F06】班主任查看班级积分明细并对争议扣分发起申诉', 'info');
        break;
      case 'F07': // 整改通知 → 整改反馈 → 提交复查 → 完成
        switchUser('user_homeroom_wang');
        setCurrentTab('approvals');
        setActiveSubPage('rectify_list');
        showToast('【流程F07】班主任接收整改工单、上传照片反馈与验收闭环', 'info');
        break;
      case 'F08': // 成绩管理 → 预结算 → 异常处理 → 发布排名
        switchUser('user_admin_li');
        setCurrentTab('scores');
        setActiveSubPage('settlement_pipeline');
        showToast('【流程F08】周积分5步预结算核对与正式成绩发布', 'info');
        break;
      default:
        break;
    }
  };

  return (
    <DutyContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        switchUser,
        allUsers,
        currentCampus,
        setCampus,
        isMobileFrame,
        setIsMobileFrame,
        currentTab,
        setCurrentTab,
        activeSubPage,
        setActiveSubPage,
        selectedRecordId,
        setSelectedRecordId,
        classes,
        rules,
        records,
        rectifications,
        appeals,
        shifts,
        dutyPosts,
        dutyTimeSlots,
        assessmentCategories,
        settlement,
        notifications,
        offlineDrafts,
        ledger,
        isOnline,
        toggleNetwork,
        syncOfflineDrafts,
        checkDuplicate,
        createRecord,
        resubmitRecord,
        auditRecord,
        submitRectification,
        recheckRectification,
        submitAppeal,
        arbitrateAppeal,
        supplementAppeal,
        addShift,
        updateShift,
        deleteShift,
        checkInShift,
        completeShift,
        reportShiftAbsence,
        approveShiftSubstitute,
        weeklyBrief,
        saveWeeklyBrief,
        publishWeeklyBrief,
        addDutyPost,
        updateDutyPost,
        deleteDutyPost,
        toggleDutyPostActive,
        addTimeSlot,
        removeTimeSlot,
        renameTimeSlot,
        addCategory,
        removeCategory,
        renameCategory,
        publishSettlement,
        addRule,
        updateRule,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotifCount,
        activeModal,
        openModal,
        closeModal,
        toasts,
        showToast,
        runPrototypeFlow,
        activeFlowTag,
        moralAuditEnabled,
        setMoralAuditEnabled
      }}
    >
      {children}
    </DutyContext.Provider>
  );
};

export const useDuty = () => {
  const context = useContext(DutyContext);
  if (!context) {
    throw new Error('useDuty must be used within a DutyProvider');
  }
  return context;
};
