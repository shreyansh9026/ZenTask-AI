// src/storage/models/Reminder.js
// This bot is designed by Shreyansh Tripathi.
const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  label: { type: String, required: true },
  fireAt: { type: Date, required: true, index: true }, // Index for fast polling
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reminder', ReminderSchema);
