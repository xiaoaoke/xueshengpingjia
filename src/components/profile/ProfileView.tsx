import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ChevronRight, 
  Plus, 
  Trash2,
  ShieldCheck
} from 'lucide-react';

export const ProfileView: React.FC = () => {
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
    rules,
    addRule,
    classes,
    openModal,
    showToast
  } = useDuty();

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <h2 className="text-sm font-bold text-slate-900">个人中心</h2>

      {/* VIEW 1: 个人中心 (Profile info is now always at the top) */}
      <div className="space-y-3">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 truncate">{currentUser.name}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                {currentUser.role === 'duty_teacher' ? '值周教师' : currentUser.role === 'homeroom_teacher' ? '班主任' : '学校管理员'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">{currentUser.title}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{currentUser.school} · {currentCampus}</div>
          </div>
        </div>

      </div>

      <div className="space-y-3">
          {/* Role Switching list */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              快速身份与权限切换
            </div>
            <div className="space-y-1.5">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    if (u.id !== currentUser.id) {
                      openModal({
                        type: 'role_switch_confirm',
                        title: '确认切换身份？',
                        message: `切换后将重载为【${u.name}】的对应工作台权限和业务数据。`,
                        confirmText: '确认切换',
                        cancelText: '取消',
                        onConfirm: () => switchUser(u.id)
                      });
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    u.id === currentUser.id
                      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400'
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.title}</div>
                    </div>
                  </div>
                  {u.id === currentUser.id ? (
                    <span className="text-xs font-bold text-blue-600">当前在用</span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Network & Offline Draft Box */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">弱网环境与离线缓存</span>
              <button
                onClick={toggleNetwork}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>{isOnline ? '在线状态' : '已模拟断网/离线'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              在地下食堂、实验楼边缘等信号盲区，系统支持自动将巡查打分暂存为本地加密草稿，恢复网络后可一键同步入库。
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">本地待同步草稿：</span>
                <strong className="text-slate-900 font-mono">{offlineDrafts.length}</strong> 条
              </div>
              <button
                onClick={syncOfflineDrafts}
                disabled={offlineDrafts.length === 0}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  offlineDrafts.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>立即同步入库</span>
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export const ScoreRulesView: React.FC = () => {
  const {
    rules,
    addRule,
    showToast,
    assessmentCategories,
    dutyTimeSlots,
    addTimeSlot,
    removeTimeSlot,
    addCategory,
    removeCategory,
    moralAuditEnabled,
    setMoralAuditEnabled
  } = useDuty();
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<string>(assessmentCategories[0]?.id || 'hygiene');
  const [newRuleScore, setNewRuleScore] = useState<number>(-1);
  const [newRuleRequiresAudit, setNewRuleRequiresAudit] = useState(true);

  const handleAddNewRule = () => {
    if (!newRuleTitle.trim()) {
      showToast('请输入考评规则标题', 'warning');
      return;
    }
    const categoryName = assessmentCategories.find(c => c.id === newRuleCategory)?.name || '未知分类';
    addRule({
      category: newRuleCategory as any,
      categoryName,
      title: newRuleTitle,
      defaultScore: newRuleScore,
      description: '学校德育常规考评细则',
      requiresAudit: newRuleRequiresAudit
    });
    setNewRuleTitle('');
    setShowAddRuleModal(false);
  };

  return (
        <div className="space-y-4">
          {/* Global Moral Audit Policy Switch Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  moralAuditEnabled ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">德育处审批全局设置</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      moralAuditEnabled 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {moralAuditEnabled ? '需要审批' : '免审即生效'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {moralAuditEnabled
                      ? '当前：扣分/常规记录按规则推送至待审核池复核；加分项始终需审核'
                      : '当前：扣分记录直接计入班级积分榜；加分项仍需审核防刷分'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={moralAuditEnabled}
                onClick={() => setMoralAuditEnabled(!moralAuditEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-2xs ${
                  moralAuditEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    moralAuditEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          {/* Scoring Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">全校值周考核评分细则 ({rules.length}项)</span>
              <button
                onClick={() => setShowAddRuleModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增细则</span>
              </button>
            </div>

            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {rule.categoryName}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{rule.title}</span>
                    </div>
                    <span className={`text-xs font-bold font-mono ${rule.defaultScore > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {rule.defaultScore > 0 ? `+${rule.defaultScore}` : rule.defaultScore}分
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{rule.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                    <span>{rule.requiresAudit ? '需德育处审核确认' : '扣分免审即时生效（加分仍送审）'}</span>
                    <span className="text-emerald-600 font-medium">● 启用中</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Settings (NEW) */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-3">重点巡查时段配置</h3>
              <div className="space-y-2">
                {dutyTimeSlots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="flex-1">{slot}</span>
                    <button onClick={() => removeTimeSlot(slot)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="如：早自习 (07:00-07:20)"
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addTimeSlot(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-3">考评维度配置</h3>
              <div className="space-y-2">
                {assessmentCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="flex-1">{cat.name}</span>
                    <button onClick={() => removeCategory(cat.id)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="如：宿舍卫生"
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        addCategory(`cat_${Date.now()}`, e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Rule Modal */}
          {showAddRuleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-slate-200 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  新增考评细则
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">细则分类</label>
                    <select
                      value={newRuleCategory}
                      onChange={(e) => setNewRuleCategory(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      {assessmentCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">规则标题</label>
                    <input
                      type="text"
                      value={newRuleTitle}
                      onChange={(e) => setNewRuleTitle(e.target.value)}
                      placeholder="如：自习课秩序井然示范班"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">分值 (正数加分，负数扣分)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newRuleScore}
                      onChange={(e) => setNewRuleScore(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="reqAudit"
                      checked={newRuleRequiresAudit}
                      onChange={(e) => setNewRuleRequiresAudit(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label htmlFor="reqAudit" className="font-medium text-slate-700 cursor-pointer">
                      录入后需管理员审核才生效计分
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setShowAddRuleModal(false)}
                    className="w-1/3 h-10 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddNewRule}
                    className="w-2/3 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    保存规则
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
  );
};

export const ClassStructureView: React.FC = () => {
  const { classes } = useDuty();

  return (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">班级架构管理 ({classes.length}个班级)</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {classes.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-900">{c.fullName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">班主任：{c.homeroomTeacher} ({c.studentCount}人)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
  );
};
