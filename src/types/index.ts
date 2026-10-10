export type UserRole = 'duty_teacher' | 'homeroom_teacher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  title: string;
  school: string;
  campus: string;
  homeroomClassId?: string; // If homeroom teacher
  dutyZone?: string;        // If duty teacher
}

export type RecordStatus =
  | 'pending_audit'  // 待审核
  | 'rejected'       // 已退回
  | 'active'         // 已生效
  | 'need_rectify'   // 待整改
  | 'rechecking'     // 待复查
  | 'appealing'      // 申诉中（历史数据兼容保留；双轨制后申诉态由 AppealTicket 承载）
  | 'closed';        // 已办结

export type InspectCategory = 
  | 'hygiene'        // 环境卫生
  | 'discipline'     // 课间纪律
  | 'uniform'        // 仪表仪容
  | 'exercises'      // 两操锻炼 (大课间/眼操)
  | 'dormitory'      // 宿舍午休
  | 'safety';        // 校园安全与礼貌

export interface InspectRuleItem {
  id: string;
  category: InspectCategory;
  categoryName: string;
  title: string;
  defaultScore: number; // positive for addition, negative for deduction
  description: string;
  requiresAudit: boolean;
  maxScoreDelta?: number;
}

export interface SchoolClass {
  id: string;
  grade: string;
  name: string;
  fullName: string;
  homeroomTeacher: string;
  studentCount: number;
  currentScore: number;
  lastWeekRank: number;
  stars: number;
}

export interface InspectionRecord {
  id: string;
  classId: string;
  className: string;
  grade: string;
  ruleId: string;
  ruleCategory: InspectCategory;
  ruleTitle: string;
  score: number; // e.g. -2 or +2
  type: 'deduct' | 'add' | 'normal';
  status: RecordStatus;
  timeSlot: 'morning' | 'recess' | 'lunch' | 'afternoon' | 'evening';
  timeSlotName: string;
  zone: string;
  description: string;
  photos: string[];
  inspectorId: string;
  inspectorName: string;
  createdAt: string;
  auditRemark?: string;
  auditorName?: string;
  auditedAt?: string;
  rectificationId?: string;
  appealId?: string;
  settlementWeek?: number;
}

export interface RectificationTicket {
  id: string;
  recordId: string;
  classId: string;
  className: string;
  issueTitle: string;
  dutyPerson: string;
  deadline: string;
  status: 'pending' | 'submitted' | 'rejected' | 'passed' | 'cancelled';
  rectifyDescription?: string;
  rectifyPhotos?: string[];
  submittedAt?: string;
  recheckOpinion?: string;
  recheckedAt?: string;
  recheckerName?: string;
  timeline: {
    time: string;
    action: string;
    operator: string;
    note?: string;
  }[];
}

export interface AppealTicket {
  id: string;
  recordId: string;
  classId: string;
  className: string;
  appellantName: string;
  reason: string;
  evidencePhotos?: string[];
  status: 'pending' | 'resolved' | 'need_more_info';
  submittedAt: string;
  decision?: 'maintain' | 'adjust' | 'revoke' | 'request_info';
  adjustedScore?: number;
  decisionRemark?: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface DutyPost {
  id: string;
  name: string; // 岗位名称，如：校门礼仪巡查岗、知行楼二层及中庭岗、第一食堂就餐秩序岗
  location: string; // 具体地点，如：知行楼1-4层走廊及楼梯拐角
  campus: string; // 校区
  targetScope: string; // 考评范围，如：高一年级全班级、全校各年级
  timeSlots: string[]; // 重点巡查时段
  primaryCategories: (InspectCategory | string)[]; // 重点关注考评类别
  defaultTeacherId?: string;
  defaultTeacherName?: string;
  requirements: string; // 岗位巡查职责及检查要点
  checklist: string[];  // 岗位巡查要点清单
  priority: 'high' | 'medium' | 'normal'; // 重点等级
  isActive: boolean;
  createdAt?: string;
}

export interface DutyShift {
  id: string;
  postId?: string; // 关联的巡查岗位ID
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 周一 ~ 周日
  timeSlot: string; // 晨检、眼操、大课间、午餐、放学、周末巡查等
  zone: string; // 如：校门主道、教学楼A座走廊、食堂一楼
  teacherId: string;
  teacherName: string;
  status: 'pending' | 'in_progress' | 'completed';
  hasConflict?: boolean;
  conflictReason?: string;
  // 值勤履约闭环（P3）：签到 / 缺岗 / 代岗
  checkInAt?: string;          // 签到时间
  absenceReason?: string;      // 缺岗/请假原因（上报后有值）
  absenceReportedBy?: string;
  substituteTeacherId?: string;   // 代岗人（原排班 teacherId 不被破坏）
  substituteTeacherName?: string;
}

// 值周任务书：本周值周名单 + 值周组长 + 交接备忘
export interface WeeklyDutyBrief {
  weekNumber: number;
  leadTeacherId: string;
  leadTeacherName: string;
  memberIds: string[];
  handoverNote: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  publishedBy?: string;
}

export interface SettlementWeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'preview' | 'locked' | 'published';
  totalInspections: number;
  pendingAuditCount: number;
  pendingAppealCount: number;
  publishedAt?: string;
  publishedBy?: string;
  /** 发布后发生过调账的时间（正式榜仍为已发布快照，提示管理员重发修订版） */
  amendedAt?: string;
  rankings: {
    classId: string;
    className: string;
    grade: string;
    baseScore: number;
    addScore: number;
    deductScore: number;
    finalScore: number;
    rank: number;
    isHonorClass: boolean;
  }[];
}

export interface OfflineDraft {
  id: string;
  timestamp: string;
  classId: string;
  className: string;
  ruleTitle: string;
  score: number;
  description: string;
  status: 'pending_sync' | 'syncing' | 'failed';
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'audit' | 'rectify' | 'appeal' | 'publish' | 'system' | 'duty';
  targetRole: UserRole | 'all';
  targetClassId?: string;
  read: boolean;
  createdAt: string;
  relatedRecordId?: string;
}

// 积分流水账：每次班级分变动都落一条，班级分恒等于 100 + Σ(delta)
export interface ScoreLedgerEntry {
  id: string;
  classId: string;
  recordId?: string;
  action: 'opening' | 'instant_effect' | 'audit_effect' | 'appeal_revoke' | 'appeal_adjust';
  delta: number; // 相对 100 基准的变动；opening 为轧差值 (initialScore - 100)
  scoreBefore: number;
  scoreAfter: number;
  operatorName: string;
  createdAt: string;
  note?: string;
}
