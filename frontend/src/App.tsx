import { useState } from 'react';
import { Analytics, track } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { BaziChart } from './types/bazi';
import { calculateBazi } from './api/bazi';
import BaziForm from './components/BaziForm';
import PillarGrid from './components/PillarGrid';
import WuxingChart from './components/WuxingChart';
import DayunTimeline from './components/DayunTimeline';
import ShenshaList from './components/ShenshaList';
import Relations from './components/Relations';
import ClassicsGuide from './components/ClassicsGuide';
import ReadingPath from './components/ReadingPath';

export default function App() {
  const [chart, setChart] = useState<BaziChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (input: Parameters<typeof calculateBazi>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await calculateBazi(input);
      setChart(result);
      track('bazi_calculate', {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        minute: input.minute,
        gender: input.gender,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算失败，请检查输入');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
          八字排盘
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          四柱八字 · 十神 · 大运 · 神煞 · 五行
        </p>
      </header>

      {/* Input Form */}
      <section className="max-w-3xl mx-auto mb-8">
        <BaziForm onCalculate={handleCalculate} loading={loading} />
      </section>

      {error && (
        <div className="max-w-3xl mx-auto mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-center text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {chart && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Date Info */}
          <div className="text-center text-sm text-gray-400">
            <span>{chart.solar_date}</span>
            <span className="mx-3">|</span>
            <span>农历 {chart.lunar_date}</span>
            <span className="mx-3">|</span>
            <span>属{chart.shengxiao}</span>
            <span className="mx-3">|</span>
            <span>{chart.gender}命</span>
          </div>

          {/* Reading Path */}
          <ReadingPath chart={chart} />

          {/* Four Pillars */}
          <PillarGrid
            pillars={[chart.year_pillar, chart.month_pillar, chart.day_pillar, chart.hour_pillar]}
            kongwang={chart.kongwang}
            dayMaster={chart.day_master}
          />

          {/* Wuxing Chart */}
          <WuxingChart wuxing={chart.wuxing} />

          {/* Classics Guide */}
          <ClassicsGuide chart={chart} />

          {/* Dayun Timeline */}
          <DayunTimeline dayun={chart.dayun} startAge={chart.dayun_start_age} />

          {/* Relations */}
          <Relations
            dizhiRelations={chart.dizhi_relations}
            tianganRelations={chart.tiangan_relations}
          />

          {/* Shensha */}
          <ShenshaList shensha={chart.shensha} />
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 mt-12 pb-8">
        基于传统子平命理学 · 仅供学习研究参考
      </footer>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
