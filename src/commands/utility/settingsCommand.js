// src/commands/utility/settingsCommand.js
// This bot is designed by Shreyansh Tripathi.
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../storage/mongooseStore');
const { buildSimpleEmbed } = require('../../utils/formatter');
const { sendReply } = require('../../utils/responseHelper');

async function handleSettings(interaction) {
  const userId = interaction.user.id;
  const settings = await db.getSettings(userId);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('ZenTask AI - User Settings')
    .setDescription('Personalize your bot experience.')
    .addFields(
      { name: '🌍 Timezone', value: `\`${settings.timezone}\``, inline: true },
      { name: '🤖 AI Model', value: `\`${settings.preferredModel}\``, inline: true },
      { name: '🌐 Language', value: `\`${settings.language}\``, inline: true }
    )
    .setFooter({ text: 'Use the menus below to update your preferences.' })
    .setTimestamp();

  const timezoneMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('settings_timezone')
      .setPlaceholder('Select your timezone')
      .addOptions([
        { label: 'UTC', value: 'UTC' },
        { label: 'India (IST)', value: 'Asia/Kolkata' },
        { label: 'US Eastern (EST)', value: 'America/New_York' },
        { label: 'US Pacific (PST)', value: 'America/Los_Angeles' },
        { label: 'London (GMT)', value: 'Europe/London' },
      ])
  );

  const modelMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('settings_model')
      .setPlaceholder('Select preferred AI model')
      .addOptions([
        { label: 'Llama 3.3 70B (Fast & Versatile)', value: 'llama-3.3-70b-versatile' },
        { label: 'Llama 3.1 8B (Ultra Fast)', value: 'llama-3.1-8b-instant' },
        { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
      ])
  );

  return sendReply(interaction, { embeds: [embed], components: [timezoneMenu, modelMenu] });
}

async function handleSettingsUpdate(interaction) {
  const { customId, values, user } = interaction;
  const userId = user.id;

  let update = {};
  if (customId === 'settings_timezone') {
    update = { timezone: values[0] };
  } else if (customId === 'settings_model') {
    update = { preferredModel: values[0] };
  }

  await db.updateSettings(userId, update);

  const embed = buildSimpleEmbed(
    'success',
    'Settings Updated',
    `Successfully updated your **${customId.split('_')[1]}** to \`${values[0]}\`.`
  );

  return interaction.update({ embeds: [embed], components: [] });
}

module.exports = { handleSettings, handleSettingsUpdate };
