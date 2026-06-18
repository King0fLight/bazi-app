import { useState } from 'react';
import type { Gender, ZiMode } from '../types/bazi';

interface Props {
  onCalculate: (input: {
    year: number; month: number; day: number;
    hour: number; minute: number;
    gender: Gender; zi_mode: ZiMode;
  }) => void;
  loading: boolean;
}

const SHICHEN_OPTIONS = [
  { label: '子时 (23:00-01:00)', value: 23 },
  { label: '丑时 (01:00-03:00)', value: 1 },
  { label: '寅时 (03:00-05:00)', value: 3 },
  { label: '卯时 (05:00-07:00)', value: 5 },
  { label: '辰时 (07:00-09:00)', value: 7 },
  { label: '巳时 (09:00-11:00)', value: 9 },
  { label: '午时 (11:00-13:00)', value: 11 },
  { label: '未时 (13:00-15:00)', value: 13 },
  { label: '申时 (15:00-17:00)', value: 15 },
  { label: '酉时 (17:00-19:00)', value: 17 },
  { label: '戌时 (19:00-21:00)', value: 19 },
  { label: '亥时 (21:00-23:00)', value: 21 },
];

export default function BaziForm({ onCalculate, loading }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(11);
  const [minute, setMinute] = useState(0);
  const [gender, setGender] = useState<Gender>('男');
  const [ziMode, setZiMode] = useState<ZiMode>('split');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({ year, month, day, hour, minute, gender, zi_mode: ziMode });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 justify-center">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">年</label>
        <input type="number" value={year} min={1900} max={2100}
          onChange={e => setYear(+e.target.value)} className="w-20" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">月</label>
        <input type="number" value={month} min={1} max={12}
          onChange={e => setMonth(+e.target.value)} className="w-16" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">日</label>
        <input type="number" value={day} min={1} max={31}
          onChange={e => setDay(+e.target.value)} className="w-16" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">时辰</label>
        <select value={hour} onChange={e => setHour(+e.target.value)} className="w-40">
          {SHICHEN_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">分</label>
        <input type="number" value={minute} min={0} max={59}
          onChange={e => setMinute(+e.target.value)} className="w-16" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">性别</label>
        <div className="flex gap-2">
          {(['男', '女'] as const).map(g => (
            <button key={g} type="button" onClick={() => setGender(g)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                gender === g
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">子时</label>
        <select value={ziMode} onChange={e => setZiMode(e.target.value as ZiMode)} className="w-40">
          <option value="split">早晚子时</option>
          <option value="whole">整子时归次日</option>
        </select>
      </div>
      <button type="submit" disabled={loading}
        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25">
        {loading ? '计算中...' : '排盘'}
      </button>
    </form>
  );
}
