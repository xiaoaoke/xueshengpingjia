import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Clock, 
  User, 
  Sparkles, 
  SlidersHorizontal, 
  AlertCircle,
  Building,
  Layers,
  ChevronDown,
  Copy,
  X,
  Check
} from 'lucide-react';
import { DutyPost, InspectCategory } from '../../types';

const CLOCK_TIMES = Array.from({ length: ((22 * 60 + 30) - 7 * 60) / 10 + 1 }, (_, i) => {
  const mins = 7 * 60 + i * 10;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
});

const splitSlot = (slot: string) => {
  const matched = slot.match(/^(.*)\(([^)]*)\)\s*$/);
  if (!matched) return { label: slot.trim(), start: '', end: '' };
  const [start = '', end = ''] = matched[2].split('-').map((part) => part.trim());
  return { label: matched[1].trim(), start, end };
};

const joinSlot = (label: string, start: string, end: string) => {
  const name = label.trim();
  if (!name || !start || !end || start >= end) return '';
  return `${name} (${start}-${end})`;
};

const clockOptions = (current: string) => (
  current && !CLOCK_TIMES.includes(current) ? [current, ...CLOCK_TIMES] : CLOCK_TIMES
);

export const DutyPostManager: React.FC = () => {
  const { 
    dutyPosts, 
    addDutyPost, 
    updateDutyPost, 
    deleteDutyPost, 
    toggleDutyPostActive, 
    allUsers, 
    currentCampus, 
    showToast,
    dutyTimeSlots,
    assessmentCategories,
    addTimeSlot,
    removeTimeSlot,
    renameTimeSlot,
    addCategory,
    removeCategory,
    renameCategory
  } = useDuty();

  // Re-added with dynamic compatibility
  const PRESET_TEMPLATES: Omit<DutyPost, 'id' | 'createdAt'>[] = [
    {
      name: '校门礼仪与安全示范岗',
      location: '学校正大门主通道、求真广场及接送缓冲区',
      campus: '中心校区',
      targetScope: '全校各年级',
      timeSlots: [dutyTimeSlots[0] || '晨门礼仪巡查'],
      primaryCategories: [(assessmentCategories[0]?.id || 'hygiene') as InspectCategory],
      defaultTeacherId: 'user_teacher_zhang',
      defaultTeacherName: '张老师',
      requirements: '督查校服着装，严禁校外食品，维护秩序。',
      checklist: ['检查校服着装规范', '校徽佩戴', '严禁携带校外食品', '维护交通秩序'],
      priority: 'high',
      isActive: true
    },
    // ... other templates would follow similar dynamic mapping
  ];


  const [searchQuery, setSearchQuery] = useState('');
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [campus, setCampus] = useState(currentCampus);
  const [targetScope, setTargetScope] = useState('全校各年级');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([dutyTimeSlots[0]]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([assessmentCategories[0]?.id || 'hygiene']);
  const [assignedTeacherId, setAssignedTeacherId] = useState(allUsers[0]?.id || '');
  const [requirements, setRequirements] = useState('');
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'normal'>('high');
  const [isActive, setIsActive] = useState(true);
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Filter list
  const filteredPosts = dutyPosts.filter((post) => {
    if (filterCampus !== 'all' && post.campus !== filterCampus) return false;
    if (filterStatus === 'active' && !post.isActive) return false;
    if (filterStatus === 'inactive' && post.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        post.name.toLowerCase().includes(q) ||
        post.location.toLowerCase().includes(q) ||
        (post.defaultTeacherName && post.defaultTeacherName.toLowerCase().includes(q)) ||
        post.requirements.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingPostId(null);
    setName('');
    setLocation('');
    setCampus(currentCampus);
    setTargetScope('全校各年级');
    setSelectedTimeSlots([dutyTimeSlots[0]]);
    setSelectedCategories([assessmentCategories[0]?.id]);
    setAssignedTeacherId(allUsers[0]?.id || '');
    setRequirements('');
    setChecklist([]);
    setNewChecklistItem('');
    setPriority('high');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: DutyPost) => {
    setEditingPostId(post.id);
    setName(post.name);
    setLocation(post.location);
    setCampus(post.campus);
    setTargetScope(post.targetScope);
    setSelectedTimeSlots(post.timeSlots);
    setSelectedCategories(post.primaryCategories);
    setAssignedTeacherId(post.defaultTeacherId || allUsers[0]?.id || '');
    setRequirements(post.requirements);
    setChecklist(post.checklist || []);
    setNewChecklistItem('');
    setPriority(post.priority);
    setIsActive(post.isActive);
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setName(tpl.name);
    setLocation(tpl.location);
    setCampus(tpl.campus);
    setTargetScope(tpl.targetScope);
    setSelectedTimeSlots(tpl.timeSlots);
    setSelectedCategories(tpl.primaryCategories);
    setAssignedTeacherId(tpl.defaultTeacherId || allUsers[0]?.id || '');
    setRequirements(tpl.requirements);
    setChecklist(tpl.checklist || []);
    setNewChecklistItem('');
    setPriority(tpl.priority);
    showToast(`已套用【${tpl.name}】标准模板参数`, 'info');
  };

  const handleSavePost = () => {
    if (!name.trim()) {
      showToast('请输入巡查岗位名称', 'warning');
      return;
    }
    if (!location.trim()) {
      showToast('请输入具体巡查区域或地点', 'warning');
      return;
    }

    const teacher = allUsers.find((u) => u.id === assignedTeacherId);

    const postPayload: Omit<DutyPost, 'id'> = {
      name: name.trim(),
      location: location.trim(),
      campus,
      targetScope: targetScope.trim() || '全校各年级',
      timeSlots: selectedTimeSlots.length > 0 ? selectedTimeSlots : [dutyTimeSlots[0]],
      primaryCategories: selectedCategories.length > 0 ? selectedCategories : [assessmentCategories[0]?.id || 'hygiene'],
      defaultTeacherId: assignedTeacherId,
      defaultTeacherName: teacher?.name || '巡查教师',
      requirements: requirements.trim() || '如实巡查，遵章执勤，发现违规及时提醒录入并留存照片证据。',
      checklist: checklist,
      priority,
      isActive
    };

    if (editingPostId) {
      updateDutyPost(editingPostId, postPayload);
    } else {
      addDutyPost(postPayload);
    }

    setIsModalOpen(false);
  };

  const toggleTimeSlot = (slot: string) => {
    if (selectedTimeSlots.includes(slot)) {
      if (selectedTimeSlots.length === 1) return; // Keep at least one
      setSelectedTimeSlots(selectedTimeSlots.filter((s) => s !== slot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return;
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleAddTimeSlot = () => {
    if (!newSlotLabel.trim() || !newSlotStart || !newSlotEnd) {
      showToast('请填写名称，并选择开始和结束时间', 'warning');
      return;
    }
    if (newSlotStart >= newSlotEnd) {
      showToast('结束时间要晚于开始时间', 'warning');
      return;
    }
    const slot = joinSlot(newSlotLabel, newSlotStart, newSlotEnd);
    if (dutyTimeSlots.includes(slot)) {
      showToast('该巡查时段已存在', 'warning');
      return;
    }
    addTimeSlot(slot);
    setSelectedTimeSlots((prev) => (prev.includes(slot) ? prev : [...prev, slot]));
    setNewSlotLabel('');
    setNewSlotStart('');
    setNewSlotEnd('');
  };

  const commitSlotParts = (from: string, label: string, start: string, end: string) => {
    if (!label.trim() || !start || !end) {
      showToast('请填写名称，并选择开始和结束时间', 'warning');
      return false;
    }
    if (start >= end) {
      showToast('结束时间要晚于开始时间', 'warning');
      return false;
    }
    return commitTimeSlot(from, `${label.trim()} (${start}-${end})`);
  };

  const handleRemoveTimeSlot = (slot: string) => {
    if (dutyTimeSlots.length <= 1) {
      showToast('至少保留一个巡查时段', 'warning');
      return;
    }
    removeTimeSlot(slot);
    setSelectedTimeSlots((prev) => {
      const next = prev.filter((s) => s !== slot);
      if (next.length > 0) return next;
      const fallback = dutyTimeSlots.find((s) => s !== slot);
      return fallback ? [fallback] : [];
    });
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (assessmentCategories.some((c) => c.name === name)) {
      showToast('该考核维度已存在', 'warning');
      return;
    }
    const id = `cat_${Date.now()}`;
    addCategory(id, name);
    setSelectedCategories((prev) => [...prev, id]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (catId: string) => {
    if (assessmentCategories.length <= 1) {
      showToast('至少保留一个考核维度', 'warning');
      return;
    }
    removeCategory(catId);
    setSelectedCategories((prev) => {
      const next = prev.filter((c) => c !== catId);
      if (next.length > 0) return next;
      const fallback = assessmentCategories.find((c) => c.id !== catId);
      return fallback ? [fallback.id] : [];
    });
  };

  const commitTimeSlot = (from: string, raw: string) => {
    const next = raw.trim();
    if (!next) return false;
    if (next === from) return true;
    if (dutyTimeSlots.some((s) => s !== from && s === next)) {
      showToast('该巡查时段已存在', 'warning');
      return false;
    }
    renameTimeSlot(from, next);
    setSelectedTimeSlots((prev) => prev.map((s) => (s === from ? next : s)));
    return true;
  };

  const commitCategory = (id: string, currentName: string, raw: string) => {
    const next = raw.trim();
    if (!next) return false;
    if (next === currentName) return true;
    if (assessmentCategories.some((c) => c.id !== id && c.name === next)) {
      showToast('该考核维度已存在', 'warning');
      return false;
    }
    renameCategory(id, next);
    return true;
  };

  const getCategoryName = (id: string) => assessmentCategories.find(c => c.id === id)?.name || id;

  // Inside render:
  // Post List Cards Requirement & Checklist:
  // {post.primaryCategories.map((c, i) => (
  //   <span key={i} className="text-blue-700 font-medium">
  //     #{getCategoryName(c)}
  //   </span>
  // ))}

  // Modal Fields:
  // {dutyTimeSlots.map((slot) => { ...
  // {(assessmentCategories).map((cat) => { ...
  // {getCategoryName(cat.id)}

  return (
    <div className="space-y-3.5">
      {/* Title & Add Action Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>校园巡查岗位设置 ({dutyPosts.length}个)</span>
          </h3>
          <p className="text-[11px] text-slate-500">统一配置执勤岗位、责任区域、考核重点与排班联动标准</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="shrink-0 whitespace-nowrap px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>录入新岗位</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索岗位/地点/责任人..."
            className="w-full h-8 pl-7 pr-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filterCampus}
          onChange={(e) => setFilterCampus(e.target.value)}
          className="h-8 px-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">全部校区</option>
          <option value="中心校区">中心校区</option>
          <option value="城东校区">城东校区</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="h-8 px-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">全部状态</option>
          <option value="active">已启用 ({dutyPosts.filter(p => p.isActive).length})</option>
          <option value="inactive">已停用 ({dutyPosts.filter(p => !p.isActive).length})</option>
        </select>
      </div>

      {/* Post List Cards */}
      <div className="space-y-2.5">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-700">暂无符合条件的巡查岗位</div>
            <p className="text-[11px] text-slate-400">点击上方按钮录入新岗位或从模板库导入</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                post.isActive 
                  ? 'bg-white border-slate-200 shadow-2xs hover:border-blue-300' 
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              {/* Top Row: Name, Priority, Active Toggle */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {post.name}
                    </span>
                    {post.priority === 'high' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold shrink-0">
                        核心重点岗
                      </span>
                    )}
                    {post.priority === 'medium' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium shrink-0">
                        常规重点岗
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{post.location}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 shrink-0 text-[11px]">{post.campus}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleDutyPostActive(post.id)}
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                      post.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {post.isActive ? '已启用' : '已停用'}
                  </button>
                </div>
              </div>

              {/* Time slots and Scope */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">考评范围：</span>
                <span className="font-medium text-slate-700">{post.targetScope}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">默认责任人：</span>
                <span className="font-semibold text-slate-900">{post.defaultTeacherName || '未指定'}</span>
              </div>

              {/* Time Slots Chips */}
              <div className="flex flex-wrap gap-1">
                {post.timeSlots.map((ts, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono"
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{ts}</span>
                  </span>
                ))}
              </div>

              {/* Requirements & Checklist */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                <div className="flex items-center gap-1 text-slate-500 font-semibold">
                  <span>关注考评：</span>
                  <div className="flex gap-1">
                    {post.primaryCategories.map((catId, i) => (
                      <span key={i} className="text-blue-700 font-medium">
                        #{getCategoryName(catId)}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {post.requirements}
                </p>
                {post.checklist && post.checklist.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200">
                    <p className="text-slate-500 font-semibold mb-1">检查要点：</p>
                    <div className="flex flex-wrap gap-1">
                      {post.checklist.map((item, i) => (
                        <span key={i} className="inline-block px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-[10px] text-slate-400">
                  录入时间：{post.createdAt || '2026-09-01'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(post)}
                    className="p-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 flex items-center gap-0.5 cursor-pointer text-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={() => deleteDutyPost(post.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-0.5 cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add or Edit Duty Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPostId ? '编辑巡查岗位参数' : '录入新校园巡查岗位'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
              >
                取消
              </button>
            </div>

            {/* Template Quick Load Bar (Only for new post) */}
            {!editingPostId && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>快捷套用标准岗位模板</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-normal">点击一键载入</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      {tpl.name.slice(0, 6)}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              {/* Post Name */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  巡查岗位名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：知行楼二层及中庭岗、校门礼仪巡查岗"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Location & Campus */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    所属校区
                  </label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <option value="中心校区">中心校区 (高中部)</option>
                    <option value="城东校区">城东校区 (初中部)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    岗位重点等级
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <option value="high">核心重点 (高频巡查)</option>
                    <option value="medium">常规重点 (常态巡查)</option>
                    <option value="normal">普通巡查 (基础巡查)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Location */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  具体巡查地点与责任区 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="如：知行楼1-3层走廊、北侧连廊及卫生间周边"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Target Scope & Assigned Teacher */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    考评对象/学段
                  </label>
                  <input
                    type="text"
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value)}
                    placeholder="如：高一年级各班级"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    默认责任教师
                  </label>
                  <select
                    value={assignedTeacherId}
                    onChange={(e) => setAssignedTeacherId(e.target.value)}
                    className="w-full h-10 px-2 rounded-xl border border-slate-200 bg-slate-50 text-xs truncate"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role === 'duty_teacher' ? '值周' : u.role === 'homeroom_teacher' ? '班主任' : '管理'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots Multi-select (重构自适应两层卡片) */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  重点巡查时段 (点击以切换)
                </label>
                <div className="space-y-2">
                  {dutyTimeSlots.map((slot) => {
                    const parts = splitSlot(slot);
                    const isChecked = selectedTimeSlots.includes(slot);
                    const saveRow = (row: HTMLElement, patch?: { start?: string; end?: string }) => {
                      const labelEl = row.querySelector<HTMLInputElement>('input[data-part="label"]');
                      const startEl = row.querySelector<HTMLSelectElement>('select[data-part="start"]');
                      const endEl = row.querySelector<HTMLSelectElement>('select[data-part="end"]');
                      if (!labelEl || !startEl || !endEl) return;
                      const start = patch?.start ?? startEl.value;
                      const end = patch?.end ?? endEl.value;
                      if (!commitSlotParts(slot, labelEl.value, start, end)) {
                        labelEl.value = parts.label;
                        startEl.value = parts.start;
                        endEl.value = parts.end;
                      }
                    };
                    return (
                      <div
                        key={slot}
                        data-slot-card
                        className={`p-2.5 rounded-xl border transition-all ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/70 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {/* Row 1: Checkbox + Name + Delete button */}
                        <div className="flex items-center justify-between gap-2">
                          <div 
                            onClick={() => toggleTimeSlot(slot)}
                            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                          >
                            <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isChecked ? 'bg-blue-600 text-white' : 'border-2 border-slate-300'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <input
                              key={`${slot}-label`}
                              data-part="label"
                              defaultValue={parts.label}
                              placeholder="时段名称"
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                const row = e.currentTarget.closest<HTMLElement>('[data-slot-card]');
                                if (!row) return;
                                saveRow(row);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              className={`bg-transparent outline-none text-xs font-semibold flex-1 min-w-0 ${
                                isChecked ? 'text-blue-900 font-bold' : 'text-slate-800'
                              }`}
                            />
                          </div>

                          <button
                            type="button"
                            data-slot-action="delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTimeSlot(slot);
                            }}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="删除此时段"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Row 2: Clock time range selection */}
                        <div className="flex items-center gap-1.5 pt-2 mt-1.5 border-t border-slate-200/50 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="shrink-0 text-slate-400">时间:</span>
                          <select
                            data-part="start"
                            value={parts.start}
                            onChange={(e) => {
                              const row = e.currentTarget.closest<HTMLElement>('[data-slot-card]');
                              if (!row) return;
                              saveRow(row, { start: e.target.value });
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-[11px] cursor-pointer outline-none focus:border-blue-500"
                          >
                            {clockOptions(parts.start).map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-slate-400">至</span>
                          <select
                            data-part="end"
                            value={parts.end}
                            onChange={(e) => {
                              const row = e.currentTarget.closest<HTMLElement>('[data-slot-card]');
                              if (!row) return;
                              saveRow(row, { end: e.target.value });
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-[11px] cursor-pointer outline-none focus:border-blue-500"
                          >
                            {clockOptions(parts.end).map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add new time slot sub-card */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 mt-2.5">
                  <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Plus className="w-3 h-3 text-blue-600" />
                    <span>新增巡查时段</span>
                  </div>
                  <input
                    type="text"
                    value={newSlotLabel}
                    onChange={(e) => setNewSlotLabel(e.target.value)}
                    placeholder="输入时段名称，如：早自习巡查"
                    className="w-full h-8.5 px-3 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newSlotStart}
                      onChange={(e) => setNewSlotStart(e.target.value)}
                      className="flex-1 h-8.5 px-2 rounded-lg border border-slate-200 bg-white text-[11px] font-mono cursor-pointer"
                    >
                      <option value="">开始时间</option>
                      {CLOCK_TIMES.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 text-xs">至</span>
                    <select
                      value={newSlotEnd}
                      onChange={(e) => setNewSlotEnd(e.target.value)}
                      className="flex-1 h-8.5 px-2 rounded-lg border border-slate-200 bg-white text-[11px] font-mono cursor-pointer"
                    >
                      <option value="">结束时间</option>
                      {CLOCK_TIMES.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddTimeSlot}
                      className="px-3.5 h-8.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
                    >
                      添加时段
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Categories Multi-select (重构自适应卡片) */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  岗位重点考核维度 (点击以切换)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {assessmentCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          key={`${cat.id}-${cat.name}`}
                          defaultValue={cat.name}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => {
                            if (!commitCategory(cat.id, cat.name, e.target.value)) e.target.value = cat.name;
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                          className={`w-full min-w-0 bg-transparent text-xs outline-none ${
                            isChecked ? 'font-bold text-blue-900' : 'text-slate-700'
                          }`}
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-blue-600 text-white' : 'border border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCategory(cat.id);
                            }}
                            className="p-0.5 text-slate-300 hover:text-rose-500 transition-colors"
                            title="删除该维度"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add new category form */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCategory();
                    }}
                    placeholder="添加新维度，如：宿舍卫生"
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3.5 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
                  >
                    添加维度
                  </button>
                </div>
              </div>

              {/* Requirements & Checklist */}
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    岗位巡查职责说明
                  </label>
                  <textarea
                    rows={2}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="简述岗位巡查职责..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-2">
                    检查要点清单
                  </label>
                  <div className="space-y-2">
                    {checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-700 flex-1">{item}</span>
                        <button
                          type="button"
                          onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="添加要点..."
                        className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newChecklistItem.trim()) {
                            setChecklist([...checklist, newChecklistItem.trim()]);
                            setNewChecklistItem('');
                          }
                        }}
                        className="px-3 h-9 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700">启用该岗位排班与打分联动</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                className="w-2/3 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingPostId ? '保存岗位修改' : '确认录入岗位'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
