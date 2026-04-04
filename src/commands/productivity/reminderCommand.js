// Reminder commands
// This bot is designed by Shreyansh Tripathi.
const db = require('../../storage/jsonStore');
const { buildSimpleEmbed } = require('../../utils/formatter');
const { parseReminderText } = require('../../utils/intentParser');
const { logError, logInfo } = require('../../utils/logger');

const activeJobs = new Map();

function restoreReminders(client) {
  const reminders = db.getReminders();
  const now = Date.now();

  for (const reminder of reminders) {
    const remaining = reminder.fireAt - now;
    if (remaining <= 0) {
      fireReminder(client, reminder);
      db.deleteReminder(reminder.id);
    } else {
      scheduleJob(client, reminder);
    }
  }

  if (reminders.length) {
    logInfo(`Restored ${reminders.length} reminder(s) from storage.`);
  }
}

function scheduleJob(client, reminder) {
  const delay = reminder.fireAt - Date.now();
  if (delay <= 0) {
    return;
  }

  const timeout = setTimeout(async () => {
    await fireReminder(client, reminder);
    db.deleteReminder(reminder.id);
    activeJobs.delete(reminder.id);
  }, delay);

  activeJobs.set(reminder.id, timeout);
}

async function fireReminder(client, reminder) {
  try {
    const user = await client.users.fetch(reminder.userId);
    const channel = await client.channels.fetch(reminder.channelId);
    const embed = buildSimpleEmbed(
      'warn',
      'Reminder!',
      `Hey ${user}! You asked me to remind you:\n> **${reminder.label}**`
    );
    await channel.send({ content: `<@${reminder.userId}>`, embeds: [embed] });
  } catch (error) {
    logError('Reminder delivery failed:', error.message);
  }
}

async function handleReminder(client, message, text) {
  const parsed = parseReminderText(text);

  if (!parsed) {
    return message.reply(
      'I could not understand the reminder time.\n' +
      'Try: `!remind me in 10 minutes to call Alice` or `!remind me at 3:30 PM to submit report`'
    );
  }

  const { minutes, label } = parsed;

  if (minutes < 1 || minutes > 10_080) {
    return message.reply('Reminder time must be between **1 minute** and **7 days**.');
  }

  const fireAt = Date.now() + minutes * 60_000;
  const reminder = db.addReminder({
    userId: message.author.id,
    channelId: message.channel.id,
    label,
    fireAt,
  });

  scheduleJob(client, reminder);

  const readableTime = minutes < 60
    ? `${minutes} minute(s)`
    : `${Math.round((minutes / 60) * 10) / 10} hour(s)`;

  const embed = buildSimpleEmbed(
    'success',
    'Reminder Set!',
    `I will remind you in **${readableTime}**:\n> **${label}**`
  );

  return message.reply({ embeds: [embed] });
}

module.exports = { handleReminder, restoreReminders };
