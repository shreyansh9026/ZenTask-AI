// src/storage/models/OcrSession.js
// This bot is designed by Shreyansh Tripathi.
const mongoose = require('mongoose');

const OcrSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  tasks: [{ type: String }],
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Expire after 1 hour
});

module.exports = mongoose.model('OcrSession', OcrSessionSchema);
