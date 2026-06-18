import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';
import type { WuxingCount } from '../types/bazi';

const COLORS: Record<string, string> = {
  '木': '#22c55e',
  '火': '#ef4444',
  '土': '#eab308',
  '金': '#94a3b8',
  '水': '#3b82f6',
};

interface Props {
  wuxing: WuxingCount;
}

export default function WuxingChart({ wuxing }: Props) {
  const data = [
    { name: '木', value: wuxing.木 },
    { name: '火', value: wuxing.火 },
    { name: '土', value: wuxing.土 },
    { name: '金', value: wuxing.金 },
    { name: '水', value: wuxing.水 },
  ];
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="pillar-card p-4">
      <h3 className="text-sm text-gray-400 mb-3 text-center">五行力量</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 14 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, max + 1]} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[entry.name]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-3 mt-2 text-xs text-gray-400">
        {data.map(d => (
          <span key={d.name}>
            <span style={{ color: COLORS[d.name] }}>{d.name}</span>: {d.value}
          </span>
        ))}
      </div>
    </div>
  );
}
