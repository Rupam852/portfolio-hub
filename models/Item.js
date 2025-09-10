// models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Project', 'Certificate', 'Skill'], required: true },
    description: { type: String, required: true },
    details: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', ItemSchema);
