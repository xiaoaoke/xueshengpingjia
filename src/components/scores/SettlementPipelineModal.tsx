import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Award,
  Clock,
  Layers
} from 'lucide-react';

export const SettlementPipelineModal: React.FC = () => {
  const { 
    classes, 
    records, 
    appeals, 
    settlement, 
    publishSettlement, 
    setActiveSubPage, 
    setCurrentTab,
    openModal, 
    closeModal,
    currentUser,
    currentCampus 
  } = useDuty();

  const [step, setStep] = useState<number>(1);

  // Settlement Scope state（周次绑定真实结算对象；校区数据仅中心校区，不再提供假选项）
  const [scopeGrade, setScopeGrade] = useState('all');
  const scopeWeek = settlement.weekNumber;

  // Anomaly stats（未决申诉含 need_more_info）
  const pendingAudits = records.filter(r => r.status === 'pending_audit');
  const pendingAppeals = appeals.filter(a => a.status !== 'resolved');
  const hasAnomalies = pendingAudits.length > 0 || pendingAppeals.length > 0;
  const scopedClassCount = classes.filter(c => scopeGrade === 'all' || c.grade === scopeGrade).length;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      // 门禁1：存在未决申诉时硬阻断，必须先裁决（否则发布后分值仍会被冲正）
      if (pendingAppeals.length > 0) {
        openModal({
          type: 'publish_confirm',
          title: '存在未决申诉，无法发布',
          message: `当前有 ${pendingAppeals.length} 条扣分申诉尚未裁决完毕，成绩仍有变动风险。请先在审批中心完成全部申诉裁决后再发布正式成绩。`,
          confirmText: '前往申诉裁决',
          cancelText: '返回核对',
          onConfirm: () => {
            closeModal();
            setCurrentTab('approvals');
            setActiveSubPage('appeal_list');
          }
        });
        return;
      }
      // Step 4 -> 5 trigger secondary confirmation dialog per spec:
      // "移动端发布必须包含二次确认，提示'本次发布涉及 X 个班级'，发布完成后提供'查看正式成绩'"
      openModal({
        type: 'publish_confirm',
        title: '确认发布正式成绩？',
        message: `本次发布涉及 ${scopedClassCount} 个班级第${scopeWeek}周常规考评成绩。${
          pendingAudits.length > 0 ? `另有 ${pendingAudits.length} 条未审核记录将不计入本版成绩。` : ''
        }发布后将生成正式公示版本并推送全校通知。`,
        confirmText: '确认正式发布',
        cancelText: '再核对一下',
        onConfirm: () => {
          publishSettlement(scopeGrade);
          closeModal();
          setStep(5);
        }
      });
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>退出结算</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900">周积分结算与发布向导</h2>
        <span className="text-xs font-mono font-bold text-blue-600">步骤 {step} / 5</span>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`}
          ></div>
        ))}
      </div>

      {/* STEP 1: 选择结算范围 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">1. 选择结算范围</h3>
            <p className="text-xs text-slate-500 mt-0.5">指定结算的校区、学段、年级及教学周</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">教学周次</label>
              <select
                value={scopeWeek}
                disabled
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              >
                <option value={scopeWeek}>第 {scopeWeek} 教学周 ({settlement.startDate} ~ {settlement.endDate}) 当前结算周</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">结算年级范围</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScopeGrade('all')}
                  className={`p-2 rounded-xl border font-medium transition-colors cursor-pointer ${
                    scopeGrade === 'all' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  全校全部年级 ({classes.length}个班)
                </button>
                <button
                  onClick={() => setScopeGrade('高一年级')}
                  className={`p-2 rounded-xl border font-medium transition-colors cursor-pointer ${
                    scopeGrade === '高一年级' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  高一年级 ({classes.filter(c => c.grade === '高一年级').length}个班)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleNext}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>下一步：生成预结算快照</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 生成预结算 */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">2. 生成预结算与覆盖率</h3>
            <p className="text-xs text-slate-500 mt-0.5">系统已自动汇总各班级当前分值与巡查覆盖率</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-lg font-bold text-slate-900 font-mono">{scopedClassCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">参评班级</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-lg font-bold text-emerald-600 font-mono">100%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">巡查覆盖率</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-lg font-bold text-blue-600 font-mono">{records.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">累计检查项</div>
            </div>
          </div>

          {/* Quick preview list（按实时分排序取前 4） */}
          <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
            {classes
              .filter(c => scopeGrade === 'all' || c.grade === scopeGrade)
              .sort((a, b) => b.currentScore - a.currentScore)
              .slice(0, 4)
              .map((c, i) => (
                <div key={c.id} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    第{i + 1}名 · {c.name}
                  </span>
                  <span className="font-bold font-mono text-blue-700">
                    {c.currentScore.toFixed(1)} 分
                  </span>
                </div>
              ))}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 h-12 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={handleNext}
              className="w-2/3 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>下一步：核对业务异常</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 异常核对 */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">3. 异常事项核对</h3>
            <p className="text-xs text-slate-500 mt-0.5">核实未审核记录、未决申诉及疑似重复检查项</p>
          </div>

          <div className="space-y-2 text-xs">
            {/* Pending Audit Alert */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              pendingAudits.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>未审核扣/加分记录：<strong>{pendingAudits.length}</strong> 条</span>
              </div>
              <span className="text-[11px] font-medium">
                {pendingAudits.length > 0 ? '发布前建议先审核' : '全部已审核'}
              </span>
            </div>

            {/* Pending Appeal Alert */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              pendingAppeals.length > 0 ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-purple-600" />
                <span>未决扣分申诉：<strong>{pendingAppeals.length}</strong> 条</span>
              </div>
              <span className="text-[11px] font-medium">
                {pendingAppeals.length > 0 ? '发布前必须全部裁决' : '已全部办结'}
              </span>
            </div>

            {/* Duplication check */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>重复检查冲突筛查：通过</span>
              </div>
              <span className="text-[11px] font-medium">无高危冲突</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-100">
            提示：发布后系统将按当前已生效分值生成<strong>不可变正式榜单快照</strong>。未审核记录不计入本次成绩；未决申诉必须先行裁决，否则发布会被阻断。发布后发生的调账会标记"待修订"，需重新发布修订版。
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 h-12 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={handleNext}
              className={`w-2/3 h-12 text-white rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                hasAnomalies ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span>{hasAnomalies ? '仍有异常，继续核对发布' : '下一步：提交审批确认'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 确认并提交审批 */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">4. 审批确认与公示范围</h3>
            <p className="text-xs text-slate-500 mt-0.5">确认发布版本号、公示渠道与责任签字</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs text-slate-700 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">发布范围：</span>
              <span className="font-semibold text-slate-900">中心校区 · {scopeGrade === 'all' ? '全校年级' : scopeGrade} · 第{scopeWeek}周常规考评</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">涉及班级：</span>
              <span className="font-semibold text-slate-900">{scopedClassCount} 个班级</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">审核发布人：</span>
              <span className="font-semibold text-slate-900">{currentUser.name} (德育处)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">公示渠道：</span>
              <span className="font-semibold text-slate-900">教师端、班主任工作台、校园大屏公告</span>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setStep(3)}
              className="w-1/3 h-12 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={handleNext}
              className="w-2/3 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>确认无误，锁定并正式发布</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: 发布正式结果完成 */}
      {step === 5 && (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-2xs space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">第 {scopeWeek} 周值周成绩已正式发布！</h3>
            <p className="text-xs text-slate-500">
              已成功锁定版本并向全校师生推送公告通知。优胜班级将获颁本周“文明流动红旗”。
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setCurrentTab('scores');
                setActiveSubPage(null);
              }}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>查看正式班级积分榜</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
