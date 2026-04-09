// src/storage/mongooseStore.js - MongoDB implementation
// This bot is designed by Shreyansh Tripathi.
const mongoose = require('mongoose');
const Task = require('./models/Task');
const Note = require('./models/Note');
const Reminder = require('./models/Reminder');
const History = require('./models/History');
const OcrSession = require('./models/OcrSession');
const Settings = require('./models/Settings');

// Connection logic
async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not set in .env');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
}

// Tasks
async function getTasksForUser(userId, guildId = null) {
  const query = guildId ? { guildId } : { userId };
  const tasks = await Task.find(query).sort({ taskId: 1 });
  return tasks.map(t => ({ 
    id: t.taskId, 
    text: t.text, 
    category: t.category, 
    done: t.done 
  }));
}

async function addTask(userId, text, category = 'General', guildId = null) {
  const max = parseInt(process.env.MAX_TASKS_PER_USER || '20', 10);
  const count = await Task.countDocuments({ userId });

  if (count >= max) {
    throw new Error(`You have reached the maximum of ${max} tasks.`);
  }

  // Get next taskId
  const lastTask = await Task.findOne({ userId }).sort({ taskId: -1 });
  const nextId = lastTask ? lastTask.taskId + 1 : 1;

  const task = new Task({ userId, guildId, taskId: nextId, text, category });
  await task.save();
  return { id: task.taskId, text: task.text, category: task.category, done: task.done };
}

async function deleteTask(userId, taskId) {
  const removed = await Task.findOneAndDelete({ userId, taskId });
  return removed ? { text: removed.text } : null;
}

async function markTaskDone(userId, taskId) {
  const task = await Task.findOneAndUpdate(
    { userId, taskId },
    { done: true },
    { new: true }
  );
  return task ? { text: task.text } : null;
}

async function clearTasks(userId) {
  await Task.deleteMany({ userId });
}

// Notes
async function getNotesForUser(userId) {
  const notes = await Note.find({ userId }).sort({ noteId: 1 });
  return notes.map(n => ({ id: n.noteId, text: n.text }));
}

async function addNote(userId, text, guildId = null) {
  const max = 30;
  const count = await Note.countDocuments({ userId });

  if (count >= max) {
    throw new Error(`You have reached the maximum of ${max} notes.`);
  }

  const lastNote = await Note.findOne({ userId }).sort({ noteId: -1 });
  const nextId = lastNote ? lastNote.noteId + 1 : 1;

  const note = new Note({ userId, guildId, noteId: nextId, text });
  await note.save();
  return { id: note.noteId, text: note.text };
}

async function deleteNote(userId, noteId) {
  const removed = await Note.findOneAndDelete({ userId, noteId });
  return removed ? { text: removed.text } : null;
}

async function clearNotes(userId) {
  await Note.deleteMany({ userId });
}

// Reminders
async function getReminders() {
  return await Reminder.find({});
}

async function addReminder(data) {
  const reminder = new Reminder(data);
  await reminder.save();
  return reminder;
}

async function deleteReminder(id) {
  // Check if id is valid ObjectId or we use our own ID
  // In Reminder model we didn't specify a custom Number ID, so we use _id
  await Reminder.findByIdAndDelete(id);
}

// History
async function getChatHistory(userId) {
  const doc = await History.findOne({ userId });
  return doc ? doc.messages : [];
}

async function saveChatHistory(userId, history) {
  await History.findOneAndUpdate(
    { userId },
    { 
      messages: history.slice(-10),
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );
}

// OCR Sessions
async function createOcrSession(userId, tasks) {
  await OcrSession.findOneAndDelete({ userId });
  const session = new OcrSession({ userId, tasks });
  await session.save();
  return session;
}

async function getOcrSession(userId) {
  return await OcrSession.findOne({ userId });
}

async function deleteOcrSession(userId) {
  await OcrSession.findOneAndDelete({ userId });
}

// User Settings
async function getSettings(userId) {
  let settings = await Settings.findOne({ userId });
  if (!settings) {
    settings = new Settings({ userId });
    await settings.save();
  }
  return settings;
}

async function updateSettings(userId, updates) {
  return await Settings.findOneAndUpdate(
    { userId },
    { ...updates, updatedAt: new Date() },
    { upsert: true, new: true }
  );
}

module.exports = {
  connect,
  getTasksForUser,
  addTask,
  deleteTask,
  markTaskDone,
  clearTasks,
  getNotesForUser,
  addNote,
  deleteNote,
  clearNotes,
  getReminders,
  addReminder,
  deleteReminder,
  getChatHistory,
  saveChatHistory,
  createOcrSession,
  getOcrSession,
  deleteOcrSession,
  getSettings,
  updateSettings,
};
