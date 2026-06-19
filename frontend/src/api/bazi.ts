import type { BaziInput, BaziChart } from '../types/bazi';

const API_BASE = '/api';

export async function calculateBazi(input: BaziInput): Promise<BaziChart> {
  const { question: _question, topic: _topic, ...payload } = input;
  const res = await fetch(`${API_BASE}/bazi/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
