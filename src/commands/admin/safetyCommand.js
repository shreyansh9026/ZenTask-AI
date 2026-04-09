// src/commands/admin/safetyCommand.js
// This bot is designed by Shreyansh Tripathi.
const { askGroq } = require('../../services/ai/groqService');
const { buildSimpleEmbed } = require('../../utils/formatter');
const { sendReply, deferReply } = require('../../utils/responseHelper');

async function handleSafetyAudit(interaction) {
  await deferReply(interaction);

  try {
    const messages = await interaction.channel.messages.fetch({ limit: 50 });
    const chatTranscript = messages
      .filter(m => !m.author.bot)
      .map(m => `${m.author.username}: ${m.content}`)
      .reverse()
      .join('\n');

    if (!chatTranscript) {
      return sendReply(interaction, 'Not enough recent human messages to analyze.');
    }

    const prompt = `Perform a "Safety and Sentiment Audit" on the following Discord chat transcript.
Identify:
1. Overall Server Vibe (Friendly, Toxic, Busy, etc.)
2. Any specific instances of toxicity, hate speech, or harassment.
3. Most helpful members.
4. Summary recommendation for moderators.

Transcript:
${chatTranscript.slice(0, 3000)}`;

    const analysis = await askGroq(prompt);

    const embed = buildSimpleEmbed(
      'info',
      '🛡️ AI Safety Audit',
      analysis
    );
    embed.setFooter({ text: 'AI analysis of the last 50 messages' });

    return sendReply(interaction, { embeds: [embed] });
  } catch (error) {
    console.error('Safety audit error:', error);
    return sendReply(interaction, 'Failed to perform safety audit.');
  }
}

module.exports = { handleSafetyAudit };
