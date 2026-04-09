// Task commands
// This bot is designed by Shreyansh Tripathi.
const db = require('../../storage/mongooseStore');
const { getSuggestedCategory } = require('../../services/ai/groqService');
const { buildSimpleEmbed, buildTaskListEmbed, buildTaskActionRow, buildTaskSelectMenu } = require('../../utils/formatter');
const { sendReply } = require('../../utils/responseHelper');

function getUserData(context) {
  const user = context.author || context.user;
  return { id: user.id, username: user.username };
}

async function handleAddTask(context, text) {
  const { id } = getUserData(context);
  const guildId = context.guild?.id || null;
  
  try {
    const category = await getSuggestedCategory(text);
    const task = await db.addTask(id, text, category, guildId);
    
    const embed = buildSimpleEmbed(
      'success',
      'Task Added',
      `**[${task.category}]** ${task.text}`
    );
    return sendReply(context, { embeds: [embed] });
  } catch (error) {
    return sendReply(context, buildSimpleEmbed('error', 'Limit Reached', error.message));
  }
}

async function handleViewTasks(context) {
  const isShared = context.options?.getSubcommand() === 'shared-list';
  const { id, username } = getUserData(context);
  const guildId = isShared ? context.guild?.id : null;
  
  if (isShared && !context.guild) {
    return sendReply(context, 'Shared lists are only available inside servers.');
  }

  const tasks = await db.getTasksForUser(id, guildId);
  const title = isShared ? `Shared Project: ${context.guild.name}` : `${username}'s Tasks`;
  const embed = buildTaskListEmbed(tasks, title);
  
  const components = [buildTaskActionRow()];
  const selectMenu = buildTaskSelectMenu(tasks);
  if (selectMenu) components.push(selectMenu);

  return sendReply(context, { embeds: [embed], components });
}

async function handleDeleteTask(context, taskId) {
  const { id } = getUserData(context);
  
  if (!taskId || isNaN(taskId)) {
    return sendReply(context, 'Please provide a valid task ID. Example: `/task delete id: 2`');
  }

  const removed = await db.deleteTask(id, Number(taskId));
  if (!removed) {
    return sendReply(context, `No task with ID **#${taskId}** found. Use \`/task list\` to see your list.`);
  }

  const embed = buildSimpleEmbed('success', 'Task Deleted', `Removed: ~~${removed.text}~~`);
  return sendReply(context, { embeds: [embed] });
}

async function handleDoneTask(context, taskId) {
  const { id } = getUserData(context);
  
  if (!taskId || isNaN(taskId)) {
    return sendReply(context, 'Please provide a valid task ID. Example: `/task done id: 2`');
  }

  const task = await db.markTaskDone(id, Number(taskId));
  if (!task) {
    return sendReply(context, `No task with ID **#${taskId}** found. Use \`/task list\` to see your list.`);
  }

  const embed = buildSimpleEmbed('success', 'Task Completed!', `Great job! ~~${task.text}~~ is marked as done.`);
  return sendReply(context, { embeds: [embed] });
}

async function handleClearTasks(context) {
  const { id } = getUserData(context);
  const tasks = await db.getTasksForUser(id);
  
  if (tasks.length === 0) {
    return sendReply(context, 'You have no tasks to clear.');
  }

  await db.clearTasks(id);
  const embed = buildSimpleEmbed('warn', 'All Tasks Cleared', `Removed **${tasks.length}** task(s). Fresh start!`);
  return sendReply(context, {
    content: `Cleared ${tasks.length} task(s).`,
    embeds: [embed],
  });
}

module.exports = { handleAddTask, handleViewTasks, handleDeleteTask, handleDoneTask, handleClearTasks };
