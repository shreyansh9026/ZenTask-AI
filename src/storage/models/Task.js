// src/storage/models/Task.js
// This bot is designed by Shreyansh Tripathi.
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  guildId: { type: String, index: true }, // For collaborative tasks
  taskId: { type: Number, required: true }, // Incremental per user
  text: { type: String, required: true },
  category: { type: String, default: 'General' },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to ensure uniqueness for taskId per user
TaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('Task', TaskSchema);
