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
