import type { BaziChart } from '../types/bazi';

function sortWuxing(wuxing: BaziChart['wuxing']) {
  return (Object.entries(wuxing) as [string, number][])
    .sort(([, a], [, b]) => b - a);
}

export default function ReadingPath({ chart, topic }: { chart: BaziChart; topic: string }) {
  const sorted = sortWuxing(chart.wuxing);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const relationCount = chart.dizhi_relations.length + chart.tiangan_relations.length;

  const steps = [
    {
      label: '先定问题',
      title: topic,
      text: '先把命盘信息收束到这次提问上，避免把所有术语都摊开讲。不同问题会优先看不同证据。',
    },
    {
      label: '自己与环境',
      title: `${chart.day_master.name}日主在${chart.month_pillar.branch.name}月`,
      text: `日主代表自己，月令代表外部环境。当前日主属${chart.day_master.element}，要先看它在这个环境里是顺势、承压还是需要调节。`,
    },
    {
      label: '找阻滞点',
      title: strongest && weakest ? `${strongest[0]}偏显，${weakest[0]}偏少` : '五行分布',
      text: strongest && weakest
        ? `${strongest[0]}更明显、${weakest[0]}更少，提示能量有偏向。真正要判断的是它会形成资源、压力、表达，还是形成堵点。`
        : '五行要结合天干、地支和藏干一起读，不能只按数量下结论。',
    },
    {
      label: '看何时被引动',
      title: relationCount > 0 ? `${relationCount}组干支关系` : '结构较清',
      text: relationCount > 0
        ? '合冲刑害会把某些主题引动起来。回答现实问题时，还需要结合大运和近年流年确认时间感。'
        : '干支关系不复杂时，先抓原局主线，再用大运判断哪个阶段更容易显现。',
    },
  ];

  return (
    <section className="pillar-card p-5">
      <div className="flex flex-col gap-1 text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-100">这个答复从哪里来</h2>
        <p className="text-xs text-gray-400">把命盘证据按问题组织，而不是把术语一股脑倒出来</p>
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
        建议顺序：先看“解惑报告”，再用这一栏理解依据，最后看四柱、五行、大运和经典线索。
      </div>
    </section>
  );
}
