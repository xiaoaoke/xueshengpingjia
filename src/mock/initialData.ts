import {
  UserProfile,
  SchoolClass,
  InspectRuleItem,
  InspectionRecord,
  RectificationTicket,
  AppealTicket,
  DutyShift,
  SettlementWeekData,
  NotificationItem,
  DutyPost,
  ScoreLedgerEntry,
  WeeklyDutyBrief
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_teacher_zhang',
    name: '张老师',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    role: 'duty_teacher',
    title: '值周教师 / 德育干事',
    school: '实验高级中学',
    campus: '中心校区',
    dutyZone: '知行楼二层及中庭'
  },
  {
    id: 'user_homeroom_wang',
    name: '王老师',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'homeroom_teacher',
    title: '班主任 / 语文教研组',
    school: '实验高级中学',
    campus: '中心校区',
    homeroomClassId: 'class_g1_1'
  },
  {
    id: 'user_admin_li',
    name: '李主任',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    title: '德育处主任 / 学校管理员',
    school: '实验高级中学',
    campus: '中心校区'
  }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'class_g1_1',
    grade: '高一年级',
    name: '高一(1)班',
    fullName: '高一年级 1班',
    homeroomTeacher: '王老师',
    studentCount: 48,
    currentScore: 96.5,
    lastWeekRank: 2,
    stars: 4
  },
  {
    id: 'class_g1_2',
    grade: '高一年级',
    name: '高一(2)班',
    fullName: '高一年级 2班',
    homeroomTeacher: '陈老师',
    studentCount: 46,
    currentScore: 99.0,
    lastWeekRank: 1,
    stars: 5
  },
  {
    id: 'class_g1_3',
    grade: '高一年级',
    name: '高一(3)班',
    fullName: '高一年级 3班',
    homeroomTeacher: '刘老师',
    studentCount: 47,
    currentScore: 94.0,
    lastWeekRank: 5,
    stars: 3
  },
  {
    id: 'class_g1_4',
    grade: '高一年级',
    name: '高一(4)班',
    fullName: '高一年级 4班',
    homeroomTeacher: '周老师',
    studentCount: 45,
    currentScore: 97.5,
    lastWeekRank: 3,
    stars: 4
  },
  {
    id: 'class_g2_1',
    grade: '高二年级',
    name: '高二(1)班',
    fullName: '高二年级 1班',
    homeroomTeacher: '赵老师',
    studentCount: 50,
    currentScore: 98.0,
    lastWeekRank: 2,
    stars: 5
  },
  {
    id: 'class_g2_2',
    grade: '高二年级',
    name: '高二(2)班',
    fullName: '高二年级 2班',
    homeroomTeacher: '孙老师',
    studentCount: 49,
    currentScore: 95.0,
    lastWeekRank: 4,
    stars: 4
  },
  {
    id: 'class_g3_1',
    grade: '高三年级',
    name: '高三(1)班',
    fullName: '高三年级 1班',
    homeroomTeacher: '吴老师',
    studentCount: 52,
    currentScore: 100.0,
    lastWeekRank: 1,
    stars: 5
  }
];

export const INITIAL_RULES: InspectRuleItem[] = [
  {
    id: 'rule_hyg_1',
    category: 'hygiene',
    categoryName: '环境卫生',
    title: '走廊包干区废纸杂物未清扫',
    defaultScore: -2,
    description: '班级门前走廊或公共卫生包干区有明显纸屑、落叶或包装袋未清理。',
    requiresAudit: true
  },
  {
    id: 'rule_hyg_2',
    category: 'hygiene',
    categoryName: '环境卫生',
    title: '教室桌椅未摆放整齐/讲台凌乱',
    defaultScore: -1,
    description: '放学后或大课间桌椅排列参差不齐，黑板未擦净，讲台教具杂乱。',
    requiresAudit: false
  },
  {
    id: 'rule_hyg_bonus',
    category: 'hygiene',
    categoryName: '环境卫生',
    title: '卫生死角彻底清扫 / 样板示范班',
    defaultScore: 2,
    description: '全校突击大检查中班级无任何死角，门窗明亮，获全优评价。',
    requiresAudit: true
  },
  {
    id: 'rule_disc_1',
    category: 'discipline',
    categoryName: '课间纪律',
    title: '课间楼道大声喧哗、追逐打闹',
    defaultScore: -2,
    description: '课间走廊及楼梯处有奔跑冲撞、高声喊叫或存在踩踏隐患的行为。',
    requiresAudit: true
  },
  {
    id: 'rule_disc_2',
    category: 'discipline',
    categoryName: '课间纪律',
    title: '自习课未按时安静/随意走动',
    defaultScore: -1,
    description: '晚自习或午自习铃响后3分钟内未进入静默学习状态。',
    requiresAudit: true
  },
  {
    id: 'rule_unif_1',
    category: 'uniform',
    categoryName: '仪表仪容',
    title: '早读未按规定着校服/未佩戴校徽',
    defaultScore: -1,
    description: '进校门及晨读期间部分同学未整齐穿校服或遗失校徽。',
    requiresAudit: false
  },
  {
    id: 'rule_exer_1',
    category: 'exercises',
    categoryName: '两操锻炼',
    title: '眼保健操闭眼不规范/做小动作',
    defaultScore: -1,
    description: '眼保健操期间有同学睁眼聊天或在走廊游荡。',
    requiresAudit: false
  },
  {
    id: 'rule_exer_bonus',
    category: 'exercises',
    categoryName: '两操锻炼',
    title: '大课间跑操队伍整齐、口号响亮',
    defaultScore: 1,
    description: '步伐整齐划一，精神面貌饱满，口号响亮有力。',
    requiresAudit: false
  },
  {
    id: 'rule_safe_bonus',
    category: 'safety',
    categoryName: '校园安全',
    title: '拾金不昧 / 乐于助人通报表扬',
    defaultScore: 2,
    description: '学生捡拾校园财物或主动帮助维护公共设施，弘扬正能量。',
    requiresAudit: true
  }
];

export const INITIAL_RECORDS: InspectionRecord[] = [
  {
    id: 'rec_20261008_01',
    classId: 'class_g1_1',
    className: '高一(1)班',
    grade: '高一年级',
    ruleId: 'rule_hyg_1',
    ruleCategory: 'hygiene',
    ruleTitle: '走廊包干区废纸杂物未清扫',
    score: -2,
    type: 'deduct',
    status: 'need_rectify',
    timeSlot: 'recess',
    timeSlotName: '大课间',
    zone: '知行楼二层北侧连廊',
    description: '第二节课下课后走廊饮水机旁有零食塑料袋及果皮，未及时安排值日生清扫。',
    photos: ['https://images.unsplash.com/photo-1584697964190-705b89368d40?w=600&auto=format&fit=crop&q=80'],
    inspectorId: 'user_teacher_zhang',
    inspectorName: '张老师',
    createdAt: '2026-10-08 10:15',
    rectificationId: 'rect_01',
    settlementWeek: 6
  },
  {
    id: 'rec_20261008_02',
    classId: 'class_g1_1',
    className: '高一(1)班',
    grade: '高一年级',
    ruleId: 'rule_unif_1',
    ruleCategory: 'uniform',
    ruleTitle: '早读未按规定着校服/未佩戴校徽',
    score: -1,
    type: 'deduct',
    status: 'active',
    timeSlot: 'morning',
    timeSlotName: '晨读巡查',
    zone: '教学楼A栋101教室',
    description: '晨读检查发现3位同学未穿制式校服外套，且未佩戴学生出入胸卡。',
    photos: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80'],
    inspectorId: 'user_teacher_zhang',
    inspectorName: '张老师',
    createdAt: '2026-10-08 07:45',
    appealId: 'appeal_01',
    settlementWeek: 6
  },
  {
    id: 'rec_20261008_03',
    classId: 'class_g1_3',
    className: '高一(3)班',
    grade: '高一年级',
    ruleId: 'rule_disc_1',
    ruleCategory: 'discipline',
    ruleTitle: '课间楼道大声喧哗、追逐打闹',
    score: -2,
    type: 'deduct',
    status: 'pending_audit',
    timeSlot: 'recess',
    timeSlotName: '上午眼操后',
    zone: '知行楼西侧阶梯',
    description: '多名男生在楼梯拐角处打闹嬉戏，存在安全隐患，已现场口头提醒劝止。',
    photos: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80'],
    inspectorId: 'user_teacher_zhang',
    inspectorName: '张老师',
    createdAt: '2026-10-08 11:20',
    settlementWeek: 6
  },
  {
    id: 'rec_20261008_04',
    classId: 'class_g1_2',
    className: '高一(2)班',
    grade: '高一年级',
    ruleId: 'rule_exer_bonus',
    ruleCategory: 'exercises',
    ruleTitle: '大课间跑操队伍整齐、口号响亮',
    score: 1,
    type: 'add',
    status: 'active',
    timeSlot: 'recess',
    timeSlotName: '大课间跑操',
    zone: '中心田径场北道',
    description: '全班出勤整齐，步伐一致，领操员口令标准有力，全场示范表现优异。',
    photos: ['https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80'],
    inspectorId: 'user_teacher_zhang',
    inspectorName: '张老师',
    createdAt: '2026-10-08 09:50',
    settlementWeek: 6
  },
  {
    id: 'rec_20261008_05',
    classId: 'class_g2_2',
    className: '高二(2)班',
    grade: '高二年级',
    ruleId: 'rule_hyg_2',
    ruleCategory: 'hygiene',
    ruleTitle: '教室桌椅未摆放整齐/讲台凌乱',
    score: -1,
    type: 'deduct',
    status: 'rejected',
    timeSlot: 'lunch',
    timeSlotName: '午间巡查',
    zone: '立德楼三层教室',
    description: '桌椅略有歪斜。',
    photos: [],
    inspectorId: 'user_teacher_zhang',
    inspectorName: '张老师',
    createdAt: '2026-10-07 13:00',
    auditRemark: '照片证据缺失且情节轻微，班级当时处于集体整理教具状态，建议现场提醒免扣。',
    auditorName: '李主任',
    auditedAt: '2026-10-07 14:10',
    settlementWeek: 6
  }
];

export const INITIAL_RECTIFICATIONS: RectificationTicket[] = [
  {
    id: 'rect_01',
    recordId: 'rec_20261008_01',
    classId: 'class_g1_1',
    className: '高一(1)班',
    issueTitle: '走廊包干区废纸杂物未清扫',
    dutyPerson: '王老师 (班主任)',
    deadline: '2026-10-08 17:30',
    status: 'pending',
    timeline: [
      {
        time: '2026-10-08 10:15',
        action: '巡查下发整改单',
        operator: '张老师 (值周教师)',
        note: '发现走廊纸屑杂物，要求限时在放学前彻底清理。'
      }
    ]
  }
];

export const INITIAL_APPEALS: AppealTicket[] = [
  {
    id: 'appeal_01',
    recordId: 'rec_20261008_02',
    classId: 'class_g1_1',
    className: '高一(1)班',
    appellantName: '王老师 (班主任)',
    reason: '该三位同学为今日代表学校参加区级朗诵比赛的文艺骨干，早读时间正在按校团委统一要求更换指定朗诵演出服装，并非无故不穿校服。有团委请假审批单佐证。',
    evidencePhotos: ['https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80'],
    status: 'pending',
    submittedAt: '2026-10-08 08:30'
  }
];

export const INITIAL_SHIFTS: DutyShift[] = [
  // --- 第4教学周 (2026-09-21 ~ 2026-09-25) ---
  {
    id: 'shift_w4_01',
    date: '2026-09-21',
    dayOfWeek: '周一',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '学校正大门入口',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_w4_02',
    date: '2026-09-21',
    dayOfWeek: '周一',
    timeSlot: '午间就餐与午休 (11:50-13:30)',
    zone: '学生第一食堂二楼',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'completed'
  },
  {
    id: 'shift_w4_03',
    date: '2026-09-22',
    dayOfWeek: '周二',
    timeSlot: '大课间与眼保健操 (09:40-10:20)',
    zone: '知行楼二层及中庭',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'completed'
  },
  {
    id: 'shift_w4_04',
    date: '2026-09-23',
    dayOfWeek: '周三',
    timeSlot: '放学及包干区清扫 (17:20-18:00)',
    zone: '知行楼二层及中庭',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_w4_05',
    date: '2026-09-24',
    dayOfWeek: '周四',
    timeSlot: '午间就餐与午休 (11:50-13:30)',
    zone: '学生第二食堂',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'completed'
  },
  {
    id: 'shift_w4_06',
    date: '2026-09-25',
    dayOfWeek: '周五',
    timeSlot: '晚自习与就寝秩序 (21:30-22:30)',
    zone: '学生公寓通道',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },

  // --- 第5教学周 (2026-09-28 ~ 2026-10-02) ---
  {
    id: 'shift_w5_01',
    date: '2026-09-28',
    dayOfWeek: '周一',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '学校正大门入口',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'completed'
  },
  {
    id: 'shift_w5_02',
    date: '2026-09-28',
    dayOfWeek: '周一',
    timeSlot: '大课间与眼保健操 (09:40-10:20)',
    zone: '知行楼二层及中庭',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_w5_03',
    date: '2026-09-29',
    dayOfWeek: '周二',
    timeSlot: '午间就餐与午休 (11:50-13:30)',
    zone: '学生第一食堂',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_w5_04',
    date: '2026-09-30',
    dayOfWeek: '周三',
    timeSlot: '放学及包干区清扫 (17:20-18:00)',
    zone: '北侧连廊及走廊',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'completed'
  },
  {
    id: 'shift_w5_05',
    date: '2026-10-01',
    dayOfWeek: '周四',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '假期校园主干道',
    teacherId: 'user_admin_li',
    teacherName: '李主任',
    status: 'completed'
  },
  {
    id: 'shift_w5_06',
    date: '2026-10-02',
    dayOfWeek: '周五',
    timeSlot: '早晨进校岗 (07:20-08:00)',
    zone: '知行楼一层大厅',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'completed'
  },

  // --- 第6教学周 (2026-10-05 ~ 2026-10-09 当前周) ---
  {
    id: 'shift_01_w6_mon_1',
    date: '2026-10-05',
    dayOfWeek: '周一',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '学校正大门入口',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_01_w6_mon_2',
    date: '2026-10-05',
    dayOfWeek: '周一',
    timeSlot: '午间就餐与午休 (11:50-13:30)',
    zone: '学生第一食堂二楼',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'completed'
  },
  {
    id: 'shift_02_w6_tue_1',
    date: '2026-10-06',
    dayOfWeek: '周二',
    timeSlot: '大课间与眼保健操 (09:40-10:20)',
    zone: '知行楼二层及中庭',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'completed'
  },
  {
    id: 'shift_02_w6_tue_2',
    date: '2026-10-06',
    dayOfWeek: '周二',
    timeSlot: '放学及包干区清扫 (17:20-18:00)',
    zone: '知行楼1-3层走廊',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_03_w6_wed_1',
    date: '2026-10-07',
    dayOfWeek: '周三',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '东门副通道',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'completed'
  },
  {
    id: 'shift_03_w6_wed_2',
    date: '2026-10-07',
    dayOfWeek: '周三',
    timeSlot: '午间就餐与午休 (11:50-13:30)',
    zone: '学生第一食堂二楼',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_01',
    date: '2026-10-08',
    dayOfWeek: '周四',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '学校正大门入口',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_02',
    date: '2026-10-08',
    dayOfWeek: '周四',
    timeSlot: '大课间与眼保健操 (09:40-10:20)',
    zone: '知行楼二层及中庭',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'completed'
  },
  {
    id: 'shift_03',
    date: '2026-10-08',
    dayOfWeek: '周四',
    timeSlot: '午间就餐与午休 (11:50-13:30)',
    zone: '学生第一食堂二楼',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'in_progress'
  },
  {
    id: 'shift_04',
    date: '2026-10-08',
    dayOfWeek: '周四',
    timeSlot: '放学及包干区清扫 (17:20-18:00)',
    zone: '知行楼二层及中庭',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending'
  },
  {
    id: 'shift_06',
    date: '2026-10-08',
    dayOfWeek: '周四',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '东门副通道',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'completed'
  },
  {
    id: 'shift_07',
    date: '2026-10-08',
    dayOfWeek: '周四',
    timeSlot: '晚自习与就寝秩序 (21:30-22:30)',
    zone: '学生男/女公寓楼通道',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'pending'
  },
  {
    id: 'shift_05',
    date: '2026-10-09',
    dayOfWeek: '周五',
    timeSlot: '早晨进校岗 (07:20-08:00)',
    zone: '知行楼一层大厅',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending',
    hasConflict: true,
    conflictReason: '周五07:40有语文高一年级组集体备课研讨会',
    absenceReason: '参加语文高一年级组集体备课研讨会，无法到岗',
    absenceReportedBy: '张老师'
  },
  {
    id: 'shift_05_w6_fri_2',
    date: '2026-10-09',
    dayOfWeek: '周五',
    timeSlot: '大课间与眼保健操 (09:40-10:20)',
    zone: '知行楼二层走廊',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'pending'
  },
  {
    id: 'shift_05_w6_fri_3',
    date: '2026-10-09',
    dayOfWeek: '周五',
    timeSlot: '放学及包干区清扫 (17:20-18:00)',
    zone: '校门前广场及接送区',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending',
    checkInAt: '2026-10-09 17:22'
  },
  {
    id: 'shift_06_w6_sat_1',
    date: '2026-10-10',
    dayOfWeek: '周六',
    timeSlot: '周末自习与课后托管巡查 (09:00-11:30)',
    zone: '知行楼一楼报告厅及自习室',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'pending'
  },
  {
    id: 'shift_06_w6_sat_2',
    date: '2026-10-10',
    dayOfWeek: '周六',
    timeSlot: '周末校园安全及活动巡防 (15:00-17:30)',
    zone: '田径运动场及生活区',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending'
  },
  {
    id: 'shift_06_w6_sun_1',
    date: '2026-10-11',
    dayOfWeek: '周日',
    timeSlot: '周日寄宿生返校及校门秩序 (17:30-19:00)',
    zone: '学校正大门及接送缓冲区',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending'
  },
  {
    id: 'shift_06_w6_sun_2',
    date: '2026-10-11',
    dayOfWeek: '周日',
    timeSlot: '晚自习与就寝秩序 (21:30-22:30)',
    zone: '学生公寓楼连廊及门禁',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'pending'
  },

  // --- 第7教学周 (2026-10-12 ~ 2026-10-18 下周) ---
  {
    id: 'shift_w7_01',
    date: '2026-10-12',
    dayOfWeek: '周一',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '学校正大门入口',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending'
  },
  {
    id: 'shift_w7_02',
    date: '2026-10-12',
    dayOfWeek: '周一',
    timeSlot: '午间就餐与午休 (11:50-13:30)',
    zone: '学生第一食堂',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'pending'
  },
  {
    id: 'shift_w7_03',
    date: '2026-10-13',
    dayOfWeek: '周二',
    timeSlot: '大课间与眼保健操 (09:40-10:20)',
    zone: '知行楼二层及中庭',
    teacherId: 'teacher_chen',
    teacherName: '陈老师',
    status: 'pending'
  },
  {
    id: 'shift_w7_04',
    date: '2026-10-14',
    dayOfWeek: '周三',
    timeSlot: '放学及包干区清扫 (17:20-18:00)',
    zone: '知行楼1-3层走廊',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending'
  },
  {
    id: 'shift_w7_05',
    date: '2026-10-15',
    dayOfWeek: '周四',
    timeSlot: '晨门礼仪巡查 (07:20-08:00)',
    zone: '东门副通道',
    teacherId: 'teacher_liu',
    teacherName: '刘老师',
    status: 'pending'
  },
  {
    id: 'shift_w7_06',
    date: '2026-10-16',
    dayOfWeek: '周五',
    timeSlot: '放学及包干区清扫 (17:20-18:00)',
    zone: '学校主校道',
    teacherId: 'user_teacher_zhang',
    teacherName: '张老师',
    status: 'pending'
  }
];

export const INITIAL_SETTLEMENT: SettlementWeekData = {
  weekNumber: 6,
  startDate: '2026-10-05',
  endDate: '2026-10-11',
  status: 'preview',
  totalInspections: 5,
  pendingAuditCount: 1,
  pendingAppealCount: 1,
  rankings: [
    {
      classId: 'class_g1_2',
      className: '高一(2)班',
      grade: '高一年级',
      baseScore: 100,
      addScore: 2,
      deductScore: -3,
      finalScore: 99.0,
      rank: 1,
      isHonorClass: true
    },
    {
      classId: 'class_g1_4',
      className: '高一(4)班',
      grade: '高一年级',
      baseScore: 100,
      addScore: 1,
      deductScore: -3.5,
      finalScore: 97.5,
      rank: 2,
      isHonorClass: true
    },
    {
      classId: 'class_g1_1',
      className: '高一(1)班',
      grade: '高一年级',
      baseScore: 100,
      addScore: 0.5,
      deductScore: -4,
      finalScore: 96.5,
      rank: 3,
      isHonorClass: false
    },
    {
      classId: 'class_g1_3',
      className: '高一(3)班',
      grade: '高一年级',
      baseScore: 100,
      addScore: 0,
      deductScore: -6,
      finalScore: 94.0,
      rank: 4,
      isHonorClass: false
    }
  ]
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: '新的整改工单待办理',
    content: '您的班级收到走廊废纸杂物未清扫整改通知，请在今日17:30前组织打扫并上传整改反馈照片。',
    type: 'rectify',
    targetRole: 'homeroom_teacher',
    targetClassId: 'class_g1_1',
    read: false,
    createdAt: '2026-10-08 10:16',
    relatedRecordId: 'rec_20261008_01'
  },
  {
    id: 'notif_02',
    title: '待审核检查提醒',
    content: '值周教师张老师提交了高一(3)班课间纪律扣分记录，分值 -2 分，等待管理员审核。',
    type: 'audit',
    targetRole: 'admin',
    read: false,
    createdAt: '2026-10-08 11:21',
    relatedRecordId: 'rec_20261008_03'
  },
  {
    id: 'notif_03',
    title: '扣分申诉待复核',
    content: '高一(1)班班主任王老师对早读校服扣分发起了申诉，请德育处进入审批中心仲裁处理。',
    type: 'appeal',
    targetRole: 'admin',
    read: false,
    createdAt: '2026-10-08 08:35',
    relatedRecordId: 'rec_20261008_02'
  },
  {
    id: 'notif_04',
    title: '第5周值周常规成绩已正式发布',
    content: '上周全校常规管理流动红旗评比结果已发布，高一(2)班与高二(1)班获评文明优胜班集体。',
    type: 'publish',
    targetRole: 'all',
    read: true,
    createdAt: '2026-10-05 08:00'
  }
];

export const INITIAL_DUTY_POSTS: DutyPost[] = [
  {
    id: 'post_01',
    name: '校门礼仪巡查岗',
    location: '学校正大门入口及求真广场',
    campus: '中心校区',
    targetScope: '全校各年级',
    timeSlots: ['晨门礼仪巡查 (07:20-08:00)', '放学及包干区清扫 (17:20-18:00)'],
    primaryCategories: ['uniform', 'safety'],
    defaultTeacherId: 'user_teacher_zhang',
    defaultTeacherName: '张老师',
    requirements: '巡查学生入校是否穿制式校服、佩戴出入胸卡；制止携带校外违禁零食外卖；维护校门落客区交通安全秩序。',
    checklist: ['校服与胸卡佩戴', '严禁校外外卖入校', '上下学高峰交通安全'],
    priority: 'high',
    isActive: true,
    createdAt: '2026-09-01'
  },
  {
    id: 'post_02',
    name: '知行楼二层及中庭岗',
    location: '知行楼1-3层走廊、北侧连廊及卫生间周边',
    campus: '中心校区',
    targetScope: '高一年级各班级',
    timeSlots: ['大课间与眼保健操 (09:40-10:20)', '午间就餐与午休 (11:50-13:30)'],
    primaryCategories: ['hygiene', 'discipline', 'exercises'],
    defaultTeacherId: 'user_teacher_zhang',
    defaultTeacherName: '张老师',
    requirements: '监督大课间眼操规范率；巡查课间走廊是否存在奔跑打闹、高空抛物；检查走廊公共包干区饮水机周边纸屑杂物清扫情况。',
    checklist: ['大课间眼操规范率', '走廊杜绝追逐打闹', '公共包干区保洁'],
    priority: 'high',
    isActive: true,
    createdAt: '2026-09-01'
  },
  {
    id: 'post_03',
    name: '学生第一食堂秩序岗',
    location: '学生第一食堂一二层就餐区及餐盘回收处',
    campus: '中心校区',
    targetScope: '全校师生',
    timeSlots: ['午间就餐与午休 (11:50-13:30)'],
    primaryCategories: ['hygiene', 'discipline'],
    defaultTeacherId: 'teacher_chen',
    defaultTeacherName: '陈老师',
    requirements: '督导排队打饭间距与文明就餐礼仪；检查餐盘残渣分类倾倒及光盘行动落实；防范地面油污湿滑跌倒隐患。',
    checklist: ['排队打饭秩序', '光盘行动与残渣倾倒', '食堂地面防滑安全'],
    priority: 'medium',
    isActive: true,
    createdAt: '2026-09-01'
  },
  {
    id: 'post_04',
    name: '中心田径场大课间岗',
    location: '中心田径场塑胶跑道及看台',
    campus: '中心校区',
    targetScope: '高一、高二各班级',
    timeSlots: ['大课间与眼保健操 (09:40-10:20)'],
    primaryCategories: ['exercises', 'discipline'],
    defaultTeacherId: 'teacher_liu',
    defaultTeacherName: '刘老师',
    requirements: '监督大课间全员跑操队伍集合速度、步伐整齐度与精神风貌；检查领操员及跟跑班主任到岗情况。',
    checklist: ['跑操集合与队列步伐', '班级口号精神风貌', '班主任跟跑考勤'],
    priority: 'medium',
    isActive: true,
    createdAt: '2026-09-01'
  },
  {
    id: 'post_05',
    name: '学生公寓楼道巡查岗',
    location: '学生宿舍1-4号楼通道及门厅',
    campus: '中心校区',
    targetScope: '住宿生各班级',
    timeSlots: ['晚自习与就寝秩序 (21:30-22:30)'],
    primaryCategories: ['dormitory', 'safety'],
    defaultTeacherId: 'teacher_liu',
    defaultTeacherName: '刘老师',
    requirements: '巡查熄灯后就寝纪律；禁止私拉乱接电线及违规用电；排查安全出口通道畅通情况。',
    checklist: ['熄灯与就寝纪律', '宿舍用电与防火安全', '夜间宿舍出入登记'],
    priority: 'normal',
    isActive: true,
    createdAt: '2026-09-01'
  }
];

// 值周任务书（第6教学周）
export const INITIAL_WEEKLY_BRIEF: WeeklyDutyBrief = {
  weekNumber: 6,
  leadTeacherId: 'user_teacher_zhang',
  leadTeacherName: '张老师',
  memberIds: ['user_teacher_zhang', 'teacher_chen', 'teacher_liu'],
  handoverNote: '本周重点：10/09 周五晨门岗因张老师参加高一语文集体备课，需安排代岗；周末自习托管与周日返校秩序岗为新增任务，请按时到岗并做好巡查记录。上周边角卫生问题反弹，本周放学清扫时段需加密巡查知行楼连廊饮水处。',
  status: 'draft'
};

// 期初流水（轧差建账）：保证每班 100 + Σ(delta) === currentScore
export const INITIAL_LEDGER: ScoreLedgerEntry[] = [
  {
    id: 'led_open_g1_1',
    classId: 'class_g1_1',
    action: 'opening',
    delta: -3.5,
    scoreBefore: 100,
    scoreAfter: 96.5,
    operatorName: '系统建账',
    createdAt: '2026-10-05 08:00',
    note: '第6教学周期初轧差建账'
  },
  {
    id: 'led_open_g1_2',
    classId: 'class_g1_2',
    action: 'opening',
    delta: -1,
    scoreBefore: 100,
    scoreAfter: 99,
    operatorName: '系统建账',
    createdAt: '2026-10-05 08:00',
    note: '第6教学周期初轧差建账'
  },
  {
    id: 'led_open_g1_3',
    classId: 'class_g1_3',
    action: 'opening',
    delta: -6,
    scoreBefore: 100,
    scoreAfter: 94,
    operatorName: '系统建账',
    createdAt: '2026-10-05 08:00',
    note: '第6教学周期初轧差建账'
  },
  {
    id: 'led_open_g1_4',
    classId: 'class_g1_4',
    action: 'opening',
    delta: -2.5,
    scoreBefore: 100,
    scoreAfter: 97.5,
    operatorName: '系统建账',
    createdAt: '2026-10-05 08:00',
    note: '第6教学周期初轧差建账'
  },
  {
    id: 'led_open_g2_1',
    classId: 'class_g2_1',
    action: 'opening',
    delta: -2,
    scoreBefore: 100,
    scoreAfter: 98,
    operatorName: '系统建账',
    createdAt: '2026-10-05 08:00',
    note: '第6教学周期初轧差建账'
  },
  {
    id: 'led_open_g2_2',
    classId: 'class_g2_2',
    action: 'opening',
    delta: -5,
    scoreBefore: 100,
    scoreAfter: 95,
    operatorName: '系统建账',
    createdAt: '2026-10-05 08:00',
    note: '第6教学周期初轧差建账'
  },
  {
    id: 'led_open_g3_1',
    classId: 'class_g3_1',
    action: 'opening',
    delta: 0,
    scoreBefore: 100,
    scoreAfter: 100,
    operatorName: '系统建账',
    createdAt: '2026-10-05 08:00',
    note: '第6教学周期初轧差建账'
  }
];
