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

// ──────────── CHORD SEARCH (Ultimate Guitar proxy) ────────────

/**
 * Extract chord positions from a UG chord line containing [ch]...[/ch] tags.
 * Returns an array of { chord, position } where position is the display column.
 */
function extractChordPositions(line) {
  const positions = [];
  const chordRegex = /\[ch\](.*?)\[\/ch\]/g;
  let displayPos = 0;
  let lastEnd = 0;
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    // Characters between last tag end and this tag start are display chars (spaces)
    const between = line.slice(lastEnd, match.index);
    displayPos += between.length;

    positions.push({ chord: match[1], position: displayPos });
    displayPos += match[1].length;
    lastEnd = match.index + match[0].length;
  }

  return positions;
}

/**
 * Check if a line is a chord line (contains [ch] tags).
 */
function isChordLine(line) {
  return /\[ch\]/.test(line);
}

/**
 * Merge a chord-position array into a lyrics line, producing a ChordPro line.
 */
function mergeChordsIntoLyrics(chordPositions, lyricsLine) {
  if (!lyricsLine || lyricsLine.trim() === '') {
    // Chord-only line (no lyrics below)
    return chordPositions.map(cp => `[${cp.chord}]`).join(' ');
  }

  // Sort by position descending so insertions don't shift indices
  const sorted = [...chordPositions].sort((a, b) => b.position - a.position);

  let result = lyricsLine;
  for (const cp of sorted) {
    const insertPos = Math.min(cp.position, result.length);
    result = result.slice(0, insertPos) + `[${cp.chord}]` + result.slice(insertPos);
  }

  return result;
}

/**
 * Parse Ultimate Guitar tab content into ChordPro format.
 */
function parseUGContentToChordPro(content, title, artist) {
  // Remove [tab] and [/tab] wrapper tags
  let text = content.replace(/\[tab\]/g, '').replace(/\[\/tab\]/g, '');

  const lines = text.split(/\r?\n/);
  const chordProLines = [];

  chordProLines.push(`{title: ${title}}`);
  chordProLines.push(`{artist: ${artist}}`);
  chordProLines.push('');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Section header: [Verse 1], [Chorus], etc. (not containing [ch])
    const sectionMatch = line.match(/^\[([^\]]+)\]\s*$/);
    if (sectionMatch && !isChordLine(line)) {
      chordProLines.push('');
      chordProLines.push(`{section: ${sectionMatch[1]}}`);
      i++;
      continue;
    }

    // Chord line
    if (isChordLine(line)) {
      const chordPositions = extractChordPositions(line);

      // Look ahead for a lyrics line
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const nextIsSectionOrChord = nextLine.match(/^\[([^\]]+)\]\s*$/) || isChordLine(nextLine);
      const nextIsBlank = nextLine.trim() === '';

      if (!nextIsSectionOrChord && !nextIsBlank && i + 1 < lines.length) {
        // Merge chords into the next lyrics line
        chordProLines.push(mergeChordsIntoLyrics(chordPositions, nextLine));
        i += 2;
      } else {
        // Chord-only line
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

    // Plain lyrics line (no chords)
    chordProLines.push(line);
    i++;
  }

  // Clean up excessive blank lines
  return chordProLines.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
}

// Decode HTML entities in UG's data-content attribute
function decodeHTMLEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

const UG_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// GET /api/chords/search — search for chords and return ChordPro text
app.get('/api/chords/search', async (req, res) => {
  try {
    const { artist, title } = req.query;
    if (!artist || !title) {
      return res.status(400).json({ error: 'artist and title query params are required' });
    }

    const query = `${artist} ${title}`;
    const searchUrl = `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(query)}&type[]=300`;

    // 1. Fetch search results
    const searchResponse = await fetch(searchUrl, { headers: UG_HEADERS });
    if (!searchResponse.ok) {
      console.error('UG search failed:', searchResponse.status, searchResponse.statusText);
      return res.status(502).json({ error: 'Failed to search for chords' });
    }

    const searchHtml = await searchResponse.text();

    // 2. Extract JSON data store from the HTML
    const storeMatch = searchHtml.match(/class="js-store"\s+data-content="([^"]+)"/);
    if (!storeMatch) {
      return res.status(404).json({ error: 'No chord results found. The search returned no data.' });
    }

    let storeData;
    try {
      storeData = JSON.parse(decodeHTMLEntities(storeMatch[1]));
    } catch (e) {
      console.error('Failed to parse UG search JSON:', e.message);
      return res.status(502).json({ error: 'Failed to parse search results' });
    }

    // 3. Find chord tabs in results
    const results = storeData?.store?.page?.data?.results;
    if (!results || !Array.isArray(results)) {
      return res.status(404).json({ error: 'No results found for this song' });
    }

    const chordResults = results.filter(r => r.type === 'Chords' && r.tab_url);
    if (chordResults.length === 0) {
      return res.status(404).json({ error: 'No chord tabs found for this song' });
    }

    // Sort by rating (best first)
    chordResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const bestResult = chordResults[0];

    // 4. Fetch the tab page
    const tabResponse = await fetch(bestResult.tab_url, { headers: UG_HEADERS });
    if (!tabResponse.ok) {
      console.error('UG tab fetch failed:', tabResponse.status);
      return res.status(502).json({ error: 'Failed to fetch the chord tab page' });
    }

    const tabHtml = await tabResponse.text();

    // 5. Extract tab content
    const tabStoreMatch = tabHtml.match(/class="js-store"\s+data-content="([^"]+)"/);
    if (!tabStoreMatch) {
      return res.status(502).json({ error: 'Failed to parse chord tab page' });
    }

    let tabData;
    try {
      tabData = JSON.parse(decodeHTMLEntities(tabStoreMatch[1]));
    } catch (e) {
      console.error('Failed to parse UG tab JSON:', e.message);
      return res.status(502).json({ error: 'Failed to parse chord tab data' });
    }

    const content = tabData?.store?.page?.data?.tab_view?.wiki_tab?.content;
    if (!content) {
      return res.status(404).json({ error: 'No chord content found in the tab' });
    }

    // 6. Convert to ChordPro
    const chordProText = parseUGContentToChordPro(content, title.trim(), artist.trim());

    // 7. Try to extract key from tab metadata
    const tabMeta = tabData?.store?.page?.data?.tab_view?.meta;
    const detectedKey = tabMeta?.tonality || null;

    res.json({
      chordProText,
      source: bestResult.tab_url,
      key: detectedKey,
      rating: bestResult.rating,
      votes: bestResult.votes,
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
