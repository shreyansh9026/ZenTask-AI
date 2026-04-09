// src/storage/models/Note.js
// This bot is designed by Shreyansh Tripathi.
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  guildId: { type: String, index: true },
  noteId: { type: Number, required: true }, // Incremental per user
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to ensure uniqueness for noteId per user
NoteSchema.index({ userId: 1, noteId: 1 }, { unique: true });

module.exports = mongoose.model('Note', NoteSchema);
