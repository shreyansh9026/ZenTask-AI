// Task commands
// This bot is designed by Shreyansh Tripathi.
const db = require('../../storage/jsonStore');
const { buildTaskListEmbed, buildSimpleEmbed } = require('../../utils/formatter');

async function handleAddTask(message, taskText) {
  if (!taskText || taskText.trim().length < 2) {
    return message.reply('Please provide a task description. Example: `!addtask Buy groceries`');
  }

  try {
    const task = db.addTask(message.author.id, taskText.trim());
    const embed = buildSimpleEmbed(
      'success',
      'Task Added',
      `**#${task.id}** - ${task.text}\n\nUse \`!tasks\` to view all your tasks.`
    );
    return message.reply({ embeds: [embed] });
  } catch (error) {
    return message.reply(error.message);
  }
}

async function handleViewTasks(message) {
  const tasks = db.getTasksForUser(message.author.id);
  const embed = buildTaskListEmbed(tasks, message.author.username);
  return message.reply({ embeds: [embed] });
}

async function handleDeleteTask(message, taskId) {
  if (!taskId || isNaN(taskId)) {
    return message.reply('Please provide a valid task ID. Example: `!deletetask 2`');
  }

  const removed = db.deleteTask(message.author.id, Number(taskId));
  if (!removed) {
    return message.reply(`No task with ID **#${taskId}** found. Use \`!tasks\` to see your list.`);
  }

  const embed = buildSimpleEmbed('success', 'Task Deleted', `Removed: ~~${removed.text}~~`);
  return message.reply({ embeds: [embed] });
}

async function handleDoneTask(message, taskId) {
  if (!taskId || isNaN(taskId)) {
    return message.reply('Please provide a valid task ID. Example: `!donetask 2`');
  }

  const task = db.markTaskDone(message.author.id, Number(taskId));
  if (!task) {
    return message.reply(`No task with ID **#${taskId}** found. Use \`!tasks\` to see your list.`);
  }

  const embed = buildSimpleEmbed('success', 'Task Completed!', `Great job! ~~${task.text}~~ is marked as done.`);
  return message.reply({ embeds: [embed] });
}

async function handleClearTasks(message) {
  const tasks = db.getTasksForUser(message.author.id);
  if (tasks.length === 0) {
    return message.reply('You have no tasks to clear.');
  }

  db.clearTasks(message.author.id);
  const embed = buildSimpleEmbed('warn', 'All Tasks Cleared', `Removed **${tasks.length}** task(s). Fresh start!`);
  return message.reply({
    content: `Cleared ${tasks.length} task(s).`,
    embeds: [embed],
  });
}

module.exports = { handleAddTask, handleViewTasks, handleDeleteTask, handleDoneTask, handleClearTasks };
