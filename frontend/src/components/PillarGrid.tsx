import type { Pillar as PillarType, StemInfo } from '../types/bazi';

const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-green-400',
  '火': 'text-red-400',
  '土': 'text-yellow-400',
  '金': 'text-slate-300',
  '水': 'text-blue-400',
};

const ELEMENT_BG: Record<string, string> = {
  '木': 'bg-green-500/15 border-green-500/30',
  '火': 'bg-red-500/15 border-red-500/30',
  '土': 'bg-yellow-500/15 border-yellow-500/30',
  '金': 'bg-slate-400/15 border-slate-400/30',
  '水': 'bg-blue-500/15 border-blue-500/30',
};

function StemChar({ stem, large = false }: { stem: StemInfo; large?: boolean }) {
  const color = ELEMENT_COLORS[stem.element] || '';
  return (
    <span className={`${color} ${large ? 'stem-text' : 'text-base'}`}>
      {stem.name}
    </span>
  );
}

function PillarCard({ pillar }: { pillar: PillarType }) {
  return (
    <div className="pillar-card p-4 flex flex-col items-center gap-2 min-w-[120px]">
      {/* 柱名 */}
      <div className="text-xs text-gray-400 mb-1">{pillar.name}</div>

      {/* 十神 */}
      <div className="text-xs text-purple-300 h-5">
        {pillar.stem.shishen || '日主'}
      </div>

      {/* 天干 */}
      <div className="py-1">
        <StemChar stem={pillar.stem} large />
      </div>

      {/* 分隔线 */}
      <div className="w-12 h-px bg-white/20 my-1" />

      {/* 地支 */}
      <div className="py-1">
        <span className={`branch-text ${ELEMENT_COLORS[pillar.branch.element] || ''}`}>
          {pillar.branch.name}
        </span>
      </div>

      {/* 藏干 */}
      <div className="flex gap-1 mt-1">
        {pillar.branch.canggan.map((cg, i) => (
          <div key={i} className={`text-xs px-1.5 py-0.5 rounded border ${ELEMENT_BG[cg.element] || ''}`}>
            <span className={ELEMENT_COLORS[cg.element]}>{cg.name}</span>
            <span className="text-gray-400 ml-0.5">{cg.shishen}</span>
          </div>
        ))}
      </div>

      {/* 纳音 */}
      <div className="text-xs text-gray-500 mt-1">{pillar.nayin}</div>

      {/* 十二长生 */}
      <div className="text-xs text-gray-500">{pillar.changsheng}</div>
    </div>
  );
}

interface Props {
  pillars: [PillarType, PillarType, PillarType, PillarType];
  kongwang: string[];
  dayMaster: StemInfo;
}

export default function PillarGrid({ pillars, kongwang, dayMaster }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-400">日主:</span>
        <span className={`text-lg font-bold ${ELEMENT_COLORS[dayMaster.element]}`}>
          {dayMaster.name}
        </span>
        <span className="text-sm text-gray-400">
          ({dayMaster.element}{dayMaster.yinyang})
        </span>
      </div>
      <div className="flex gap-4 flex-wrap justify-center">
        {pillars.map((p, i) => (
          <PillarCard key={i} pillar={p} />
        ))}
      </div>
      {kongwang.length > 0 && (
        <div className="text-sm text-gray-400 mt-2">
          空亡: <span className="text-orange-300">{kongwang.join('、')}</span>
        </div>
      )}
    </div>
  );
}
