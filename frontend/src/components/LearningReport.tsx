import type { BaziChart } from '../types/bazi';

function sortWuxing(wuxing: BaziChart['wuxing']) {
  return (Object.entries(wuxing) as [string, number][])
    .sort(([, a], [, b]) => b - a);
}

function buildAnswer(chart: BaziChart, topic: string, question: string) {
  const sorted = sortWuxing(chart.wuxing);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const monthBranch = chart.month_pillar.branch.name;
  const monthPillar = chart.month_pillar.name;
  const dayPillar = chart.day_pillar.name;
  const relationCount = chart.dizhi_relations.length + chart.tiangan_relations.length;
  const currentDayun = chart.dayun[0];

  const topicLead: Record<string, { answer: string; focus: string[]; followups: string[] }> = {
    整体困惑: {
      answer: '这张盘不适合直接用“好坏”概括。更有效的切入点，是先看你在什么环境里容易发力、哪里容易卡住，再把问题落到事业、关系或阶段选择上继续追问。',
      focus: ['先看日主和月令，判断自己与环境的关系', '再看五行偏向，找容易重复出现的阻滞点', '最后看大运，确认问题在哪个阶段更容易被引动'],
      followups: ['现在最困扰你的具体场景是什么？', '这个问题从哪一年或哪个阶段开始明显？'],
    },
    事业方向: {
      answer: '事业问题不能只问“适合什么行业”。这张盘更应该先判断你适合靠稳定承压、表达输出、资源整合，还是靠规则体系获得位置，再结合现实履历选择路径。',
      focus: ['日主能否承担月令环境，是判断事业承压方式的入口', '五行偏显处常是惯用能力，也可能是过度消耗点', '大运决定某些能力在不同阶段是否更容易兑现'],
      followups: ['你现在的职业/专业背景是什么？', '你想比较的是换行业、换岗位，还是创业/自由职业？'],
    },
    感情关系: {
      answer: '感情问题要先看一个人在关系里的表达、压力和边界，而不是只看桃花。命盘能提示关系模式，但具体对象和相处史仍然很关键。',
      focus: ['日支与整体结构关系到亲密关系里的舒适区', '合冲刑害会提示关系里的牵动、拉扯或反复', '神煞只能作补充，不能单独断好坏'],
      followups: ['你问的是单身择偶、当前关系，还是婚姻稳定性？', '对方的大概情况和关系时间线是什么？'],
    },
    家庭人际: {
      answer: '家庭和人际问题要看压力来源、沟通方式和边界感。命盘能提供结构线索，但不应该替代真实沟通与现实判断。',
      focus: ['年柱、月柱更偏向早年环境和家庭系统线索', '十神关系能提示互动中的支持、控制或消耗', '冲合关系提示哪些主题容易被外部事件触发'],
      followups: ['你主要困扰的是父母、伴侣、子女，还是同事朋友？', '这段关系最近发生了什么具体事件？'],
    },
    性格模式: {
      answer: '性格不是一个固定标签，而是日主在环境压力下形成的惯性反应。这张盘更适合看你习惯如何应对压力、机会和关系。',
      focus: ['日主说明自我核心，月令说明默认环境压力', '五行偏向能提示惯用策略和盲区', '十神组合能把“性格”拆成表达、执行、规则、资源等面向'],
      followups: ['你想理解的是情绪模式、行动模式，还是人际模式？', '有没有一个你反复遇到的困扰？'],
    },
    阶段选择: {
      answer: '阶段选择要把原局倾向和大运节奏合起来看。当前版本能先给原局证据和大运入口，下一步需要结合具体年份、选项和现实约束。',
      focus: ['原局说明你适合怎样发力，不说明每一年都一样', '大运是阶段背景，适合用来比较十年尺度的变化', '具体选择还要看流年和现实资源'],
      followups: ['你现在面对哪几个选项？', '你希望判断的是今年、未来三年，还是下一步十年方向？'],
    },
  };

  const selected = topicLead[topic] || topicLead.整体困惑;

  return {
    title: `${topic}：围绕你的问题读这张盘`,
    userQuestion: question,
    directAnswer: selected.answer,
    focus: selected.focus,
    followups: selected.followups,
    evidence: [
      `日柱是 ${dayPillar}，日主为 ${chart.day_master.name}，五行属${chart.day_master.element}。它代表这张盘里“自己”的核心位置。`,
      `月柱是 ${monthPillar}，月令为 ${monthBranch}。它代表出生季节和外部环境，是判断能否承压、如何取用的第一入口。`,
      strongest && weakest
        ? `五行里 ${strongest[0]} 相对更明显，${weakest[0]} 相对更少。这里提示能量分布有侧重，解读时要看它如何流通，而不是简单说缺什么补什么。`
        : '五行分布需要结合天干、地支和藏干一起看，不能只看表面数量。',
      relationCount > 0
        ? `命盘里有 ${relationCount} 组干支互动。合冲刑害会改变某些五行的作用方式，是回答具体问题时的重要线索。`
        : '干支互动不复杂，说明可以先抓主线：日主、月令、五行流通，再看大运如何引动。',
      currentDayun
        ? `大运从约 ${chart.dayun_start_age} 岁起运，第一步为 ${currentDayun.stem}${currentDayun.branch}。阶段问题需要继续结合当前年龄所在大运判断。`
        : '大运是阶段判断的重要部分，当前结果需要结合年龄定位到具体运程。',
    ],
    cautions: [
      '这不是“定命”结论，而是把命盘当作理解问题的结构工具。',
      '不要单独用神煞判断好坏，神煞更像补充注释。',
      '如果要回答非常具体的问题，下一步需要结合流年、大运和真实处境。',
    ],
  };
}

export default function LearningReport({ chart, topic, question }: { chart: BaziChart; topic: string; question: string }) {
  const answer = buildAnswer(chart, topic, question);

  return (
    <section className="pillar-card overflow-hidden">
      <div className="border-b border-white/10 bg-white/[0.03] p-5">
        <div className="text-xs tracking-[0.2em] text-cyan-200/80">ANSWER REPORT</div>
        <h2 className="mt-2 text-xl font-semibold text-gray-50">{answer.title}</h2>
        <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50/90">
          <span className="text-cyan-200">你的问题：</span>{answer.userQuestion}
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-4">
          <div className="text-xs text-amber-200">先回应你的问题</div>
          <p className="mt-2 text-base leading-7 text-gray-100">{answer.directAnswer}</p>
          <div className="mt-4 grid gap-2">
            {answer.focus.map((item) => (
              <p key={item} className="rounded border border-amber-200/10 bg-black/10 px-3 py-2 text-xs leading-5 text-amber-50/80">
                {item}
              </p>
            ))}
          </div>
        </article>

        <aside className="rounded-lg border border-white/10 bg-black/10 p-4">
          <h3 className="text-sm font-semibold text-gray-100">继续追问时要补充</h3>
          <div className="mt-3 space-y-2">
            {answer.followups.map((item) => (
              <p key={item} className="text-sm leading-6 text-gray-300">{item}</p>
            ))}
          </div>
          <div className="mt-4 border-t border-white/10 pt-3 space-y-2">
            {answer.cautions.map((item) => (
              <p key={item} className="text-xs leading-5 text-gray-400">{item}</p>
            ))}
          </div>
        </aside>
      </div>

      <div className="px-5 pb-5">
        <h3 className="text-sm font-semibold text-gray-100">命盘依据</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {answer.evidence.map((item, index) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="text-xs text-cyan-200">依据 {index + 1}</div>
              <p className="mt-2 text-sm leading-6 text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
