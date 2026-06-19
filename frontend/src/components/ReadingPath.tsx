import type { BaziChart } from '../types/bazi';

function sortWuxing(wuxing: BaziChart['wuxing']) {
  return (Object.entries(wuxing) as [string, number][])
    .sort(([, a], [, b]) => b - a);
}

export default function ReadingPath({ chart }: { chart: BaziChart }) {
  const sorted = sortWuxing(chart.wuxing);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const relationCount = chart.dizhi_relations.length + chart.tiangan_relations.length;

  const steps = [
    {
      label: '先定自己',
      title: `${chart.day_master.name}日主`,
      text: `日主代表命盘里的“自己”。它属${chart.day_master.element}，后面的强弱、用神、格局都围绕它判断。`,
    },
    {
      label: '再看环境',
      title: `${chart.month_pillar.stem.name}${chart.month_pillar.branch.name}月令`,
      text: '月令代表出生季节，是判断日主强弱的第一依据。它像天气，会决定整张盘的底色。',
    },
    {
      label: '看能量分布',
      title: strongest && weakest ? `${strongest[0]}偏显，${weakest[0]}偏少` : '五行分布',
      text: strongest && weakest
        ? `五行不是越平均越好。${strongest[0]}多时要看能否被泄、制、化；${weakest[0]}少时要看是否需要补。`
        : '五行要结合天干、地支和藏干一起读，不只看表面数量。',
    },
    {
      label: '最后看互动',
      title: relationCount > 0 ? `${relationCount}组干支关系` : '结构较清',
      text: relationCount > 0
        ? '合冲刑害像命盘内部的相互作用，会牵动某些五行，也可能改变原本的判断。'
        : '干支关系不复杂时，可以优先沿着“日主-月令-五行流通”的主线读。',
    },
  ];

  return (
    <section className="pillar-card p-5">
      <div className="flex flex-col gap-1 text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-100">这张盘怎么读</h2>
        <p className="text-xs text-gray-400">给初学者的阅读顺序，避免一上来被术语淹没</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <div key={step.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
                {index + 1}
              </span>
              <span className="text-xs text-cyan-200">{step.label}</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-100">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/10 p-3 text-xs leading-5 text-gray-400">
        建议顺序：先读这一栏，再看四柱和五行图，最后看“经典依据”。这样比直接看神煞和大运更容易抓住主线。
      </div>
    </section>
  );
}
