// src/storage/models/Settings.js
// This bot is designed by Shreyansh Tripathi.
const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  timezone: { type: String, default: 'UTC' },
  preferredModel: { type: String, default: 'llama-3.3-70b-versatile' },
  language: { type: String, default: 'en' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Settings', SettingsSchema);
