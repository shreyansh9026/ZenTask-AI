// src/utils/formatter.js - Discord message formatting helpers
// This bot is designed by Shreyansh Tripathi.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const COLORS = {
  success: 0x57f287,
  error: 0xed4245,
  info: 0x5865f2,
  warn: 0xfee75c,
  groq: 0xf55036,
};

function buildTaskListEmbed(tasks, username) {
  const embed = new EmbedBuilder()
    .setColor(tasks.length ? COLORS.info : COLORS.warn)
    .setTitle(`Tasks for ${username}`)
    .setTimestamp();

  if (tasks.length === 0) {
    embed.setDescription('You have **no tasks** yet.\nUse `!addtask <description>` or say "Add a task to..." to get started.');
    return embed;
  }

  const lines = tasks.map((task) => {
    const statusIcon = task.done ? '✅' : '⏳';
    const categoryTag = task.category ? `\`[${task.category}]\` ` : '';
    return `${statusIcon} **${task.id}.** ${categoryTag}${task.done ? `~~${task.text}~~` : task.text}`;
  });

  embed.setDescription(lines.join('\n'));
  embed.setFooter({
    text: `${tasks.filter((item) => !item.done).length} pending - ${tasks.filter((item) => item.done).length} done`,
  });
  return embed;
}

function buildTaskSelectMenu(tasks) {
  const pendingTasks = tasks.filter((t) => !t.done).slice(0, 25);
  if (pendingTasks.length === 0) return null;

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('task_mark_done_menu')
      .setPlaceholder('Select a task to mark as Done')
      .addOptions(
        pendingTasks.map((t) => ({
          label: t.text.slice(0, 100),
          description: `Task ID #${t.id}`,
          value: t.id.toString(),
        }))
      )
  );
}

function buildSimpleEmbed(color, title, description) {
  return new EmbedBuilder()
    .setColor(COLORS[color] ?? COLORS.info)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function buildGroqEmbed(userQuestion, answer) {
  return new EmbedBuilder()
    .setColor(COLORS.groq)
    .setAuthor({ name: 'GroqBot' })
    .setDescription(answer.length > 4000 ? answer.slice(0, 3997) + '...' : answer)
    .setFooter({ text: `Powered by Groq - Asked: ${userQuestion.slice(0, 80)}` })
    .setTimestamp();
}

function buildHelpEmbed(prefix) {
  const p = prefix;

  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle('GroqBot - Command Reference')
    .addFields(
      {
        name: 'Task Management',
        value: [
          `\`${p}addtask <text>\` - Add a task`,
          `\`${p}tasks\` - View your tasks`,
          `\`${p}donetask <#>\` - Mark task as done`,
          `\`${p}deletetask <#>\` - Remove a task`,
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Notes',
        value: [
          `\`${p}addnote <text>\` - Save a note`,
          `\`${p}notes\` - View your notes`,
          `\`${p}deletenote <#>\` - Delete a note`,
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Web Search',
        value: [
          `\`${p}search <query>\` - Real-time web search + Groq summary`,
          "Or ask naturally: *'who won yesterday's match?'*",
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Date & Time',
        value: `\`${p}time\` or \`${p}date\` - Get current date/time`,
        inline: false,
      },
      {
        name: 'Reminders',
        value: [
          `\`${p}remind me in 10 minutes to call Alice\``,
          `\`${p}remind me at 3:30 PM to submit report\``,
        ].join('\n'),
        inline: false,
      },
      {
        name: 'News & General AI',
        value: [
          `\`${p}news\` - Latest headlines via Groq`,
          'Or just ask anything - GroqBot will answer.',
        ].join('\n'),
        inline: false,
      },
      {
        name: 'Misc',
        value: `\`${p}ping\` - Latency | \`${p}help\` - This menu`,
        inline: false,
      },
    )
    .setFooter({ text: 'Natural language works for most commands too!' })
    .setTimestamp();
}

function buildTaskActionRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('task_list_refresh')
      .setLabel('Refresh')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('task_clear_all')
      .setLabel('Clear All')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger)
  );
}

function buildNoteActionRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('note_list_refresh')
      .setLabel('Refresh List')
      .setEmoji('🔄')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('note_clear_all')
      .setLabel('Remove All')
      .setEmoji('🧹')
      .setStyle(ButtonStyle.Danger)
  );
}

module.exports = {
  buildTaskListEmbed,
  buildSimpleEmbed,
  buildGroqEmbed,
  buildHelpEmbed,
  buildTaskActionRow,
  buildNoteActionRow,
  buildTaskSelectMenu,
};
