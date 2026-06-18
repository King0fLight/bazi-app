import type { BaziInput, BaziChart } from '../types/bazi';

const API_BASE = '/api';

export async function calculateBazi(input: BaziInput): Promise<BaziChart> {
  const res = await fetch(`${API_BASE}/bazi/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
