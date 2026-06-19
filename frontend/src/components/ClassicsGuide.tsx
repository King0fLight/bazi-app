import type { BaziChart } from '../types/bazi';

interface GuideItem {
  title: string;
  source: string;
  reason: string;
  focus: string;
}

interface PlainReading {
  headline: string;
  summary: string;
  plainPoints: string[];
}

interface TermItem {
  term: string;
  meaning: string;
}

const MONTH_GUIDES: Record<string, GuideItem> = {
  寅: {
    title: '春令木气',
    source: '穷通宝鉴 / 子平真诠',
    reason: '月令在寅，先看春木生发之气，再看日主能否承接月令。',
    focus: '重点查调候、格局成败、木旺是否需要火土金水配合。',
  },
  卯: {
    title: '仲春专气',
    source: '穷通宝鉴 / 滴天髓阐微',
    reason: '月令在卯，木气纯粹，格局判断要看泄秀、制化和根气。',
    focus: '重点查木旺取用、印比成势、财官食伤是否得力。',
  },
  辰: {
    title: '春末湿土',
    source: '五行大义 / 穷通宝鉴',
    reason: '月令在辰，木余气入湿土，需兼看土中水木与调候。',
    focus: '重点查湿土、库气、杂气月令和用神转换。',
  },
  巳: {
    title: '初夏火旺',
    source: '穷通宝鉴 / 渊海子平',
    reason: '月令在巳，火势渐旺，先看燥热与日主承受能力。',
    focus: '重点查火旺调候、金水润燥、格局是否过燥。',
  },
  午: {
    title: '盛夏火势',
    source: '穷通宝鉴 / 滴天髓阐微',
    reason: '月令在午，火气最盛，命局冷暖燥湿会直接影响取用。',
    focus: '重点查调候优先级、火土成势、金水是否受伤。',
  },
  未: {
    title: '夏末燥土',
    source: '五行大义 / 三命通会',
    reason: '月令在未，火余气藏于燥土，需兼看库气与五行流通。',
    focus: '重点查燥土、木火土局、财官印食的通关关系。',
  },
  申: {
    title: '初秋金气',
    source: '子平真诠 / 穷通宝鉴',
    reason: '月令在申，金气当令，需看日主与官杀财印的成格关系。',
    focus: '重点查金旺取用、杀印相生、食伤制杀与格局清浊。',
  },
  酉: {
    title: '仲秋专金',
    source: '滴天髓阐微 / 子平真诠',
    reason: '月令在酉，金气纯粹，格局重点在清、纯、制、化。',
    focus: '重点查金旺成局、官杀清杂、财印是否相碍。',
  },
  戌: {
    title: '秋末燥土',
    source: '三命通会 / 五行精纪',
    reason: '月令在戌，金余气归燥土，火库之象也要一并参考。',
    focus: '重点查燥土火库、刑冲开库、五行偏枯与通关。',
  },
  亥: {
    title: '初冬水旺',
    source: '穷通宝鉴 / 滴天髓阐微',
    reason: '月令在亥，水势初旺，寒暖调候和日主根气都很关键。',
    focus: '重点查寒湿、用火暖局、木火通明或金水成势。',
  },
  子: {
    title: '仲冬专水',
    source: '穷通宝鉴 / 渊海子平',
    reason: '月令在子，水气最盛，先看寒暖，再看日主强弱。',
    focus: '重点查调候用火、印比成势、财官是否被寒水困住。',
  },
  丑: {
    title: '冬末湿土',
    source: '五行大义 / 三命通会',
    reason: '月令在丑，寒湿土藏金水，需看暖局与库气开启。',
    focus: '重点查湿土、寒局、刑冲库气和格局转换。',
  },
};

const ELEMENT_GUIDES: Record<string, GuideItem> = {
  木: {
    title: '日主属木',
    source: '滴天髓阐微 / 五行大义',
    reason: '木日主重在根气、生发、疏土与得火泄秀。',
    focus: '重点查木之旺衰、曲直之性、金克与水生是否有情。',
  },
  火: {
    title: '日主属火',
    source: '穷通宝鉴 / 滴天髓阐微',
    reason: '火日主重在明暗、寒暖、木生与水制。',
    focus: '重点查火势是否有源、有制、有归处。',
  },
  土: {
    title: '日主属土',
    source: '五行大义 / 子平真诠',
    reason: '土日主重在燥湿厚薄，以及能否承载财官印食。',
    focus: '重点查湿土燥土、通关、库气和五行中和。',
  },
  金: {
    title: '日主属金',
    source: '滴天髓阐微 / 穷通宝鉴',
    reason: '金日主重在刚柔、火炼、水洗、土生与木财。',
    focus: '重点查金旺是否需火炼，金弱是否需土生。',
  },
  水: {
    title: '日主属水',
    source: '穷通宝鉴 / 五行大义',
    reason: '水日主重在源流、寒暖、土堤与木泄。',
    focus: '重点查水势泛滥或枯竭，以及火土木的调节。',
  },
};

function buildGuides(chart: BaziChart): GuideItem[] {
  const monthBranch = chart.month_pillar.branch.name;
  const dayElement = chart.day_master.element;
  const wuxingEntries = Object.entries(chart.wuxing) as [string, number][];
  const sortedWuxing = [...wuxingEntries].sort(([, a], [, b]) => b - a);
  const strongest = sortedWuxing[0];
  const weakest = sortedWuxing[sortedWuxing.length - 1];

  const guides: GuideItem[] = [];

  if (MONTH_GUIDES[monthBranch]) {
    guides.push(MONTH_GUIDES[monthBranch]);
  }

  if (ELEMENT_GUIDES[dayElement]) {
    guides.push(ELEMENT_GUIDES[dayElement]);
  }

  if (strongest && weakest) {
    guides.push({
      title: '五行偏枯',
      source: '五行大义 / 滴天髓阐微',
      reason: `当前五行统计中 ${strongest[0]} 最显，${weakest[0]} 最弱。`,
      focus: '重点查旺者宜泄宜制、弱者宜生宜扶，以及是否形成流通。',
    });
  }

  if (chart.dizhi_relations.length > 0 || chart.tiangan_relations.length > 0) {
    guides.push({
      title: '干支结构',
      source: '三命通会 / 五行精纪',
      reason: '命局出现合、冲、刑、害、破或天干合化，结构会影响格局成败。',
      focus: '重点查合冲是否改变月令气势、是否引动库气或破坏用神。',
    });
  }

  if (chart.shensha.length > 0) {
    guides.push({
      title: '神煞辅助',
      source: '渊海子平 / 三命通会',
      reason: '神煞可作为辅助信息，但应服从五行旺衰与格局主线。',
      focus: '重点查吉凶神煞出现位置，不宜脱离原局强弱单独判断。',
    });
  }

  return guides.slice(0, 5);
}

function buildPlainReading(chart: BaziChart): PlainReading {
  const monthBranch = chart.month_pillar.branch.name;
  const monthStem = chart.month_pillar.stem.name;
  const dayStem = chart.day_master.name;
  const dayElement = chart.day_master.element;
  const wuxingEntries = Object.entries(chart.wuxing) as [string, number][];
  const sortedWuxing = [...wuxingEntries].sort(([, a], [, b]) => b - a);
  const strongest = sortedWuxing[0];
  const weakest = sortedWuxing[sortedWuxing.length - 1];
  const relationCount = chart.dizhi_relations.length + chart.tiangan_relations.length;

  const headline = `${dayStem}日主，生在${monthStem}${monthBranch}月，先从季节气势看整体倾向`;

  const plainPoints = [
    `这张盘的核心不是先看神煞，而是先看“日主”在出生月份有没有力量。日主代表自己，月令代表出生季节的大环境。`,
    strongest && weakest
      ? `五行统计里，${strongest[0]}相对更明显，${weakest[0]}相对更少。白话说，就是命局的能量不是平均分布，解读时要看过强的部分如何泄、制，偏弱的部分如何补、扶。`
      : '五行分布需要结合四柱和藏干一起看，不能只看表面天干地支。',
    relationCount > 0
      ? `命局里出现了${relationCount}组干支关系。合、冲、刑、害这类关系，像是命盘内部的“互动”，会让某些五行被加强、牵动或破坏。`
      : '当前干支关系不算复杂，可以先按月令、日主、五行流通这条主线读。',
    `经典书的作用，是帮你判断“为什么这样取用”。这版先给研读方向，下一版可以接入 PDF 原文，直接给出处和页码。`,
  ];

  return {
    headline,
    summary: `${dayElement}日主的判断，要放回${monthBranch}月的季节气势里看，再结合五行偏强偏弱、干支互动和神煞辅助。`,
    plainPoints,
  };
}

function buildTerms(chart: BaziChart): TermItem[] {
  const terms: TermItem[] = [
    {
      term: '日主',
      meaning: `日柱天干，也就是这张盘里代表“自己”的核心符号。当前日主是 ${chart.day_master.name}，五行属${chart.day_master.element}。`,
    },
    {
      term: '月令',
      meaning: `月柱地支，代表出生季节的主气。它像命局的天气和土壤，会强烈影响日主强弱和取用方向。当前月令是 ${chart.month_pillar.branch.name}。`,
    },
    {
      term: '五行偏枯',
      meaning: '五行不是越平均越好，关键看能不能流通。某一行太旺，要看能不能泄、制、化；某一行太弱，要看是否需要生扶。',
    },
    {
      term: '调候',
      meaning: '先看寒、暖、燥、湿是否失衡。比如冬月多重视火来暖局，夏月多重视水来润燥。',
    },
    {
      term: '格局',
      meaning: '把十神、月令、透干、根气组合起来看命局主线。它不是一个标签，而是一套判断结构是否成立的方法。',
    },
    {
      term: '神煞',
      meaning: '神煞可以补充细节，但不能单独决定吉凶。更稳的顺序是先看五行旺衰和格局，再参考神煞。',
    },
  ];

  if (chart.dizhi_relations.length > 0 || chart.tiangan_relations.length > 0) {
    terms.push({
      term: '合冲刑害',
      meaning: '干支之间的互动关系。合可能聚合或牵制，冲可能引动或破坏，具体要看它影响的是喜用还是忌神。',
    });
  }

  return terms;
}

export default function ClassicsGuide({ chart }: { chart: BaziChart }) {
  const guides = buildGuides(chart);
  const reading = buildPlainReading(chart);
  const terms = buildTerms(chart);

  return (
    <section className="pillar-card p-5">
      <div className="flex flex-col gap-1 text-center mb-4">
        <h3 className="text-base font-semibold text-amber-200">古籍依据线索</h3>
        <p className="text-xs text-gray-400">
          先把当前命盘对应到哪些经典问题，后续可接入本地 PDF 返回原文出处
        </p>
      </div>

      <div className="mb-5 rounded-lg border border-amber-300/20 bg-gradient-to-br from-amber-300/10 to-white/5 p-4">
        <div className="text-xs text-amber-300 mb-2">依据总览</div>
        <h4 className="text-base font-semibold text-gray-100 leading-7">{reading.headline}</h4>
        <p className="mt-2 text-sm text-gray-300 leading-6">{reading.summary}</p>
        <div className="mt-3 grid gap-2">
          {reading.plainPoints.map((point) => (
            <p key={point} className="rounded border border-white/10 bg-black/10 px-3 py-2 text-xs leading-5 text-gray-300">
              {point}
            </p>
          ))}
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {guides.map((guide) => (
          <div key={`${guide.title}-${guide.source}`} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h4 className="text-sm font-medium text-gray-100">{guide.title}</h4>
              <span className="text-xs text-amber-300">{guide.source}</span>
            </div>
            <p className="mt-2 text-sm text-gray-300 leading-6">{guide.reason}</p>
            <p className="mt-1 text-xs text-gray-500 leading-5">{guide.focus}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-xs text-gray-400 mb-2 text-center">报告里这些词怎么影响判断</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {terms.map((item) => (
            <div key={item.term} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="text-sm font-medium text-gray-100">{item.term}</div>
              <p className="mt-1 text-xs leading-5 text-gray-400">{item.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs leading-5 text-amber-100/80">
        本版先给经典线索；下一步可把 26 本八字 PDF 提取成索引，让解惑报告直接返回原文片段、书名与页码。
      </div>
    </section>
  );
}
