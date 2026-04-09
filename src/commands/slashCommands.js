// src/commands/slashCommands.js - Slash command definitions
// This bot is designed by Shreyansh Tripathi.
const { SlashCommandBuilder } = require('discord.js');

const commands = [
  // --- Task Commands ---
  new SlashCommandBuilder()
    .setName('task')
    .setDescription('Manage your personal tasks')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a new task to your list')
        .addStringOption((opt) =>
          opt.setName('description').setDescription('The task text').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName('list').setDescription('View your personal todo list')
    )
    .addSubcommand((sub) =>
      sub.setName('shared-list').setDescription('View the server-wide collaborative task list')
    )
    .addSubcommand((sub) =>
      sub
        .setName('done')
        .setDescription('Mark a task as completed')
        .addIntegerOption((opt) =>
          opt.setName('id').setDescription('The ID of the task').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Delete a task from your list')
        .addIntegerOption((opt) =>
          opt.setName('id').setDescription('The ID of the task').setRequired(true)
        )
    )
    .addSubcommand((sub) => sub.setName('clear').setDescription('Clear all your tasks')),

  // --- Note Commands ---
  new SlashCommandBuilder()
    .setName('note')
    .setDescription('Manage your personal notes')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Save a new quick note')
        .addStringOption((opt) =>
          opt.setName('content').setDescription('The note content').setRequired(true)
        )
    )
    .addSubcommand((sub) => sub.setName('view').setDescription('View all your saved notes'))
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('Delete a specific note')
        .addIntegerOption((opt) =>
          opt.setName('id').setDescription('The note index/ID').setRequired(true)
        )
    )
    .addSubcommand((sub) => sub.setName('clear').setDescription('Delete all your notes')),

  // --- AI Commands ---
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the ZenTask AI anything (supports images)')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Your question for the AI').setRequired(true)
    )
    .addAttachmentOption((opt) =>
      opt.setName('image').setDescription('Attach an image for the AI to see')
    ),

  new SlashCommandBuilder()
    .setName('ocr-tasks')
    .setDescription('Extract tasks from an image and add them to your list')
    .addAttachmentOption((opt) =>
      opt.setName('image').setDescription('Image containing a list of tasks').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search the web for information')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('What do you want to find?').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('news')
    .setDescription('Get the latest news updates'),

  // --- Utility Commands ---
  new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder for yourself')
    .addStringOption((opt) =>
      opt.setName('when').setDescription('Time (e.g., "in 5 mins", "at 5pm")').setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('message').setDescription('What should I remind you about?').setRequired(true)
    ),

  new SlashCommandBuilder().setName('ping').setDescription('Check the bot latency'),
  new SlashCommandBuilder().setName('time').setDescription('Check the current time'),
  new SlashCommandBuilder().setName('date').setDescription('Check today\'s date'),
  new SlashCommandBuilder().setName('settings').setDescription('Personalize your bot experience'),
  new SlashCommandBuilder().setName('safety').setDescription('Analyze the current channel for toxicity and safety'),
  new SlashCommandBuilder().setName('server-stats').setDescription('View advanced AI analytics for this server'),
  new SlashCommandBuilder().setName('help').setDescription('Learn how to use ZenTask AI'),
].map((command) => command.toJSON());

module.exports = { commands };
