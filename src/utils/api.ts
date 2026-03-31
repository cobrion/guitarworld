/**
 * Client-side API utility for communicating with the GuitarWorld backend.
 * Replaces all localStorage operations with REST API calls to MongoDB.
 */

import type { Song } from '../types';

const API_BASE = '/api';

// ──────────── SONGS ────────────

export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch(`${API_BASE}/songs`);
  if (!res.ok) throw new Error('Failed to fetch songs');
  return res.json();
}

export async function addSong(song: Song): Promise<void> {
  const res = await fetch(`${API_BASE}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  if (!res.ok) throw new Error('Failed to add song');
}

export async function updateSong(song: Song): Promise<void> {
  const res = await fetch(`${API_BASE}/songs/${encodeURIComponent(song.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  if (!res.ok) throw new Error('Failed to update song');
}

export async function deleteSong(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/songs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete song');
}

export async function bulkImportSongs(songs: Song[]): Promise<void> {
  const res = await fetch(`${API_BASE}/songs/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(songs),
  });
  if (!res.ok) throw new Error('Failed to import songs');
}

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
