import React, { useState, useRef } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  CheckCircle2, 
  MinusCircle, 
  PlusCircle, 
  Plus,
  Camera, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Sparkles, 
  Image as ImageIcon,
  Info
} from 'lucide-react';
import { InspectCategory, InspectionRecord } from '../../types';
import { decideAudit } from '../../utils/auditPolicy';

export const QuickInspectForm: React.FC = () => {
  const { 
    classes, 
    rules, 
    dutyPosts,
    createRecord, 
    checkDuplicate, 
    openModal, 
    closeModal,
    setActiveSubPage, 
    currentUser,
    showToast,
    moralAuditEnabled
  } = useDuty();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<InspectionRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'recess' | 'lunch' | 'afternoon' | 'evening'>('recess');
  const [timeSlotName, setTimeSlotName] = useState<string>('大课间巡查');
  const [zone, setZone] = useState<string>(currentUser.dutyZone || '知行楼二层及中庭');
  
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [resultType, setResultType] = useState<'normal' | 'deduct' | 'add'>('deduct');
  const [score, setScore] = useState<number>(-2);
  const [description, setDescription] = useState<string>('第二节课下课后走廊有废纸未及时清扫，已当面提醒值日生。');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1584697964190-705b89368d40?w=600&auto=format&fit=crop&q=80');

  const handleResetAndContinue = () => {
    setIsSubmittedSuccess(false);
    setSubmittedRecord(null);
    setStep(1);
    setSelectedClassId(classes[0]?.id || '');
    setSelectedRuleId(rules[0]?.id || '');
    setResultType('deduct');
    setScore(rules[0]?.defaultScore ?? -1);
    setDescription('');
    setPhotoUrl('');
    showToast('已为您重置表单，可继续录入下一条', 'info');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择有效的图片文件', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('图片大小不能超过 10MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhotoUrl(result);
        showToast('现场照片已成功上传', 'success');
      }
    };
    reader.onerror = () => {
      showToast('读取图片文件失败，请重试', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const selectedRule = rules.find(r => r.id === selectedRuleId) || rules[0];
  // 统一审核口径预告：加分恒送审，扣分看德育处开关与规则配置
  const willNeedAudit = decideAudit(selectedRule, score, moralAuditEnabled) === 'pending_audit';

  const handleRuleChange = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      if (rule.defaultScore < 0) {
        setResultType('deduct');
        setScore(rule.defaultScore);
      } else if (rule.defaultScore > 0) {
        setResultType('add');
        setScore(rule.defaultScore);
      } else {
        setResultType('normal');
        setScore(0);
      }
    }
  };

  const handleTypeSelect = (type: 'normal' | 'deduct' | 'add') => {
    setResultType(type);
    if (type === 'normal') {
      setScore(0);
    } else if (type === 'deduct') {
      setScore(selectedRule.defaultScore < 0 ? selectedRule.defaultScore : -1);
    } else {
      setScore(selectedRule.defaultScore > 0 ? selectedRule.defaultScore : 1);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Step 2 -> 3 check for duplicates
      const dup = checkDuplicate(selectedClassId, selectedRule.id);
      if (dup) {
        openModal({
          type: 'duplicate_warning',
          title: '发现相似记录',
          message: `当前班级【${selectedClass.name}】今日已有同细则【${dup.ruleTitle}】检查记录，请核实是否属于重复录入？`,
          confirmText: '仍要继续提交',
          cancelText: '返回修改',
          data: { similarRecord: dup },
          onConfirm: () => {
            closeModal();
            setStep(3);
            showToast('已确认忽略重复提醒，进入核对确认', 'info');
          },
          onCancel: () => {
            closeModal();
          }
        });
      } else {
        setStep(3);
      }
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const res = createRecord({
        classId: selectedClassId,
        className: selectedClass.name,
        grade: selectedClass.grade,
        ruleId: selectedRule.id,
        ruleCategory: selectedRule.category,
        ruleTitle: selectedRule.title,
        score: score,
        type: resultType,
        timeSlot: timeSlot,
        timeSlotName: timeSlotName,
        zone: zone,
        description: description,
        photos: photoUrl ? [photoUrl] : []
      }, true);

      setIsSubmitting(false);

      if (res.success && res.record) {
        setSubmittedRecord(res.record);
        setIsSubmittedSuccess(true);
        showToast('检查记录已正式提交', 'success');
      } else {
        showToast('提交失败，请重试', 'error');
      }
    }, 350);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header with back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900">
          {isSubmittedSuccess ? '录入完成' : '快速检查录入'}
        </h2>
        <span className={`text-xs font-mono font-semibold ${isSubmittedSuccess ? 'text-emerald-600' : 'text-blue-600'}`}>
          {isSubmittedSuccess ? '已完成' : `步骤 ${step} / 3`}
        </span>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`h-1.5 rounded-full transition-colors ${isSubmittedSuccess ? 'bg-emerald-500' : step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
        <div className={`h-1.5 rounded-full transition-colors ${isSubmittedSuccess ? 'bg-emerald-500' : step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
        <div className={`h-1.5 rounded-full transition-colors ${isSubmittedSuccess ? 'bg-emerald-500' : step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
      </div>

      {/* STEP 1: 检查对象 */}
      {!isSubmittedSuccess && step === 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">1. 选择检查对象与时段</h3>
            <p className="text-xs text-slate-500 mt-0.5">请确定受检班级及当前值周时段</p>
          </div>

          {/* Class Select Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">受检班级</label>
            <div className="grid grid-cols-3 gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                    selectedClassId === cls.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="truncate">{cls.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{cls.grade}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">巡查时段</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { slot: 'morning', label: '晨门巡查' },
                { slot: 'recess', label: '大课间巡查' },
                { slot: 'lunch', label: '午间巡查' },
                { slot: 'afternoon', label: '眼保健操' },
                { slot: 'evening', label: '放学及晚休' }
              ].map((item) => (
                <button
                  key={item.slot}
                  onClick={() => {
                    setTimeSlot(item.slot as any);
                    setTimeSlotName(item.label);
                  }}
                  className={`p-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                    timeSlot === item.slot
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspection Zone & Duty Post linking */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">检查区域 / 巡查岗位</label>
              <span className="text-[10px] text-blue-600 font-medium">点击快速带入标准岗位</span>
            </div>

            {/* Quick Duty Post Selection Chips */}
            <div className="flex flex-wrap gap-1 pb-1">
              {dutyPosts.filter(p => p.isActive).map((post) => (
                <button
                  type="button"
                  key={post.id}
                  onClick={() => {
                    setSelectedPostId(post.id);
                    setZone(post.location);
                    if (post.timeSlots[0]?.includes('晨门')) {
                      setTimeSlot('morning');
                      setTimeSlotName('晨门巡查');
                    } else if (post.timeSlots[0]?.includes('大课间')) {
                      setTimeSlot('recess');
                      setTimeSlotName('大课间巡查');
                    } else if (post.timeSlots[0]?.includes('午间')) {
                      setTimeSlot('lunch');
                      setTimeSlotName('午间巡查');
                    } else if (post.timeSlots[0]?.includes('放学')) {
                      setTimeSlot('evening');
                      setTimeSlotName('放学及晚休');
                    }
                    showToast(`已快捷载入【${post.name}】责任区域`, 'info');
                  }}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                    zone === post.location || selectedPostId === post.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {post.name}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              placeholder="例如：知行楼二层北侧连廊"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleNextStep}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-all"
            >
              <span>下一步：填写检查项目与结果</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 检查结果 */}
      {!isSubmittedSuccess && step === 2 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">2. 填写检查项目与结果</h3>
            <p className="text-xs text-slate-500 mt-0.5">选择考评细则并如实记录情况</p>
          </div>

          {/* Rule Item Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">常规考评细则</label>
            <select
              value={selectedRuleId}
              onChange={(e) => handleRuleChange(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50 cursor-pointer"
            >
              {rules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  [{rule.categoryName}] {rule.title} ({rule.defaultScore > 0 ? `+${rule.defaultScore}` : rule.defaultScore}分)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">{selectedRule.description}</p>
          </div>

          {/* Result Type: Normal, Deduct, Add */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">检查结果分类</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTypeSelect('normal')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  resultType === 'normal'
                    ? 'border-slate-800 bg-slate-800 text-white shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-medium">正常合格 (0分)</span>
              </button>

              <button
                onClick={() => handleTypeSelect('deduct')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  resultType === 'deduct'
                    ? 'border-red-600 bg-red-50 text-red-700 font-semibold shadow-xs ring-1 ring-red-400'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <MinusCircle className="w-5 h-5 text-red-600" />
                <span className="text-xs font-medium">扣分处理</span>
              </button>

              <button
                onClick={() => handleTypeSelect('add')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  resultType === 'add'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-xs ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-medium">加分表扬</span>
              </button>
            </div>
          </div>

          {/* Score Value (if deduct or add) */}
          {resultType !== 'normal' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">拟评定分值</label>
              <div className="flex items-center gap-2">
                {resultType === 'deduct' ? (
                  [-0.5, -1, -2, -3].map((val) => (
                    <button
                      key={val}
                      onClick={() => setScore(val)}
                      className={`flex-1 h-10 rounded-xl border text-xs font-bold font-mono transition-colors cursor-pointer ${
                        score === val
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-slate-200 hover:border-red-300 text-slate-700'
                      }`}
                    >
                      {val} 分
                    </button>
                  ))
                ) : (
                  [0.5, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      onClick={() => setScore(val)}
                      className={`flex-1 h-10 rounded-xl border text-xs font-bold font-mono transition-colors cursor-pointer ${
                        score === val
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-200 hover:border-emerald-300 text-slate-700'
                      }`}
                    >
                      +{val} 分
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">现场情况说明</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              placeholder="请输入现场违规事实或表扬事迹..."
            />
          </div>

          {/* Photo attachment upload & preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">现场照片证据</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <div className="flex items-center gap-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl overflow-hidden border border-dashed border-slate-300 bg-slate-50 shrink-0 relative group cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors shadow-2xs"
                title="点击选择或拍摄照片"
              >
                {photoUrl ? (
                  <>
                    <img
                      src={photoUrl}
                      alt="现场证据"
                      className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-medium flex-col gap-0.5">
                      <Camera className="w-5 h-5" />
                      <span>更换</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-[10px] font-medium">点击上传</span>
                  </>
                )}
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>更换照片</span>
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        showToast('已移除证据照片', 'info');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-medium cursor-pointer transition-colors"
                    >
                      移除
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 leading-snug">
                  支持拍照或本地选择现场照片作为审核存证
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={handleNextStep}
              className="w-2/3 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-all"
            >
              <span>下一步：核对确认</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 确认提交 */}
      {!isSubmittedSuccess && step === 3 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">3. 确认提交检查记录</h3>
            <p className="text-xs text-slate-500 mt-0.5">请仔细核实录入信息，提交后将记录系统日志</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-700 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">受检班级：</span>
              <span className="font-bold text-slate-900">{selectedClass.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">巡查时段：</span>
              <span className="font-medium text-slate-900">{timeSlotName} ({zone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">检查项目：</span>
              <span className="font-medium text-slate-900">{selectedRule.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">评定结果：</span>
              <span className={`font-bold font-mono text-sm ${score < 0 ? 'text-red-600' : score > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                {score > 0 ? `+${score} 分 (加分)` : score < 0 ? `${score} 分 (扣分)` : '0 分 (合格)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">生效规则：</span>
              <span className={`font-medium ${willNeedAudit ? 'text-amber-700' : 'text-emerald-700'}`}>
                {willNeedAudit ? '需德育处管理员审核后生效计分' : '即时生效计分'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 text-slate-600">
              <span className="text-slate-500 block mb-1">情况说明：</span>
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                {description || '无补充说明'}
              </div>
            </div>
            {photoUrl && (
              <div className="pt-2 border-t border-slate-200 text-slate-600 flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">存证照片：</span>
                <img
                  src={photoUrl}
                  alt="照片证据"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              className="w-1/3 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-2/3 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-all disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>提交处理中...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>确认无误，正式提交</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 提交成功结果卡片 */}
      {isSubmittedSuccess && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">检查记录提交成功</h3>
            <p className="text-xs text-slate-500 leading-relaxed px-2">
              {submittedRecord?.status === 'pending_audit' 
                ? '已录入系统存证并推送至德育处待审核池，管理员复核分值后计入积分榜。'
                : `本次检查已即时生效，无需德育处审核，分值已计入 ${submittedRecord?.className} 成绩榜。`}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-left space-y-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">受检班级</span>
              <span className="font-semibold text-slate-900">{submittedRecord?.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">检查时段</span>
              <span className="text-slate-800">{submittedRecord?.timeSlotName} ({submittedRecord?.zone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">检查项目</span>
              <span className="text-slate-800 font-medium">{submittedRecord?.ruleTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">评定分值</span>
              <span className={`font-bold font-mono ${
                (submittedRecord?.score || 0) < 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {(submittedRecord?.score || 0) > 0 ? `+${submittedRecord?.score}` : submittedRecord?.score} 分
              </span>
            </div>
            {submittedRecord?.photos && submittedRecord.photos.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                <span className="text-slate-500">存证照片</span>
                <img
                  src={submittedRecord.photos[0]}
                  alt="证据照片"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                />
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleResetAndContinue}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>继续录入下一条</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveSubPage('records_list');
                }}
                className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                查看检查记录
              </button>
              <button
                onClick={() => {
                  setActiveSubPage(null);
                }}
                className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                返回工作台
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
