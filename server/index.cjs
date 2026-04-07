const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://appuser:shawshank-app-2026@10.5.109.1:27017';
const DB_NAME = 'guitarworld';
const PORT = process.env.API_PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB: ${MONGO_URI}/${DB_NAME}`);

  // Ensure indexes
  await db.collection('songs').createIndex({ id: 1 }, { unique: true });
  await db.collection('preferences').createIndex({ key: 1 }, { unique: true });
}

// ──────────── SONGS ────────────

// GET /api/songs — fetch all songs
app.get('/api/songs', async (_req, res) => {
  try {
    const songs = await db.collection('songs').find({}).toArray();
    // Remove MongoDB _id, return clean Song objects
    const cleaned = songs.map(({ _id, ...rest }) => rest);
    res.json(cleaned);
  } catch (err) {
    console.error('GET /api/songs error:', err);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// POST /api/songs — add a song
app.post('/api/songs', async (req, res) => {
  try {
    const song = req.body;
    if (!song || !song.id) {
      return res.status(400).json({ error: 'Song must have an id' });
    }
    await db.collection('songs').insertOne(song);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /api/songs error:', err);
    res.status(500).json({ error: 'Failed to add song' });
  }
});

// POST /api/songs/bulk — import multiple songs (upsert)
app.post('/api/songs/bulk', async (req, res) => {
  try {
    const songs = req.body;
    if (!Array.isArray(songs)) {
      return res.status(400).json({ error: 'Expected array of songs' });
    }
    const ops = songs.map((song) => ({
      updateOne: {
        filter: { id: song.id },
        update: { $set: song },
        upsert: true,
      },
    }));
    if (ops.length > 0) {
      await db.collection('songs').bulkWrite(ops);
    }
    res.json({ ok: true, count: ops.length });
  } catch (err) {
    console.error('POST /api/songs/bulk error:', err);
    res.status(500).json({ error: 'Failed to bulk import songs' });
  }
});

// PUT /api/songs/:id — update a song
app.put('/api/songs/:id', async (req, res) => {
  try {
    const song = req.body;
    const result = await db.collection('songs').replaceOne(
      { id: req.params.id },
      song,
      { upsert: true }
    );
    res.json({ ok: true, matched: result.matchedCount });
  } catch (err) {
    console.error('PUT /api/songs/:id error:', err);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// DELETE /api/songs/:id — delete a song
app.delete('/api/songs/:id', async (req, res) => {
  try {
    await db.collection('songs').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/songs/:id error:', err);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

// ──────────── PREFERENCES ────────────

// GET /api/preferences/:key — get a preference
app.get('/api/preferences/:key', async (req, res) => {
  try {
    const doc = await db.collection('preferences').findOne({ key: req.params.key });
    if (!doc) {
      return res.json({ key: req.params.key, value: null });
    }
    res.json({ key: doc.key, value: doc.value });
  } catch (err) {
    console.error('GET /api/preferences/:key error:', err);
    res.status(500).json({ error: 'Failed to fetch preference' });
  }
});

// PUT /api/preferences/:key — set a preference
app.put('/api/preferences/:key', async (req, res) => {
  try {
    const { value } = req.body;
    await db.collection('preferences').updateOne(
      { key: req.params.key },
      { $set: { key: req.params.key, value } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/preferences/:key error:', err);
    res.status(500).json({ error: 'Failed to save preference' });
  }
});

// ──────────── CHORD SEARCH (Cifraclub proxy) ────────────

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Slugify a string for Cifraclub URL format.
 * "Bruce Springsteen" → "bruce-springsteen"
 */
function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract chord content from Cifraclub HTML.
 * Cifraclub wraps chords in <b> tags inside a <pre class="cifra_cnt ..."> element.
 * Returns plain text with chords in [Chord] notation and section headers preserved.
 */
function extractCifraContent(html) {
  // Find the <pre> block containing chords (may or may not have class="cifra_cnt")
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  if (!preMatch) return null;

  let content = preMatch[1];

  // Convert <b>Chord</b> → [Chord] (Cifraclub wraps chords in bold tags)
  content = content.replace(/<b>([^<]+)<\/b>/g, '[$1]');

  // Remove any remaining HTML tags
  content = content.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  content = content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");

  return content;
}

/**
 * Detect the key from Cifraclub's page content.
 * Cifraclub includes "tom: Bb" or similar near the top of the cifra content.
 */
function extractKeyFromCifra(content) {
  const keyMatch = content.match(/^\s*tom:\s*([A-G][b#]?m?)\s*$/m);
  return keyMatch ? keyMatch[1] : null;
}

/**
 * Known section header names used by chord sites.
 */
const SECTION_NAMES = new Set([
  'intro', 'verse', 'pre-chorus', 'prechorus', 'chorus', 'bridge',
  'solo', 'outro', 'interlude', 'instrumental', 'break', 'coda',
  'refrain', 'hook', 'riff', 'ending', 'tag',
]);

/**
 * Check if a bracket content looks like a section header (not a chord).
 * Matches "Chorus", "Verse 1", "Bridge 2", "Solo", etc.
 */
function isSectionName(text) {
  const base = text.replace(/\s*\d+\s*$/, '').toLowerCase().trim();
  return SECTION_NAMES.has(base);
}

/**
 * Check if a line is a chord-only line (contains [Chord] markers but no/minimal lyrics).
 * A chord line has chord markers and the text between them is mostly whitespace.
 * Lines that are section headers (e.g. [Chorus]) are NOT chord lines.
 */
function isChordLine(line) {
  if (!/\[/.test(line)) return false;
  // If the line is a single bracket with a section name, it's not a chord line
  const singleBracket = line.match(/^\s*\[([^\]]+)\]\s*$/);
  if (singleBracket && isSectionName(singleBracket[1])) return false;
  const withoutChords = line.replace(/\[[^\]]+\]/g, '');
  return withoutChords.trim().length === 0;
}

/**
 * Extract chord positions from a chord line with [Chord] markers.
 * Returns array of { chord, position } where position is display column.
 */
function extractChordPositions(line) {
  const positions = [];
  const chordRegex = /\[([^\]]+)\]/g;
  let displayPos = 0;
  let lastEnd = 0;
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    const between = line.slice(lastEnd, match.index);
    displayPos += between.length;
    positions.push({ chord: match[1], position: displayPos });
    displayPos += match[1].length;
    lastEnd = match.index + match[0].length;
  }

  return positions;
}

/**
 * Merge chord positions into a lyrics line, producing a ChordPro line.
 * Adjusts for leading whitespace differences between chord and lyrics lines
 * (Cifraclub often adds extra leading whitespace to chord lines for centering).
 */
function mergeChordsIntoLyrics(chordPositions, lyricsLine) {
  if (!lyricsLine || lyricsLine.trim() === '') {
    return chordPositions.map(cp => `[${cp.chord}]`).join(' ');
  }

  // Calculate leading whitespace offset: chord lines often have extra indentation
  const lyricsIndent = lyricsLine.match(/^(\s*)/)[0].length;
  const firstChordPos = chordPositions.length > 0
    ? Math.min(...chordPositions.map(cp => cp.position))
    : 0;
  const offset = Math.max(0, firstChordPos - lyricsIndent);

  // Adjust positions and sort descending so insertions don't shift indices
  const adjusted = chordPositions
    .map(cp => ({ chord: cp.chord, position: Math.max(0, cp.position - offset) }))
    .sort((a, b) => b.position - a.position);

  let result = lyricsLine;
  for (const cp of adjusted) {
    const insertPos = Math.min(cp.position, result.length);
    result = result.slice(0, insertPos) + `[${cp.chord}]` + result.slice(insertPos);
  }
  return result;
}

/**
 * Check if a line looks like guitar tablature (e.g., E|---5---8---|)
 */
function isTabLine(line) {
  return /^[EBGDAe]\|[-0-9hp\/\\~()|x\s]+\|?\s*$/.test(line.trim());
}

/**
 * Convert Cifraclub extracted content into ChordPro format.
 * Cifraclub uses "chords above lyrics" positional format with [Chord] markers
 * and [Section] headers in square brackets on their own line.
 */
function cifraToChordPro(content, title, artist) {
  const lines = content.split('\n');
  const chordProLines = [];

  chordProLines.push(`{title: ${title}}`);
  chordProLines.push(`{artist: ${artist}}`);
  chordProLines.push('');

  let i = 0;
  // Skip leading metadata (tom: Bb, etc.)
  while (i < lines.length && (lines[i].trim() === '' || /^\s*tom:/i.test(lines[i]))) {
    i++;
  }

  while (i < lines.length) {
    const line = lines[i];

    // Skip tab lines (guitar tablature notation)
    if (isTabLine(line)) {
      i++;
      continue;
    }

    // Section header: [Verse], [Chorus], [Bridge], [Solo], etc.
    const sectionMatch = line.match(/^\s*\[([A-Za-z][^\]]*)\]\s*$/);
    if (sectionMatch && isSectionName(sectionMatch[1])) {
      chordProLines.push('');
      chordProLines.push(`{section: ${sectionMatch[1]}}`);
      i++;
      continue;
    }

    // Chord line (contains [Chord] markers with only whitespace between)
    if (isChordLine(line)) {
      const chordPositions = extractChordPositions(line);

      // Look ahead for a lyrics line to merge into
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const nextIsBlank = nextLine.trim() === '';
      const nextIsChordLine = isChordLine(nextLine);
      const nextIsSection = /^\[([A-Za-z][^\]]*)\]\s*$/.test(nextLine);
      const nextIsTab = isTabLine(nextLine);

      if (!nextIsBlank && !nextIsChordLine && !nextIsSection && !nextIsTab && i + 1 < lines.length) {
        chordProLines.push(mergeChordsIntoLyrics(chordPositions, nextLine));
        i += 2;
      } else {
        chordProLines.push(mergeChordsIntoLyrics(chordPositions, ''));
        i++;
      }
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      chordProLines.push('');
      i++;
      continue;
    }

    // Plain lyrics line (no chords above it — already consumed by chord merge)
    chordProLines.push(line);
    i++;
  }

  return chordProLines.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
}

// GET /api/chords/search — search for chords via Cifraclub and return ChordPro text
app.get('/api/chords/search', async (req, res) => {
  try {
    const { artist, title } = req.query;
    if (!artist || !title) {
      return res.status(400).json({ error: 'artist and title query params are required' });
    }

    // Build Cifraclub URL: https://www.cifraclub.com.br/{artist-slug}/{title-slug}/
    const artistSlug = slugify(artist.trim());
    const titleSlug = slugify(title.trim());
    const cifraUrl = `https://www.cifraclub.com.br/${artistSlug}/${titleSlug}/`;

    console.log(`Fetching chords from: ${cifraUrl}`);

    const response = await fetch(cifraUrl, { headers: FETCH_HEADERS });
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: `No chords found for "${title}" by "${artist}" on Cifraclub` });
      }
      console.error('Cifraclub fetch failed:', response.status, response.statusText);
      return res.status(502).json({ error: 'Failed to fetch chords from Cifraclub' });
    }

    const html = await response.text();

    // Extract chord content from the page
    const content = extractCifraContent(html);
    if (!content) {
      return res.status(404).json({ error: 'No chord content found on the page' });
    }

    // Detect key
    const detectedKey = extractKeyFromCifra(content);

    // Convert to ChordPro
    const chordProText = cifraToChordPro(content, title.trim(), artist.trim());

    res.json({
      chordProText,
      source: cifraUrl,
      key: detectedKey,
    });
  } catch (err) {
    console.error('GET /api/chords/search error:', err);
    res.status(500).json({ error: 'Failed to fetch chords. Please try again.' });
  }
});

// ──────────── START ────────────

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`GuitarWorld API server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
