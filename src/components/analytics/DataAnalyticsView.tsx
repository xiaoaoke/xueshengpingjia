import React from 'react';
import { useDuty } from '../../context/DutyContext';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  FileSpreadsheet, 
  PieChart 
} from 'lucide-react';

export const DataAnalyticsView: React.FC = () => {
  const { setActiveSubPage, showToast, records, classes } = useDuty();

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900">常规值周数据统计分析</h2>
        <button
          onClick={() => showToast('已成功导出第6周值周数据报表 (CSV/PDF)', 'success')}
          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
          title="导出分析报告"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500">累计巡查检查次数</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">128 次</div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>较上周环比提升 12%</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500">整改闭环落实率</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">94.2%</div>
          <div className="text-[10px] text-blue-500 mt-1 flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>24小时内按期整改</span>
          </div>
        </div>
      </div>

      {/* Top 5 Issue Ranking */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>本周常规问题高发 Top 5</span>
          </h3>
          <span className="text-[11px] text-slate-400">占比分析</span>
        </div>

        <div className="space-y-2.5 text-xs">
          {[
            { title: '走廊包干区废纸杂物未清扫', count: 18, pct: 36, color: 'bg-rose-500' },
            { title: '课间楼道大声喧哗、追逐打闹', count: 14, pct: 28, color: 'bg-amber-500' },
            { title: '早读未按规定着校服/未佩戴校徽', count: 9, pct: 18, color: 'bg-blue-500' },
            { title: '眼保健操闭眼不规范/做小动作', count: 6, pct: 12, color: 'bg-indigo-500' },
            { title: '自习课未按时安静/随意走动', count: 3, pct: 6, color: 'bg-slate-500' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-800 font-medium">{idx + 1}. {item.title}</span>
                <span className="font-mono text-slate-500">{item.count}次 ({item.pct}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.pct}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Time Slot Distribution */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>巡查时段分布与问题热度</span>
          </h3>
          <span className="text-[11px] text-slate-400">大课间高发</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500">晨门进校</div>
            <div className="font-bold font-mono text-slate-900 mt-1">18%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="text-[10px] text-blue-700 font-semibold">大课间</div>
            <div className="font-bold font-mono text-blue-700 mt-1">42%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500">午餐午休</div>
            <div className="font-bold font-mono text-slate-900 mt-1">24%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500">放学自习</div>
            <div className="font-bold font-mono text-slate-900 mt-1">16%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
