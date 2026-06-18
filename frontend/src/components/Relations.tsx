import type { DizhiRelation, TianganRelation } from '../types/bazi';

const REL_COLORS: Record<string, string> = {
  '六合': 'text-green-300 bg-green-500/10',
  '三合': 'text-green-300 bg-green-500/10',
  '三会': 'text-green-300 bg-green-500/10',
  '六冲': 'text-red-300 bg-red-500/10',
  '相刑': 'text-orange-300 bg-orange-500/10',
  '自刑': 'text-orange-300 bg-orange-500/10',
  '相害': 'text-purple-300 bg-purple-500/10',
  '相破': 'text-gray-300 bg-gray-500/10',
  '合化': 'text-cyan-300 bg-cyan-500/10',
};

interface Props {
  dizhiRelations: DizhiRelation[];
  tianganRelations: TianganRelation[];
}

export default function Relations({ dizhiRelations, tianganRelations }: Props) {
  const all = [
    ...tianganRelations.map(r => ({ type: r.type, detail: r.detail, items: r.stems })),
    ...dizhiRelations.map(r => ({ type: r.type, detail: r.detail, items: r.branches })),
  ];

  if (all.length === 0) return null;

  return (
    <div className="pillar-card p-4">
      <h3 className="text-sm text-gray-400 mb-3 text-center">干支关系</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {all.map((r, i) => (
          <span key={i} className={`px-2.5 py-1 rounded-lg text-xs ${REL_COLORS[r.type] || 'bg-white/10 text-gray-300'}`}>
            {r.detail || `${r.type}: ${r.items.join('')}`}
          </span>
        ))}
      </div>
    </div>
  );
}
