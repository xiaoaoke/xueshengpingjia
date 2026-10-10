import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { PlayCircle, ChevronDown, ChevronUp, Sparkles, Check } from 'lucide-react';

const FLOW_ITEMS = [
  { id: 'F01', name: 'F01 登录与三角色切换', role: '全部角色', desc: '模拟教师/班主任/管理员身份切换与权限重载' },
  { id: 'F02', name: 'F02 任务巡查与快速检查', role: '值周教师', desc: '按步检查填报、查重校验、扣加分提交与离线暂存' },
  { id: 'F03', name: 'F03 检查记录与退回重改', role: '值周教师', desc: '查看被退回记录的审核意见，补充修改并重新提交' },
  { id: 'F04', name: 'F04 待办审批与计分生效', role: '学校管理员', desc: '德育处复核扣分证据并一键审核通过，分值即时入账' },
  { id: 'F05', name: 'F05 排班管理与冲突检测', role: '学校管理员', desc: '全校周排班编辑，触发同教师重叠时间智能冲突预警' },
  { id: 'F06', name: 'F06 班级积分与扣分申诉', role: '班主任', desc: '班主任查看班级积分流水，对争议扣分提交材料申诉' },
  { id: 'F07', name: 'F07 问题整改反馈与闭环', role: '班主任/管理', desc: '接收整改工单，上传整改后照片并提交管理员复查验收' },
  { id: 'F08', name: 'F08 5步成绩结算与正式发布', role: '学校管理员', desc: '选择范围 → 预结算 → 异常核对 → 审批确认 → 发布红旗榜' },
];

export const FlowGuideBar: React.FC = () => {
  const { runPrototypeFlow, activeFlowTag } = useDuty();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-slate-950 via-[#0b1329] to-slate-950 text-white text-xs border-b border-blue-900/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 no-scrollbar">
          <div className="flex items-center gap-1.5 text-blue-300 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-tight text-[11px]">原型交互导引 (F01-F08)</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            {FLOW_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => runPrototypeFlow(item.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1 cursor-pointer border ${
                  activeFlowTag === item.id
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white'
                }`}
                title={item.desc}
              >
                <span>{item.id}</span>
                {activeFlowTag === item.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 shrink-0 ml-2 cursor-pointer transition-colors"
        >
          <span>{isExpanded ? '收起列表' : '展开 8 条闭环流程'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-3 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-left">
          {FLOW_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => runPrototypeFlow(item.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                activeFlowTag === item.id
                  ? 'border-blue-500 bg-blue-950/50 text-white'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-blue-400">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {item.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
