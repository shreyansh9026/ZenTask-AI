// src/handlers/messageHandler.js - Central routing logic
// This bot is designed by Shreyansh Tripathi.
const { buildSimpleEmbed, buildHelpEmbed } = require('../utils/formatter');
const { detectIntentRuleBased } = require('../utils/intentParser');
const { classifyIntent } = require('../services/ai/groqService');
const { restoreReminders, handleReminder } = require('../commands/productivity/reminderCommand');
const { appendLogLine, formatError, logError } = require('../utils/logger');

const taskCmds = require('../commands/productivity/taskCommands');
const noteCmds = require('../commands/productivity/noteCommands');

const { handleDatetime } = require('../commands/utility/datetimeCommand');
const { handleNews } = require('../commands/ai/newsCommand');
const { handleGeneralQA } = require('../commands/ai/generalQA');
const { handleSearch } = require('../commands/ai/searchCommand');

const PREFIX = (process.env.BOT_PREFIX || '!').toLowerCase();
const SHORT_GREETING = /^(hi|hello|hey|yo|sup|hola)\b/i;

let remindersRestored = false;

function writeDebugLog(message) {
  appendLogLine(message);
}

function isDirectMention(client, message) {
  return Boolean(client.user && message.mentions?.users?.has(client.user.id));
}

function shouldHandleGeneral(client, message, content) {
  return (
    content.startsWith(PREFIX) ||
    !message.guild ||
    isDirectMention(client, message) ||
    content.includes('?') ||
    content.length >= 10 ||
    SHORT_GREETING.test(content)
  );
}

function buildGeneralQuery(client, message, content) {
  let query = content;

  if (query.startsWith(PREFIX)) {
    query = query.slice(PREFIX.length).trim();
  }

  if (client.user) {
    const mentionPattern = new RegExp(`<@!?${client.user.id}>`, 'g');
    query = query.replace(mentionPattern, '').trim();
  }

  if (!query && isDirectMention(client, message)) {
    return null;
  }

  return query;
}

async function handleMessage(client, message) {
  try {
    // ── Step 1: Rule-based intent detection ──────────────────────────────────
    const content = message.content.trim();
    
    // Check for voice notes/audio attachments
    if (message.attachments.size > 0 && !content) {
      const audio = message.attachments.find(a => 
        a.contentType?.includes('audio/') || 
        a.name?.endsWith('.ogg') || 
        a.name?.endsWith('.wav') || 
        a.name?.endsWith('.mp3')
      );

      if (audio) {
        return await handleVoiceNote(client, message, audio);
      }
    }

    if (!content && message.attachments.size === 0) return;

    // Restore reminders once on first message
    if (!remindersRestored) {
      await restoreReminders(client);
      remindersRestored = true;
    }

    let intentData = detectIntentRuleBased(content);

    if (!intentData) {
      if (content.length >= 3 || isDirectMention(client, message) || !message.guild) {
        const aiIntent = await classifyIntent(content);
        intentData = { intent: aiIntent, arg: content };
      } else {
        writeDebugLog(`Ignored short unmatched message from ${message.author.tag}.`);
        return;
      }
    }

    const { intent, arg } = intentData;
    writeDebugLog(`Intent routed for ${message.author.tag}: ${intent}`);

    switch (intent) {
      case 'task_add':
        return await taskCmds.handleAddTask(message, arg);

      case 'task_view':
        return await taskCmds.handleViewTasks(message);

      case 'task_clear':
        return await taskCmds.handleClearTasks(message);

      case 'task_delete':
        return await taskCmds.handleDeleteTask(message, arg);

      case 'task_done':
        return await taskCmds.handleDoneTask(message, arg);

      case 'note_add':
        return await noteCmds.handleAddNote(message, arg);

      case 'note_view':
        return await noteCmds.handleViewNotes(message);

      case 'note_clear':
        return await noteCmds.handleClearNotes(message);

      case 'note_delete':
        return await noteCmds.handleDeleteNote(message, arg);

      case 'search':
        return await handleSearch(message, arg ?? content);

      case 'datetime':
        return handleDatetime(message);

      case 'reminder':
        return await handleReminder(client, message, arg ?? content);

      case 'news':
        return await handleNews(message);

      case 'help': {
        const embed = buildHelpEmbed(PREFIX);
        return message.reply({ embeds: [embed] });
      }

      case 'ping': {
        const latency = Date.now() - message.createdTimestamp;
        const embed = buildSimpleEmbed(
          'success',
          'Pong!',
          `Bot latency: **${latency}ms** | API: **${Math.round(client.ws.ping)}ms**`
        );
        return message.reply({ embeds: [embed] });
      }

      case 'general':
      default: {
        if (!shouldHandleGeneral(client, message, content)) {
          writeDebugLog(`Skipped general reply for ${message.author.tag}: message did not meet reply rules.`);
          return;
        }

        const query = buildGeneralQuery(client, message, content);
        if (!query) {
          const embed = buildHelpEmbed(PREFIX);
          return message.reply({ embeds: [embed] });
        }

        return await handleGeneralQA(message, query);
      }
    }
  } catch (error) {
    logError('Error while handling message:', error);
    writeDebugLog(`Error while handling message: ${formatError(error)}`);

    const embed = buildSimpleEmbed(
      'error',
      'Unexpected Error',
      'Something went wrong while processing that message. Please try again.'
    );

    return message.reply({ embeds: [embed] }).catch(() => {});
  }
}

async function handleVoiceNote(client, message, attachment) {
  try {
    const axios = require('axios');
    const { transcribeAudio } = require('../services/ai/groqService');
    
    await message.channel.sendTyping();
    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const transcription = await transcribeAudio(buffer, attachment.name);
    
    if (!transcription || transcription.trim().length < 3) {
      return message.reply('I heard some audio, but I couldn\'t make out any clear text.');
    }

    const embed = buildSimpleEmbed(
      'info',
      'Voice Transcription',
      `🗣️ **I heard:** "${transcription}"\n\nI'm adding this to your tasks...`
    );
    await message.reply({ embeds: [embed] });

    return await taskCmds.handleAddTask(message, transcription);
  } catch (error) {
    logError('Voice transcription error:', error);
    return message.reply('Something went wrong while listening to your voice note.');
  }
}

module.exports = { handleMessage };
