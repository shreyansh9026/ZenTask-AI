// JSON storage helpers
// This bot is designed by Shreyansh Tripathi.
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const TASK_FILE = path.join(DATA_DIR, 'tasks.json');
const NOTE_FILE = path.join(DATA_DIR, 'notes.json');
const REMINDER_FILE = path.join(DATA_DIR, 'reminders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(filePath, defaultValue = {}) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getTasksForUser(userId) {
  const db = readJSON(TASK_FILE);
  return db[userId] || [];
}

function addTask(userId, text) {
  const db = readJSON(TASK_FILE);
  const tasks = db[userId] || [];
  const max = parseInt(process.env.MAX_TASKS_PER_USER || '20', 10);

  if (tasks.length >= max) {
    throw new Error(`You have reached the maximum of ${max} tasks. Please delete some first.`);
  }

  const task = {
    id: tasks.length ? Math.max(...tasks.map((item) => item.id)) + 1 : 1,
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  db[userId] = tasks;
  writeJSON(TASK_FILE, db);
  return task;
}

function deleteTask(userId, taskId) {
  const db = readJSON(TASK_FILE);
  const tasks = db[userId] || [];
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index === -1) {
    return null;
  }

  const [removed] = tasks.splice(index, 1);
  db[userId] = tasks;
  writeJSON(TASK_FILE, db);
  return removed;
}

function markTaskDone(userId, taskId) {
  const db = readJSON(TASK_FILE);
  const tasks = db[userId] || [];
  const task = tasks.find((item) => item.id === taskId);
  if (!task) {
    return null;
  }

  task.done = true;
  db[userId] = tasks;
  writeJSON(TASK_FILE, db);
  return task;
}

function clearTasks(userId) {
  const db = readJSON(TASK_FILE);
  db[userId] = [];
  writeJSON(TASK_FILE, db);
}

function getNotesForUser(userId) {
  const db = readJSON(NOTE_FILE);
  return db[userId] || [];
}

function addNote(userId, text) {
  const db = readJSON(NOTE_FILE);
  const notes = db[userId] || [];
  const max = 30;

  if (notes.length >= max) {
    throw new Error(`You have reached the maximum of ${max} notes. Please delete some first.`);
  }

  const note = {
    id: notes.length ? Math.max(...notes.map((item) => item.id)) + 1 : 1,
    text,
    createdAt: new Date().toISOString(),
  };

  notes.push(note);
  db[userId] = notes;
  writeJSON(NOTE_FILE, db);
  return note;
}

function deleteNote(userId, noteId) {
  const db = readJSON(NOTE_FILE);
  const notes = db[userId] || [];
  const index = notes.findIndex((note) => note.id === noteId);
  if (index === -1) {
    return null;
  }

  const [removed] = notes.splice(index, 1);
  db[userId] = notes;
  writeJSON(NOTE_FILE, db);
  return removed;
}

function clearNotes(userId) {
  const db = readJSON(NOTE_FILE);
  db[userId] = [];
  writeJSON(NOTE_FILE, db);
}

function getReminders() {
  return readJSON(REMINDER_FILE, []);
}

function addReminder(reminder) {
  const reminders = getReminders();
  reminder.id = Date.now();
  reminders.push(reminder);
  writeJSON(REMINDER_FILE, reminders);
  return reminder;
}

function deleteReminder(id) {
  const reminders = getReminders().filter((reminder) => reminder.id !== id);
  writeJSON(REMINDER_FILE, reminders);
}

module.exports = {
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
};
