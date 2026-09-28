const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://appuser:shawshank-app-2026@10.5.109.1:27017';
const DB_NAME = 'guitarworld';
const PORT = process.env.API_PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB: ${MONGO_URI}/${DB_NAME}`);

  // Ensure indexes
  await db.collection('preferences').createIndex({ key: 1 }, { unique: true });
}

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
