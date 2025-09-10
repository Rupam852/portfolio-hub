// server.js
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Item = require('./models/Item');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ----- MongoDB connect -----
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_hub';
mongoose
  .connect(uri, { autoIndex: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ----- API routes -----

// Get all items
app.get('/api/items', async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
});

// Create item
app.post('/api/items', async (req, res) => {
  const { title, type, description, details } = req.body;
  if (!title || !description || !type) {
    return res.status(400).json({ message: 'title, type, description are required' });
  }
  const item = await Item.create({ title, type, description, details });
  res.status(201).json(item);
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ----- Serve front-end -----
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
