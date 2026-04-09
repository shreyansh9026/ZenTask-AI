// src/commands/ai/ocrTasks.js
// This bot is designed by Shreyansh Tripathi.
const { extractTasksFromImage } = require('../../services/ai/groqService');
const { buildSimpleEmbed } = require('../../utils/formatter');
const { sendReply, deferReply } = require('../../utils/responseHelper');
const db = require('../../storage/mongooseStore');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function handleOcrTasks(interaction, imageUrl) {
  await deferReply(interaction);

  const userId = interaction.user.id;

  try {
    const tasks = await extractTasksFromImage(imageUrl);

    if (!tasks || tasks.length === 0) {
      return sendReply(interaction, 'I could not find any clear tasks in that image. Please make sure the text is readable.');
    }

    // Save session
    await db.createOcrSession(userId, tasks);

    const taskList = tasks.map((t, i) => `**${i + 1}.** ${t}`).join('\n');
    
    const embed = buildSimpleEmbed(
      'info',
      'Tasks Detected',
      `I found the following items in your image:\n\n${taskList}\n\nWould you like to add them all to your task list?`
    );
    embed.setImage(imageUrl);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ocr_confirm_all')
        .setLabel('Add All Tasks')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('ocr_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    );

    return sendReply(interaction, { embeds: [embed], components: [row] });
  } catch (error) {
    console.error('OCR Error:', error);
    return sendReply(interaction, 'Failed to process the image for tasks.');
  }
}

async function handleOcrConfirm(interaction) {
  const userId = interaction.user.id;
  const session = await db.getOcrSession(userId);

  if (!session) {
    return interaction.reply({ content: 'Session expired. Please try uploading the image again.', ephemeral: true });
  }

  try {
    let addedCount = 0;
    for (const taskText of session.tasks) {
      try {
        await db.addTask(userId, taskText);
        addedCount++;
      } catch (e) {
        // Stop if max tasks reached
        break;
      }
    }

    await db.deleteOcrSession(userId);

    const embed = buildSimpleEmbed(
      'success',
      'Tasks Imported',
      `Successfully added **${addedCount}** tasks from the image to your todo list!`
    );

    return interaction.update({ embeds: [embed], components: [] });
  } catch (error) {
    console.error('Sync error:', error);
    return interaction.reply({ content: 'Failed to add tasks.', ephemeral: true });
  }
}

module.exports = { handleOcrTasks, handleOcrConfirm };
