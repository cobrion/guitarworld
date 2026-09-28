/**
 * Client-side API utility for communicating with the GuitarWorld backend.
 */

const API_BASE = '/api';

// ──────────── PREFERENCES ────────────

export async function getPreference<T>(key: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}/preferences/${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('Failed to fetch preference');
  const data = await res.json();
  return data.value;
}

export async function setPreference<T>(key: string, value: T): Promise<void> {
  const res = await fetch(`${API_BASE}/preferences/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error('Failed to save preference');
}
