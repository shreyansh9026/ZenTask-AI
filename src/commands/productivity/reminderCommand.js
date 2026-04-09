// Reminder commands
// This bot is designed by Shreyansh Tripathi.
const db = require('../../storage/mongooseStore');
const { buildSimpleEmbed } = require('../../utils/formatter');
const { parseReminderText } = require('../../utils/intentParser');
const { logError, logInfo } = require('../../utils/logger');
const { sendReply } = require('../../utils/responseHelper');

const activeJobs = new Map();

async function restoreReminders(client) {
  const reminders = await db.getReminders();
  const now = Date.now();

  for (const reminder of reminders) {
    const remaining = reminder.fireAt - now;
    if (remaining <= 0) {
      fireReminder(client, reminder);
      await db.deleteReminder(reminder.id);
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
    await db.deleteReminder(reminder.id);
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

async function handleReminder(client, context, text) {
  const parsed = parseReminderText(text);
  const userId = context.author?.id || context.user?.id;

  if (!parsed) {
    const example = context.isCommand?.() 
      ? 'Try: `/remind when:in 10 minutes message:call Alice`'
      : 'Try: `!remind me in 10 minutes to call Alice`';
      
    return sendReply(context, `I could not understand the reminder time.\n${example}`);
  }

  const { minutes, label } = parsed;

  if (minutes < 1 || minutes > 10_080) {
    return sendReply(context, 'Reminder time must be between **1 minute** and **7 days**.');
  }

  const fireAt = Date.now() + minutes * 60_000;
  const reminder = await db.addReminder({
    userId: userId,
    channelId: context.channel.id,
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

  return sendReply(context, { embeds: [embed] });
}

module.exports = { handleReminder, restoreReminders };
