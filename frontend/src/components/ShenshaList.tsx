import type { ShenshaItem } from '../types/bazi';

const TYPE_COLORS: Record<string, string> = {
  '吉': 'bg-green-500/20 text-green-300 border-green-500/30',
  '凶': 'bg-red-500/20 text-red-300 border-red-500/30',
  '中性': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

interface Props {
  shensha: ShenshaItem[];
}

export default function ShenshaList({ shensha }: Props) {
  if (shensha.length === 0) return null;

  const ji = shensha.filter(s => s.type === '吉');
  const xiong = shensha.filter(s => s.type === '凶');
  const other = shensha.filter(s => s.type === '中性');

  return (
    <div className="pillar-card p-4">
      <h3 className="text-sm text-gray-400 mb-3 text-center">神煞</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {[...ji, ...xiong, ...other].map((s, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-full text-xs border ${TYPE_COLORS[s.type] || ''}`}>
            {s.name}
            {s.pillar && <span className="opacity-60 ml-1">({s.pillar})</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
