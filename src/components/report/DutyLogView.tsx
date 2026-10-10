import React, { useState } from 'react';
import { useDuty } from '../../context/DutyContext';
import { todayString } from '../../utils/prototypeClock';
import { ArrowLeft, FileText, CheckCircle2, Share2, Award, Printer } from 'lucide-react';

const DUTY_LOG_KEY = 'SMART_CAMPUS_DUTY_V4_duty_log';

export const DutyLogView: React.FC = () => {
  const { currentUser, setActiveSubPage, showToast, settlement } = useDuty();

  // 日志草稿本地持久化，刷新不丢
  const [logText, setLogText] = useState(() => {
    return localStorage.getItem(DUTY_LOG_KEY) || '今日知行楼二层及中庭整体巡查秩序良好。早读阶段同学们精神状态饱满；第二节大课间连廊饮水处发现个别班级未及时清理包装袋，已当面责成值日生打扫并下发整改单；午餐食堂排队打饭井然有序，光盘行动落实到位。';
  });

  const handleSaveLog = () => {
    localStorage.setItem(DUTY_LOG_KEY, logText);
    showToast('值周小结已保存成功', 'success');
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveSubPage(null)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <h2 className="text-sm font-bold text-slate-900">值周小结与周报</h2>
        <button
          onClick={() => showToast('已生成值周小结打印预览', 'info')}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      {/* Teacher Daily Duty Log Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900">今日值周教师小结</h3>
            <span className="text-[11px] text-slate-500">{currentUser.name} · {todayString()}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
            草稿已暂存
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">日常巡查小结备忘录</label>
          <textarea
            rows={5}
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={handleSaveLog}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            保存并提交归档
          </button>
        </div>
      </div>

      {/* Weekly Official Summary Preview (德育处周总汇) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>全校第{settlement.weekNumber}周值周总评简报</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">德育处编发</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2 leading-relaxed">
          <p>
            <strong>一、本周总体运行情况：</strong>
            全校师生精神风貌积极向上，常规考核总平均分97.2分。大课间跑操口号响亮，晨跑出勤率达99.5%。
          </p>
          <p>
            <strong>二、文明优胜班集体：</strong>
            高一(2)班、高一(4)班、高二(1)班、高三(1)班表现优异，拟颁发本周常规管理流动红旗。
          </p>
          <p>
            <strong>三、下周重点整改提醒：</strong>
            各班级应重点加强晚自习后包干区清扫及课间楼道秩序，严禁在阶梯及拐角处冲撞打闹。
          </p>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            onClick={() => showToast('简报链接已复制，可分享至企业微信/校园群', 'success')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>一键分享简报</span>
          </button>
        </div>
      </div>
    </div>
  );
};
