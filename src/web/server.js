// src/web/server.js - Web Dashboard Server
// This bot is designed by Shreyansh Tripathi.
const express = require('express');
const path = require('path');
const Task = require('../storage/models/Task');
const Note = require('../storage/models/Note');
const History = require('../storage/models/History');

function startWebServer(port = 3000) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));

  // Statistics route
  app.get('/', async (req, res) => {
    try {
      // Helper to run query or return 0 if DB is down
      const safeQuery = async (query) => {
        try { return await query; } catch { return 0; }
      };

      const taskCount = await safeQuery(Task.countDocuments());
      const noteCount = await safeQuery(Note.countDocuments());
      const historyCount = await safeQuery(History.countDocuments());
      const completedTasks = await safeQuery(Task.countDocuments({ done: true }));

      res.render('index', {
        stats: {
          taskCount,
          noteCount,
          historyCount,
          completedTasks,
          efficiency: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
        }
      });
    } catch (error) {
      console.error('Core Dashboard Error:', error);
      res.render('index', {
        stats: {
          taskCount: 0,
          noteCount: 0,
          historyCount: 0,
          completedTasks: 0,
          efficiency: 0
        }
      });
    }
  });

  // Basic API for tasks (Optional)
  app.get('/api/stats', async (req, res) => {
    const taskCount = await Task.countDocuments();
    res.json({ tasks: taskCount });
  });

  app.listen(port, () => {
    console.log(`[Web] Dashboard running at http://localhost:${port}`);
  });
}

module.exports = { startWebServer };
