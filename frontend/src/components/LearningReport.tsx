import type { BaziChart } from '../types/bazi';

function sortWuxing(wuxing: BaziChart['wuxing']) {
  return (Object.entries(wuxing) as [string, number][])
    .sort(([, a], [, b]) => b - a);
}

function getLearningTheme(chart: BaziChart) {
  const sorted = sortWuxing(chart.wuxing);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const monthBranch = chart.month_pillar.branch.name;

  return {
    title: `${chart.day_master.name}日主在${monthBranch}月的学习报告`,
    lead: `这份结果先当作一份“命理学习报告”来读：它不直接给结论，而是告诉你这张盘应该从哪些问题入手。`,
    chips: [
      `日主：${chart.day_master.name}（${chart.day_master.element}）`,
      `月令：${monthBranch}`,
      strongest ? `偏显：${strongest[0]}` : '偏显：待判断',
      weakest ? `偏少：${weakest[0]}` : '偏少：待判断',
    ],
  };
}

export default function LearningReport({ chart }: { chart: BaziChart }) {
  const theme = getLearningTheme(chart);
  const relationCount = chart.dizhi_relations.length + chart.tiangan_relations.length;
  const hasShensha = chart.shensha.length > 0;

  const lessons = [
    {
      title: '这张盘最先要回答什么？',
      body: '先回答“日主在出生季节里有没有力量”。这是八字解读的入口。日主像人，月令像环境；人和环境的关系，比单个神煞更重要。',
    },
    {
      title: '为什么不能只看五行数量？',
      body: '五行数量只是提示，不是结论。真正要看的是：强的能不能流通，弱的是否真的需要补，以及这些五行在天干、地支、藏干里的位置。',
    },
    {
      title: relationCount > 0 ? '合冲关系说明什么？' : '关系少是不是更简单？',
      body: relationCount > 0
        ? `当前有 ${relationCount} 组干支关系。它们像命局里的互动事件：有的会牵动某个五行，有的会改变结构，有的只是辅助信息。`
        : '关系少不代表信息少，只是主线更清楚：先按日主、月令、五行流通来读，再看大运如何引动。',
    },
    {
      title: hasShensha ? '神煞应该怎么用？' : '为什么这里没有强调神煞？',
      body: hasShensha
        ? '神煞可以看作注释，不是主线。它适合辅助理解性格、事件倾向或特殊象意，但不能跳过日主强弱和格局。'
        : '神煞不是每张盘的重点。没有明显神煞时，反而更适合练习基本功：日主、月令、十神、五行流通。',
    },
  ];

  const nextSteps = [
    '先读“四柱”：确认年、月、日、时分别是什么，不急着判断好坏。',
    '再读“五行图”：找偏显和偏少，但把它当作线索，不当作结论。',
    '然后读“这张盘怎么读”：按顺序理解核心判断路径。',
    '最后读“经典依据”：带着问题去看古籍，而不是被书名和术语带着跑。',
  ];

  return (
    <section className="pillar-card overflow-hidden">
      <div className="border-b border-white/10 bg-white/[0.03] p-5">
        <div className="text-xs tracking-[0.2em] text-cyan-200/80">LEARNING REPORT</div>
        <h2 className="mt-2 text-xl font-semibold text-gray-50">{theme.title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">{theme.lead}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {theme.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="grid gap-3">
          {lessons.map((lesson) => (
            <article key={lesson.title} className="rounded-lg border border-white/10 bg-black/10 p-4">
              <h3 className="text-sm font-semibold text-gray-100">{lesson.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">{lesson.body}</p>
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-4">
          <h3 className="text-sm font-semibold text-amber-100">建议阅读顺序</h3>
          <ol className="mt-3 space-y-3">
            {nextSteps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-gray-300">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xs text-amber-100">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
