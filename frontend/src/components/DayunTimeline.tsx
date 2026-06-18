import type { DayunItem } from '../types/bazi';

const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-green-400',
  '火': 'text-red-400',
  '土': 'text-yellow-400',
  '金': 'text-slate-300',
  '水': 'text-blue-400',
};

interface Props {
  dayun: DayunItem[];
  startAge: number;
}

export default function DayunTimeline({ dayun, startAge }: Props) {
  if (dayun.length === 0) return null;

  return (
    <div className="pillar-card p-4">
      <h3 className="text-sm text-gray-400 mb-3 text-center">
        大运 <span className="text-purple-300">({startAge}岁起运)</span>
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {dayun.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            <div className="text-xs text-gray-500">{d.start_age}-{d.start_age + 9}岁</div>
            <div className="flex gap-0.5">
              <span className={`text-lg font-bold ${ELEMENT_COLORS[d.element] || ''}`}>
                {d.stem}
              </span>
              <span className={`text-lg font-bold ${ELEMENT_COLORS[d.element] || ''}`}>
                {d.branch}
              </span>
            </div>
            <div className="text-xs text-gray-500">{d.nayin}</div>
            <div className="text-xs text-gray-600">{d.start_year}年</div>
          </div>
        ))}
      </div>
    </div>
  );
}
