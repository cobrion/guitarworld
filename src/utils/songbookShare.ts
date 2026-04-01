import type { Song } from '../types';

/**
 * Encode songs array into a URL-safe base64 string.
 * Uses the browser's CompressionStream API for smaller payloads.
 */
export async function encodeSongs(songs: Song[]): Promise<string> {
  const json = JSON.stringify(songs);
  const bytes = new TextEncoder().encode(json);

  // Try compression if available
  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('deflate');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = cs.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const compressed = new Uint8Array(
      chunks.reduce((acc, c) => acc + c.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }

    // Prefix with 'z:' to indicate compressed
    return 'z:' + arrayBufferToBase64Url(compressed);
  }

  // Fallback: plain base64
  return 'p:' + arrayBufferToBase64Url(bytes);
}

/**
 * Decode a URL-safe base64 string back into a songs array.
 */
export async function decodeSongs(encoded: string): Promise<Song[]> {
  let bytes: Uint8Array;

  if (encoded.startsWith('z:')) {
    // Compressed
    const compressed = base64UrlToArrayBuffer(encoded.slice(2));
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(compressed));
    writer.close();

    const chunks: Uint8Array[] = [];
    const reader = ds.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    bytes = new Uint8Array(
      chunks.reduce((acc, c) => acc + c.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
  } else if (encoded.startsWith('p:')) {
    bytes = base64UrlToArrayBuffer(encoded.slice(2));
  } else {
    throw new Error('Invalid share format');
  }

  const json = new TextDecoder().decode(bytes);
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('Invalid songbook data');
  return parsed;
}

/**
 * Generate a shareable URL with songs encoded in the hash.
 */
export async function generateShareUrl(songs: Song[]): Promise<string> {
  const encoded = await encodeSongs(songs);
  const base = window.location.origin + window.location.pathname;
  return `${base}#songbook=${encoded}`;
}

/**
 * Check if the current URL has shared songbook data.
 */
export function getSharedDataFromUrl(): string | null {
  const hash = window.location.hash;
  const prefix = '#songbook=';
  if (hash.startsWith(prefix)) {
    return hash.slice(prefix.length);
  }
  return null;
}

/**
 * Clear the shared data from the URL without a page reload.
 */
export function clearShareHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

// --- Base64URL helpers ---

function arrayBufferToBase64Url(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToArrayBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
