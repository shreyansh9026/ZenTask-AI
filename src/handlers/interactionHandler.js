// src/handlers/interactionHandler.js - Slash command router
// This bot is designed by Shreyansh Tripathi.
const { appendLogLine, formatError, logError } = require('../utils/logger');
const taskCmds = require('../commands/productivity/taskCommands');
const noteCmds = require('../commands/productivity/noteCommands');
const { handleReminder } = require('../commands/productivity/reminderCommand');
const { handleNews } = require('../commands/ai/newsCommand');
const { handleGeneralQA } = require('../commands/ai/generalQA');
const { handleSearch } = require('../commands/ai/searchCommand');
const { handleOcrTasks, handleOcrConfirm } = require('../commands/ai/ocrTasks');
const { handleSettings, handleSettingsUpdate } = require('../commands/utility/settingsCommand');
const { handleDatetime } = require('../commands/utility/datetimeCommand');
const { handleSafetyAudit } = require('../commands/admin/safetyCommand');
const { buildSimpleEmbed, buildHelpEmbed } = require('../utils/formatter');

async function handleInteraction(client, interaction) {
  if (!interaction.isCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) {
    console.log(`Interaction received but not handled: ${interaction.type}`);
    return;
  }

  if (interaction.isButton()) {
    return handleButtonInteraction(client, interaction);
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'task_mark_done_menu') {
      return await taskCmds.handleDoneTask(interaction, interaction.values[0]);
    }
    return handleSettingsUpdate(interaction);
  }

  const { commandName, options, user } = interaction;
  console.log(`[Interaction] /${commandName} triggered by ${user.tag}`);
  appendLogLine(`Slash command: /${commandName} from ${user.tag}`);

  try {
    switch (commandName) {
      // --- Task Group ---
      case 'task': {
        const sub = options.getSubcommand();
        if (sub === 'add') {
          const text = options.getString('description');
          return await taskCmds.handleAddTask(interaction, text);
        }
        if (sub === 'list') {
          return await taskCmds.handleViewTasks(interaction);
        }
        if (sub === 'done') {
          const id = options.getInteger('id');
          return await taskCmds.handleDoneTask(interaction, id);
        }
        if (sub === 'delete') {
          const id = options.getInteger('id');
          return await taskCmds.handleDeleteTask(interaction, id);
        }
        if (sub === 'clear') {
          return await taskCmds.handleClearTasks(interaction);
        }
        break;
      }

      // --- Note Group ---
      case 'note': {
        const sub = options.getSubcommand();
        if (sub === 'add') {
          const text = options.getString('content');
          return await noteCmds.handleAddNote(interaction, text);
        }
        if (sub === 'view') {
          return await noteCmds.handleViewNotes(interaction);
        }
        if (sub === 'delete') {
          const id = options.getInteger('id');
          return await noteCmds.handleDeleteNote(interaction, id);
        }
        if (sub === 'clear') {
          return await noteCmds.handleClearNotes(interaction);
        }
        break;
      }

      // --- AI Commands ---
      case 'ask': {
        const query = options.getString('query');
        const attachment = options.getAttachment('image');
        return await handleGeneralQA(interaction, query, attachment?.url);
      }

      case 'ocr-tasks': {
        const attachment = options.getAttachment('image');
        return await handleOcrTasks(interaction, attachment.url);
      }

      case 'search': {
        const query = options.getString('query');
        return await handleSearch(interaction, query);
      }

      case 'news': {
        return await handleNews(interaction);
      }

      // --- Utility ---
      case 'remind': {
        const when = options.getString('when');
        const msg = options.getString('message');
        const fullArg = `${when} to ${msg}`;
        return await handleReminder(client, interaction, fullArg);
      }

      case 'time':
      case 'date': {
        return handleDatetime(interaction);
      }

      case 'settings': {
        return await handleSettings(interaction);
      }

      case 'safety': {
        return await handleSafetyAudit(interaction);
      }

      case 'ping': {
        const latency = Date.now() - interaction.createdTimestamp;
        const embed = buildSimpleEmbed(
          'success',
          'Pong!',
          `Bot latency: **${latency}ms** | API: **${Math.round(client.ws.ping)}ms**`
        );
        return interaction.reply({ embeds: [embed] });
      }

      case 'help': {
        const prefix = process.env.BOT_PREFIX || '!';
        const embed = buildHelpEmbed(prefix);
        return interaction.reply({ embeds: [embed] });
      }

      default:
        await interaction.reply({ content: 'Unknown command', ephemeral: true });
    }
  } catch (error) {
    logError(`Interaction error (/${commandName}):`, error);
    const embed = buildSimpleEmbed(
      'error',
      'System Error',
      'Something went wrong while executing this command.'
    );
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed] }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
    }
  }
}

async function handleButtonInteraction(client, interaction) {
  const { customId, user } = interaction;
  appendLogLine(`Button clicked: ${customId} by ${user.tag}`);

  try {
    switch (customId) {
      case 'task_list_refresh':
        return await taskCmds.handleViewTasks(interaction);
      
      case 'task_clear_all':
        return await taskCmds.handleClearTasks(interaction);

      case 'note_list_refresh':
        return await noteCmds.handleViewNotes(interaction);

      case 'note_clear_all':
        return await noteCmds.handleClearNotes(interaction);

      case 'ocr_confirm_all':
        return await handleOcrConfirm(interaction);

      case 'ocr_cancel':
        return await interaction.update({ content: 'OCR Import cancelled.', embeds: [], components: [] });

      default:
        await interaction.reply({ content: 'Unknown button', ephemeral: true });
    }
  } catch (error) {
    logError(`Button error (${customId}):`, error);
  }
}

module.exports = { handleInteraction };
