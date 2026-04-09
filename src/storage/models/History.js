// src/storage/models/History.js
// This bot is designed by Shreyansh Tripathi.
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('History', HistorySchema);
