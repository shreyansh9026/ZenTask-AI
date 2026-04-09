// scripts/deploy-commands.js - Register slash commands with Discord
// This bot is designed by Shreyansh Tripathi.
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { commands } = require('../src/commands/slashCommands');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('CRITICAL ERROR: DISCORD_TOKEN or DISCORD_CLIENT_ID missing in .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  const guildId = '1489795803684929690'; // Specific guild for instant updates
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // 1. Deploy Global
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Successfully reloaded global commands.');

    // 2. Deploy to Guild (Instant)
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`Successfully reloaded guild commands for ${guildId}.`);
    }

  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
})();
